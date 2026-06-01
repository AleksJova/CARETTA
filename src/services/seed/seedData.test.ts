import { describe, expect, it } from 'vitest';
import {
  buildSeedAppointments,
  seedAppointmentDate,
  SEED_APPOINTMENT_IDS,
} from './seedData';
import { getWeekStart, todayISO } from '@/utils';

describe('seed appointments anchoring', () => {
  it('builds demo appointments within the current clinic week', () => {
    const monday = getWeekStart(todayISO());
    const appts = buildSeedAppointments();
    expect(appts.length).toBeGreaterThan(0);
    for (const a of appts) {
      // Every demo date is the current week's Monday or later (offset >= 0).
      expect(a.date >= monday).toBe(true);
      expect(SEED_APPOINTMENT_IDS.has(a.id)).toBe(true);
    }
  });

  it('seedAppointmentDate returns a current-week date for a demo id', () => {
    expect(seedAppointmentDate('appt-1')).toBe(getWeekStart(todayISO()));
  });

  it('seedAppointmentDate returns null for a non-demo (user) id', () => {
    expect(seedAppointmentDate('user-made-uuid')).toBeNull();
  });
});
