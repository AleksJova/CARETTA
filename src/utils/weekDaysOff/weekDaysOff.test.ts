import { describe, expect, it } from 'vitest';
import { weekDaysOff, weekDaysOffList } from './weekDaysOff';
import type { Doctor } from '@/types';

function doctor(id: string, daysOff: string[], name = id): Doctor {
  return {
    id,
    name,
    specialty: 'Cardiology',
    shift: 'morning',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    daysOff,
  };
}

// Anchor inside the week of Mon 2026-05-25 .. Sat 2026-05-30.
const ANCHOR = '2026-05-27'; // a Wednesday

describe('weekDaysOff', () => {
  it('counts day-off entries within the anchored clinic week', () => {
    const doctors = [doctor('a', ['2026-05-25', '2026-05-29'])];
    expect(weekDaysOff(doctors, ANCHOR)).toBe(2);
  });

  it('excludes day-off entries outside the week', () => {
    const doctors = [
      doctor('a', ['2026-05-18', '2026-06-01']), // prior + next week
    ];
    expect(weekDaysOff(doctors, ANCHOR)).toBe(0);
  });

  it('counts entries across multiple doctors, including the same date twice', () => {
    const doctors = [
      doctor('a', ['2026-05-26']),
      doctor('b', ['2026-05-26', '2026-05-28']),
    ];
    expect(weekDaysOff(doctors, ANCHOR)).toBe(3);
  });

  it('returns 0 when there are no days off', () => {
    expect(weekDaysOff([doctor('a', [])], ANCHOR)).toBe(0);
  });
});

describe('weekDaysOffList', () => {
  it('lists this-week entries with doctor name and date, soonest first', () => {
    const doctors = [
      doctor('d2', ['2026-05-29'], 'Dr. Zhang'),
      doctor('d1', ['2026-05-26'], 'Dr. Adams'),
    ];
    expect(weekDaysOffList(doctors, ANCHOR)).toEqual([
      { doctorId: 'd1', doctorName: 'Dr. Adams', date: '2026-05-26' },
      { doctorId: 'd2', doctorName: 'Dr. Zhang', date: '2026-05-29' },
    ]);
  });

  it('excludes entries outside the anchored week', () => {
    const doctors = [doctor('d1', ['2026-05-18', '2026-06-01'], 'Dr. Adams')];
    expect(weekDaysOffList(doctors, ANCHOR)).toEqual([]);
  });

  it('sorts same-day entries by doctor name', () => {
    const doctors = [
      doctor('d2', ['2026-05-26'], 'Dr. Zhang'),
      doctor('d1', ['2026-05-26'], 'Dr. Adams'),
    ];
    expect(weekDaysOffList(doctors, ANCHOR).map((e) => e.doctorName)).toEqual([
      'Dr. Adams',
      'Dr. Zhang',
    ]);
  });
});
