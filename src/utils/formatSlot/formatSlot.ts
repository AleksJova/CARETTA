const WEEKDAY_LABEL = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;
const MONTH_LABEL = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

// "2026-05-25" -> "Mon 25 May"
export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  const weekday = WEEKDAY_LABEL[date.getUTCDay()];
  const day = date.getUTCDate();
  const month = MONTH_LABEL[date.getUTCMonth()];
  return `${weekday} ${day} ${month}`;
}

// "13:00" -> "1:00 PM", "08:00" -> "8:00 AM"
export function formatTime12h(time: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) {
    return time;
  }
  const hour = Number(match[1]);
  const minutes = match[2];
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minutes} ${period}`;
}

// Show AM/PM only at the end if both times share the same period
// 9:00 – 10:00 AM but 11:00 AM – 12:00 PM
export function formatTimeRange(startTime: string, endTime: string): string {
  const start = formatTime12h(startTime);
  const end = formatTime12h(endTime);
  const startPeriod = start.slice(-2);
  const endPeriod = end.slice(-2);
  if (startPeriod === endPeriod) {
    return `${start.slice(0, -3)} – ${end}`;
  }
  return `${start} – ${end}`;
}
