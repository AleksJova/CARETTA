import { describe, it, expect } from 'vitest';
import { upcomingAppointments } from './upcomingAppointments';
import type { Appointment } from '@/types';

const TODAY = '2026-06-01';
// Early in the day, so every "today" appointment still counts as upcoming
// unless a test overrides it.
const NOW = '00:00';

function appt(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'apt',
    doctorId: 'doc-1',
    patientId: 'pat-demo',
    date: '2026-06-10',
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed',
    ...overrides,
  };
}

describe('upcomingAppointments', () => {
  it("returns the patient's confirmed future appointments soonest-first", () => {
    const list = [
      appt({ id: 'c', date: '2026-08-04', startTime: '09:00' }),
      appt({ id: 'a', date: '2026-06-01', startTime: '11:00' }),
      appt({ id: 'b', date: '2026-06-22', startTime: '08:00' }),
    ];
    const result = upcomingAppointments(list, 'pat-demo', TODAY, NOW);
    expect(result.map((a) => a.id)).toEqual(['a', 'b', 'c']);
  });

  it('sorts same-day appointments by start time', () => {
    const list = [
      appt({ id: 'late', date: TODAY, startTime: '15:00' }),
      appt({ id: 'early', date: TODAY, startTime: '09:00' }),
    ];
    expect(
      upcomingAppointments(list, 'pat-demo', TODAY, NOW).map((a) => a.id)
    ).toEqual(['early', 'late']);
  });

  it('excludes completed appointments', () => {
    const list = [appt({ id: 'x', status: 'completed' })];
    expect(upcomingAppointments(list, 'pat-demo', TODAY, NOW)).toEqual([]);
  });

  it('excludes past appointments but keeps today', () => {
    const list = [
      appt({ id: 'past', date: '2026-05-31' }),
      appt({ id: 'today', date: TODAY }),
    ];
    expect(
      upcomingAppointments(list, 'pat-demo', TODAY, NOW).map((a) => a.id)
    ).toEqual(['today']);
  });

  it("excludes today's appointments whose start time has already passed", () => {
    const list = [
      appt({ id: 'earlier', date: TODAY, startTime: '09:00' }),
      appt({ id: 'later', date: TODAY, startTime: '15:00' }),
    ];
    // At 13:00 the 09:00 slot is past; the 15:00 slot is still upcoming.
    expect(
      upcomingAppointments(list, 'pat-demo', TODAY, '13:00').map((a) => a.id)
    ).toEqual(['later']);
  });

  it("excludes other patients' appointments", () => {
    const list = [appt({ id: 'other', patientId: 'pat-other' })];
    expect(upcomingAppointments(list, 'pat-demo', TODAY, NOW)).toEqual([]);
  });
});
