import { memo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { slotKey, useFlashNonce } from '@/stores/flashStore/flashStore';
import { formatDate, formatTimeRange } from '@/utils';
import type { Doctor, Slot } from '@/types';

interface SlotCardProps {
  slot: Slot;
  doctor: Doctor;
  onBook: (slot: Slot) => void;
}

function SlotCardBase({ slot, doctor, onBook }: SlotCardProps) {
  const nonce = useFlashNonce(
    slotKey(slot.doctorId, slot.date, slot.startTime)
  );
  const flashing = nonce !== undefined;

  return (
    <Card
      key={nonce}
      className={cn(
        'flex flex-col gap-3 p-4 shadow-none',
        flashing && 'animate-flash-highlight'
      )}
    >
      <div>
        <p className="text-sm font-medium text-foreground">{doctor.name}</p>
        <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
      </div>
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 text-xs text-foreground">
          <Calendar className="size-3.5 text-primary" aria-hidden="true" />
          {formatDate(slot.date)}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-foreground">
          <Clock className="size-3.5 text-primary" aria-hidden="true" />
          {formatTimeRange(slot.startTime, slot.endTime)}
        </p>
      </div>
      <Button
        size="sm"
        className="w-full"
        onClick={() => onBook(slot)}
        aria-label={`Book ${doctor.name} on ${formatDate(slot.date)} at ${formatTimeRange(
          slot.startTime,
          slot.endTime
        )}`}
      >
        Book
      </Button>
    </Card>
  );
}

export const SlotCard = memo(SlotCardBase);
