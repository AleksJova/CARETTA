import { memo, useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { formatClockTime, localPlaceLabel, localTimeZone } from '@/utils';

const MINUTE_MS = 60_000;

function LocalTimeBadgeBase() {
  const zone = localTimeZone();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(
      () => {
        setNow(new Date());
        interval = setInterval(() => setNow(new Date()), MINUTE_MS);
      },
      MINUTE_MS - (Date.now() % MINUTE_MS)
    );
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="flex items-center gap-1.5 text-sm text-muted-foreground"
      title={`Your local time (${zone})`}
    >
      <MapPin className="size-3.5 text-primary" aria-hidden="true" />
      <span>{localPlaceLabel(zone)}</span>
      <span aria-hidden="true">·</span>
      <time className="font-medium tabular-nums text-foreground">
        {formatClockTime(now, zone)}
      </time>
    </div>
  );
}

export const LocalTimeBadge = memo(LocalTimeBadgeBase);
