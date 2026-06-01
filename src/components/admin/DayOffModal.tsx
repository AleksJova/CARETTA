import { useState } from 'react';
import { CalendarOff, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/patient/DatePicker';
import {
  useAppointments,
  useDoctors,
  useMedicalStore,
} from '@/stores/medicalStore/medicalStore';
import { notify } from '@/components/shared/notify';
import { formatDate, todayISO } from '@/utils';
import type { Doctor } from '@/types';

interface DayOffModalProps {
  doctor: Doctor | null;
  onOpenChange: (open: boolean) => void;
}

export function DayOffModal({ doctor, onOpenChange }: DayOffModalProps) {
  const setDoctorDayOff = useMedicalStore((s) => s.setDoctorDayOff);
  const removeDoctorDayOff = useMedicalStore((s) => s.removeDoctorDayOff);
  const doctors = useDoctors();
  const appointments = useAppointments();

  const open = doctor !== null;
  const today = todayISO();
  const [date, setDate] = useState(today);

  const [seededFor, setSeededFor] = useState<string | null>(null);
  const seedKey = doctor?.id ?? null;
  if (seededFor !== seedKey) {
    setSeededFor(seedKey);
    if (seedKey) setDate(today);
  }

  if (!doctor) return null;

  const current = doctors.find((d) => d.id === doctor.id) ?? doctor;
  const daysOff = [...current.daysOff].sort();
  const alreadyOff = daysOff.includes(date);

  // A day with an appointment can't be marked off.
  const conflictCount = appointments.filter(
    (a) => a.doctorId === current.id && a.date === date
  ).length;
  const hasConflict = conflictCount > 0;

  const handleAdd = () => {
    if (alreadyOff || hasConflict) return;
    const result = setDoctorDayOff(current.id, date);
    if (!result.ok) {
      notify.error("Can't mark day off", result.reason);
      return;
    }
    notify.info('Day off marked', `${current.name} · ${formatDate(date)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="flex size-7 items-center justify-center rounded-lg bg-pending/15 text-pending"
              aria-hidden="true"
            >
              <CalendarOff className="size-4" />
            </span>
            Day off — {current.name}
          </DialogTitle>
          <DialogDescription>
            Mark a date off. The doctor&apos;s slots for that day disappear and
            existing bookings on it are no longer offered.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="dayoff-date"
              className="text-xs text-muted-foreground"
            >
              Date
            </Label>
            <div className="flex gap-2">
              <DatePicker
                id="dayoff-date"
                value={date}
                minISO={today}
                onChange={setDate}
              />
              <Button
                type="button"
                onClick={handleAdd}
                disabled={alreadyOff || hasConflict}
              >
                {alreadyOff ? 'Already off' : 'Mark off'}
              </Button>
            </div>
            {hasConflict && (
              <p role="alert" className="text-xs text-cancelled">
                {conflictCount} appointment{conflictCount === 1 ? '' : 's'}{' '}
                booked on this day. Cancel or reassign{' '}
                {conflictCount === 1 ? 'it' : 'them'} before marking it off.
              </p>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">
              Days off ({daysOff.length})
            </p>
            {daysOff.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-surface-muted px-3 py-4 text-center text-sm text-muted-foreground">
                No days off scheduled.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {daysOff.map((d) => (
                  <li key={d}>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-pending/15 px-2 py-1 text-xs font-medium text-pending">
                      {formatDate(d)}
                      <button
                        type="button"
                        onClick={() => removeDoctorDayOff(current.id, d)}
                        aria-label={`Remove day off on ${formatDate(d)}`}
                        className="rounded-sm hover:text-foreground"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
