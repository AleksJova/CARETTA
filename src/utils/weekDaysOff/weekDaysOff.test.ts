import { describe, expect, it } from 'vitest';
import { weekDaysOffList } from './weekDaysOff';
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

const ANCHOR = '2026-05-27';

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
