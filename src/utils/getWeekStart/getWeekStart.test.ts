import { describe, it, expect } from 'vitest';
import { getWeekStart } from './getWeekStart';

// 2026-06-01 is a Monday; 06-06 is the Saturday of the same clinic week.
describe('getWeekStart', () => {
  it('returns the same date when given a Monday', () => {
    expect(getWeekStart('2026-06-01')).toBe('2026-06-01');
  });

  it('maps a mid-week day back to its Monday', () => {
    expect(getWeekStart('2026-06-03')).toBe('2026-06-01'); // Wednesday
    expect(getWeekStart('2026-06-06')).toBe('2026-06-01'); // Saturday
  });

  it('maps Sunday back to the preceding Monday, not forward', () => {
    // 2026-06-07 is a Sunday; its Mon–Sat week started 06-01.
    expect(getWeekStart('2026-06-07')).toBe('2026-06-01');
  });

  it('crosses a month boundary correctly', () => {
    // 2026-06-02 is a Tuesday; its Monday is 2026-06-01 (no crossing here),
    // but 2026-07-01 is a Wednesday whose Monday is 2026-06-29.
    expect(getWeekStart('2026-07-01')).toBe('2026-06-29');
  });

  it('returns the input unchanged for a malformed date', () => {
    expect(getWeekStart('not-a-date')).toBe('not-a-date');
  });
});
