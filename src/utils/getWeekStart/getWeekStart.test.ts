import { describe, it, expect } from 'vitest';
import { getWeekStart } from './getWeekStart';

describe('getWeekStart', () => {
  it('returns the same date when given a Monday', () => {
    expect(getWeekStart('2026-06-01')).toBe('2026-06-01');
  });

  it('maps a mid-week day back to its Monday', () => {
    expect(getWeekStart('2026-06-03')).toBe('2026-06-01');
    expect(getWeekStart('2026-06-06')).toBe('2026-06-01');
  });

  it('maps Sunday back to the preceding Monday, not forward', () => {
    expect(getWeekStart('2026-06-07')).toBe('2026-06-01');
  });

  it('crosses a month boundary correctly', () => {
    expect(getWeekStart('2026-07-01')).toBe('2026-06-29');
  });

  it('returns the input unchanged for a malformed date', () => {
    expect(getWeekStart('not-a-date')).toBe('not-a-date');
  });
});
