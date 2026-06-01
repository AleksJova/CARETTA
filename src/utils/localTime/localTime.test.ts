import { describe, it, expect } from 'vitest';
import { formatClockTime, localPlaceLabel } from './localTime';

describe('localPlaceLabel', () => {
  it('takes the city segment from an IANA zone', () => {
    expect(localPlaceLabel('America/Bogota')).toBe('Bogota');
  });

  it('replaces underscores with spaces', () => {
    expect(localPlaceLabel('America/New_York')).toBe('New York');
  });

  it('falls back to the whole string when there is no slash', () => {
    expect(localPlaceLabel('UTC')).toBe('UTC');
  });
});

describe('formatClockTime', () => {
  const instant = new Date('2026-06-01T01:09:00Z');

  it('formats as 12-hour time with minutes for the given zone', () => {
    expect(formatClockTime(instant, 'America/Bogota')).toBe('8:09 PM');
  });

  it('renders the same instant differently in another zone', () => {
    expect(formatClockTime(instant, 'UTC')).toBe('1:09 AM');
  });
});
