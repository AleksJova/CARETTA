// Normalizes any ISO date to the Monday of its clinic week (Mon–Sat).
// Sunday belongs to the previous week, so it maps back 6 days, not forward.
export function getWeekStart(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  const day = date.getUTCDay();
  // Days to subtract to reach Monday: Sun->6, Mon->0, Tue->1 ... Sat->5.
  const daysSinceMonday = day === 0 ? 6 : day - 1;

  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return date.toISOString().slice(0, 10);
}
