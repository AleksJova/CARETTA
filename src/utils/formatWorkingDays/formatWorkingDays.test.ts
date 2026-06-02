import { describe, expect, it } from 'vitest';
import { formatWorkingDays } from './formatWorkingDays';

describe('formatWorkingDays', () => {
  it('renders a contiguous run as a range', () => {
    expect(formatWorkingDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])).toBe(
      'Mon – Fri'
    );
    expect(formatWorkingDays(['Tue', 'Wed', 'Thu', 'Fri', 'Sat'])).toBe(
      'Tue – Sat'
    );
  });

  it('normalises out-of-order input to weekday order', () => {
    expect(formatWorkingDays(['Fri', 'Mon', 'Wed', 'Tue', 'Thu'])).toBe(
      'Mon – Fri'
    );
  });

  it('renders gappy days as a comma list, not a range', () => {
    expect(formatWorkingDays(['Mon', 'Wed', 'Fri'])).toBe('Mon, Wed, Fri');
    expect(formatWorkingDays(['Mon', 'Wed', 'Fri', 'Sat'])).toBe(
      'Mon, Wed, Fri, Sat'
    );
  });

  it('renders a single day as itself', () => {
    expect(formatWorkingDays(['Wed'])).toBe('Wed');
  });

  it('renders an em dash for no days', () => {
    expect(formatWorkingDays([])).toBe('—');
  });
});
