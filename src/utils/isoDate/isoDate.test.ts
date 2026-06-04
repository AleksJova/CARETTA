import { describe, it, expect } from 'vitest';
import {
  isSunday,
  isoToDate,
  dateToISO,
  nextOpenDay,
  isoToLocalDate,
  localDateToISO,
  nowHHmm,
  isSlotInPast,
} from './isoDate';

describe('isSunday', () => {
  it('detects Sundays in UTC', () => {
    expect(isSunday(isoToDate('2026-06-07')!)).toBe(true);
    expect(isSunday(isoToDate('2026-06-08')!)).toBe(false);
  });
});

describe('isoToDate / dateToISO round-trip', () => {
  it('round-trips an ISO date', () => {
    expect(dateToISO(isoToDate('2026-06-01')!)).toBe('2026-06-01');
  });

  it('returns null for a malformed ISO string', () => {
    expect(isoToDate('nope')).toBeNull();
  });

  it('rejects impossible calendar days instead of normalizing them', () => {
    expect(isoToDate('2026-02-30')).toBeNull();
    expect(isoToDate('2026-04-31')).toBeNull();
    expect(isoToDate('2026-13-01')).toBeNull();
    expect(isoToDate('2026-00-10')).toBeNull();
  });

  it('rejects non-padded or wrong-shaped dates', () => {
    expect(isoToDate('2026-6-1')).toBeNull();
    expect(isoToDate('2026/06/01')).toBeNull();
  });
});

describe('local-time bridge', () => {
  it('round-trips an ISO date through local midnight without drifting', () => {
    expect(localDateToISO(isoToLocalDate('2026-06-02')!)).toBe('2026-06-02');
    expect(localDateToISO(isoToLocalDate('2026-12-31')!)).toBe('2026-12-31');
  });

  it('builds a local-midnight Date on the right calendar day', () => {
    const date = isoToLocalDate('2026-06-02')!;
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(5);
    expect(date.getDate()).toBe(2);
  });

  it('returns null for a malformed string', () => {
    expect(isoToLocalDate('2026/06/02')).toBeNull();
  });

  it('returns null for overflow days instead of normalizing them', () => {
    expect(isoToLocalDate('2026-02-30')).toBeNull();
    expect(isoToLocalDate('2026-13-01')).toBeNull();
  });
});

describe('nextOpenDay', () => {
  it('advances a Sunday to the following Monday', () => {
    expect(nextOpenDay('2026-06-07')).toBe('2026-06-08');
  });

  it('leaves a non-Sunday unchanged', () => {
    expect(nextOpenDay('2026-06-01')).toBe('2026-06-01');
  });

  it('returns the input unchanged for a malformed date', () => {
    expect(nextOpenDay('nope')).toBe('nope');
  });
});

describe('nowHHmm', () => {
  it('formats local hours and minutes as zero-padded "HH:mm"', () => {
    expect(nowHHmm(new Date(2026, 5, 1, 9, 5))).toBe('09:05');
    expect(nowHHmm(new Date(2026, 5, 1, 13, 0))).toBe('13:00');
    expect(nowHHmm(new Date(2026, 5, 1, 0, 0))).toBe('00:00');
  });
});

describe('isSlotInPast', () => {
  const TODAY = '2026-06-01';

  it('treats earlier days as past and later days as not past', () => {
    expect(isSlotInPast('2026-05-31', '23:00', TODAY, '08:00')).toBe(true);
    expect(isSlotInPast('2026-06-02', '07:00', TODAY, '23:00')).toBe(false);
  });

  it('on today, a slot is past once its start time is at or before now', () => {
    expect(isSlotInPast(TODAY, '08:00', TODAY, '13:00')).toBe(true);
    expect(isSlotInPast(TODAY, '13:00', TODAY, '13:00')).toBe(true);
    expect(isSlotInPast(TODAY, '14:00', TODAY, '13:00')).toBe(false);
  });
});
