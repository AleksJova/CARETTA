import { describe, it, expect } from 'vitest';
import { formatDate, formatTime12h, formatTimeRange } from './formatSlot';

describe('formatDate', () => {
  it('formats an ISO date as "Wkd D Mon"', () => {
    expect(formatDate('2026-05-25')).toBe('Mon 25 May');
  });

  it('returns the input unchanged for a malformed date', () => {
    expect(formatDate('nope')).toBe('nope');
  });
});

describe('formatTime12h', () => {
  it('formats morning and afternoon hours', () => {
    expect(formatTime12h('08:00')).toBe('8:00 AM');
    expect(formatTime12h('13:00')).toBe('1:00 PM');
    expect(formatTime12h('12:00')).toBe('12:00 PM');
  });
});

describe('formatTimeRange', () => {
  it('shows the period once when both ends share it', () => {
    expect(formatTimeRange('09:00', '10:00')).toBe('9:00 – 10:00 AM');
    expect(formatTimeRange('14:00', '15:00')).toBe('2:00 – 3:00 PM');
  });

  it('shows the period on both ends when they differ', () => {
    // 11:00 is AM, 12:00 is PM — crossing noon, so each end carries its period.
    expect(formatTimeRange('11:00', '12:00')).toBe('11:00 AM – 12:00 PM');
    // 12:00 and 13:00 are both PM, so the period collapses to one at the end.
    expect(formatTimeRange('12:00', '13:00')).toBe('12:00 – 1:00 PM');
  });
});
