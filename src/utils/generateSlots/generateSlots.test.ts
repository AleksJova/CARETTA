import { describe, it, expect } from 'vitest';
import { generateSlots } from './generateSlots';
import type { Doctor } from '@/types';

const MONDAY = '2026-06-01';

const morningDoctor: Doctor = {
  id: 'doc-1',
  name: 'Dr. Patel',
  specialty: 'Cardiology',
  shift: 'morning',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  daysOff: [],
};

const afternoonDoctor: Doctor = {
  ...morningDoctor,
  id: 'doc-2',
  name: 'Dr. Okafor',
  shift: 'afternoon',
};

describe('generateSlots', () => {
  it('produces 5 morning slots per working day (08–13)', () => {
    const slots = generateSlots(morningDoctor, MONDAY);
    const monday = slots.filter((s) => s.date === MONDAY);

    expect(monday).toHaveLength(5);
    expect(monday.map((s) => [s.startTime, s.endTime])).toEqual([
      ['08:00', '09:00'],
      ['09:00', '10:00'],
      ['10:00', '11:00'],
      ['11:00', '12:00'],
      ['12:00', '13:00'],
    ]);
  });

  it('produces 6 afternoon slots per working day (13–19)', () => {
    const slots = generateSlots(afternoonDoctor, MONDAY);
    const monday = slots.filter((s) => s.date === MONDAY);

    expect(monday).toHaveLength(6);
    expect(monday[0]).toMatchObject({ startTime: '13:00', endTime: '14:00' });
    expect(monday[5]).toMatchObject({ startTime: '18:00', endTime: '19:00' });
  });

  it('covers Mon–Sat and never produces a Sunday slot', () => {
    const slots = generateSlots(morningDoctor, MONDAY);
    const dates = [...new Set(slots.map((s) => s.date))].sort();

    // Mon 06-01 … Sat 06-06, with no 06-07 (Sunday).
    expect(dates).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
      '2026-06-04',
      '2026-06-05',
      '2026-06-06',
    ]);
    expect(slots).toHaveLength(6 * 5); // six working days × five morning slots
  });

  it('emits no slots on days the doctor does not work', () => {
    const partTime: Doctor = {
      ...morningDoctor,
      workingDays: ['Mon', 'Wed'],
    };
    const dates = [
      ...new Set(generateSlots(partTime, MONDAY).map((s) => s.date)),
    ];

    expect(dates).toEqual(['2026-06-01', '2026-06-03']);
  });

  it('emits zero slots on a day off', () => {
    const withDayOff: Doctor = {
      ...morningDoctor,
      daysOff: ['2026-06-03'], // Wednesday
    };
    const slots = generateSlots(withDayOff, MONDAY);

    expect(slots.some((s) => s.date === '2026-06-03')).toBe(false);
    // The surrounding days are unaffected.
    expect(slots.some((s) => s.date === '2026-06-02')).toBe(true);
    expect(slots.some((s) => s.date === '2026-06-04')).toBe(true);
  });

  it('tags every slot with the doctor id', () => {
    const slots = generateSlots(morningDoctor, MONDAY);

    expect(slots.every((s) => s.doctorId === 'doc-1')).toBe(true);
  });

  it('returns no slots for a doctor with no working days', () => {
    expect(
      generateSlots({ ...morningDoctor, workingDays: [] }, MONDAY)
    ).toEqual([]);
  });

  it('returns no slots for a malformed week start', () => {
    expect(generateSlots(morningDoctor, 'not-a-date')).toEqual([]);
  });
});
