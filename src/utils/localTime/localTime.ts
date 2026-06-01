export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

// "America/New_York" -> "New York"
export function localPlaceLabel(timeZone = localTimeZone()): string {
  return (timeZone.split('/').pop() ?? timeZone).replace(/_/g, ' ');
}

// 12-hour local time, no seconds: "8:09 PM"
export function formatClockTime(
  date: Date,
  timeZone = localTimeZone()
): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(date);
}
