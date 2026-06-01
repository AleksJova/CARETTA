import { describe, it, expect } from 'vitest';
import { deriveAppointmentView } from './appointmentView';

const TODAY = '2026-06-01';

describe('deriveAppointmentView', () => {
  it('a completed appointment is always "completed"', () => {
    // Even if its slot is in the future, the stored status wins.
    expect(
      deriveAppointmentView(
        'completed',
        '2026-07-01',
        '09:00',
        '10:00',
        TODAY,
        '08:00'
      )
    ).toBe('completed');
  });

  it('a confirmed appointment on an earlier day awaits completion', () => {
    expect(
      deriveAppointmentView(
        'confirmed',
        '2026-05-31',
        '09:00',
        '10:00',
        TODAY,
        '13:00'
      )
    ).toBe('awaiting');
  });

  it('a confirmed appointment on a later day is upcoming', () => {
    expect(
      deriveAppointmentView(
        'confirmed',
        '2026-06-02',
        '09:00',
        '10:00',
        TODAY,
        '23:00'
      )
    ).toBe('upcoming');
  });

  describe('same day, against the slot window', () => {
    const view = (start: string, end: string, now: string) =>
      deriveAppointmentView('confirmed', TODAY, start, end, TODAY, now);

    it('is upcoming before the slot starts', () => {
      expect(view('14:00', '15:00', '13:00')).toBe('upcoming');
    });

    it('is in progress at the start boundary', () => {
      expect(view('13:00', '14:00', '13:00')).toBe('in-progress');
    });

    it('is in progress partway through', () => {
      expect(view('13:00', '14:00', '13:35')).toBe('in-progress');
    });

    it('awaits completion at the end boundary', () => {
      expect(view('13:00', '14:00', '14:00')).toBe('awaiting');
    });

    it('awaits completion after the slot ends', () => {
      expect(view('09:00', '10:00', '13:35')).toBe('awaiting');
    });
  });
});
