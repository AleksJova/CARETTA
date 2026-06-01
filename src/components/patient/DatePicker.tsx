import { useState } from 'react';
import { CalendarIcon, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  formatDate,
  isSunday,
  isoToDate,
  isoToLocalDate,
  localDateToISO,
  nextOpenDay,
  todayISO,
} from '@/utils';

interface DatePickerProps {
  id?: string;
  value: string; // ISO date
  minISO: string; // earliest selectable day (today)
  onChange: (iso: string) => void;
}

/**
 * Custom date picker for slot search: disables Sundays and past dates, tints
 * Sundays red, and converts between ISO strings and local-time Dates at the boundary.
 */
export function DatePicker({ id, value, minISO, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  // Local-time Dates for the calendar; ISO strings for everything else.
  const selectedLocal = isoToLocalDate(value) ?? undefined;
  const minLocal = isoToLocalDate(minISO) ?? undefined;

  const today = todayISO();
  const todaySunday = isSunday(isoToDate(today)!);

  const showSundaySnapNote = todaySunday && value === nextOpenDay(today);

  const [month, setMonth] = useState<Date>(selectedLocal ?? new Date());

  const handleOpenChange = (next: boolean) => {
    if (next && selectedLocal) setMonth(selectedLocal);
    setOpen(next);
  };

  const goToToday = () => {
    const target = nextOpenDay(today);
    const local = isoToLocalDate(target);
    if (local) setMonth(local);
    onChange(target);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="h-9 w-full justify-between px-3 font-normal"
        >
          {value ? formatDate(value) : 'Pick a date'}
          <CalendarIcon className="text-muted-foreground" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          selected={selectedLocal}
          disabled={[
            { dayOfWeek: [0] },
            minLocal ? { before: minLocal } : false,
          ]}
          modifiers={{ sunday: (date) => date.getDay() === 0 }}
          modifiersClassNames={{
            sunday:
              '[&_button]:!opacity-100 [&_button]:!text-cancelled [&_button]:!bg-cancelled/5',
            today:
              '[&_button]:font-semibold [&_button]:ring-1 [&_button]:ring-primary',
          }}
          onSelect={(date) => {
            if (!date) return;
            onChange(localDateToISO(date));
            setOpen(false);
          }}
          className="p-3 pb-2"
        />

        <div className="space-y-2 border-t border-border px-3 py-2.5">
          {showSundaySnapNote && (
            <p className="rounded-md bg-cancelled/10 px-2 py-1.5 text-xs text-cancelled">
              The clinic is closed today (Sunday).
              <br />
              Showing the next open day.
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="inline-block size-2 rounded-full bg-cancelled/70"
                aria-hidden="true"
              />
              Sundays closed
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              <CalendarClock aria-hidden="true" />
              Today
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
