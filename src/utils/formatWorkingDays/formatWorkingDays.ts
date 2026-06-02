import type { Weekday } from '@/types';

const ORDER: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Contiguous runs render as a range ("Mon – Fri"); gappy ones as a list
// ("Mon, Wed, Fri").
export function formatWorkingDays(days: Weekday[]): string {
  if (days.length === 0) return '—';

  const sorted = ORDER.filter((d) => days.includes(d));
  const indices = sorted.map((d) => ORDER.indexOf(d));
  const contiguous = indices.every(
    (idx, i) => i === 0 || idx === indices[i - 1] + 1
  );

  if (contiguous && sorted.length > 1) {
    return `${sorted[0]} – ${sorted[sorted.length - 1]}`;
  }
  return sorted.join(', ');
}
