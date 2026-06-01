import { describe, it, expect } from 'vitest';
import {
  isSunday,
  isoToDate,
  dateToISO,
  nextOpenDay,
  isoToLocalDate,
  localDateToISO,
} from './isoDate';

describe('isSunday', () => {
  it('detects Sundays in UTC', () => {
    expect(isSunday(isoToDate('2026-06-07')!)).toBe(true); // Sunday
    expect(isSunday(isoToDate('2026-06-08')!)).toBe(false); // Monday
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
    // new Date() would overflow these into a valid later day; we reject them.
    expect(isoToDate('2026-02-30')).toBeNull(); // -> Mar 2 without the guard
    expect(isoToDate('2026-04-31')).toBeNull(); // -> May 1 without the guard
    expect(isoToDate('2026-13-01')).toBeNull(); // month overflow
    expect(isoToDate('2026-00-10')).toBeNull(); // month underflow
  });

  it('rejects non-padded or wrong-shaped dates', () => {
    expect(isoToDate('2026-6-1')).toBeNull();
    expect(isoToDate('2026/06/01')).toBeNull();
  });
});

describe('local-time bridge', () => {
  it('round-trips an ISO date through local midnight without drifting', () => {
    // The whole point: a local Date built from an ISO day, formatted back via
    // the local formatter, must return the same calendar day in any timezone.
    expect(localDateToISO(isoToLocalDate('2026-06-02')!)).toBe('2026-06-02');
    expect(localDateToISO(isoToLocalDate('2026-12-31')!)).toBe('2026-12-31');
  });

  it('builds a local-midnight Date on the right calendar day', () => {
    const date = isoToLocalDate('2026-06-02')!;
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(5); // June (0-indexed)
    expect(date.getDate()).toBe(2);
  });

  it('returns null for a malformed string', () => {
    expect(isoToLocalDate('2026/06/02')).toBeNull();
  });

  it('returns null for overflow days instead of normalizing them', () => {
    // new Date() would roll these into a valid later day; we reject them so the
    // local parser matches isoToDate's ISO-boundary behavior.
    expect(isoToLocalDate('2026-02-30')).toBeNull(); // -> Mar 2 without the guard
    expect(isoToLocalDate('2026-13-01')).toBeNull(); // month overflow
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
