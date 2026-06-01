import { describe, expect, it } from 'vitest';
import { weekDaysOff } from './weekDaysOff';
import type { Doctor } from '@/types';

function doctor(id: string, daysOff: string[]): Doctor {
  return {
    id,
    name: id,
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
