import { useState } from 'react';
import { Calendar, Clock, Stethoscope } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMedicalStore } from '@/stores/medicalStore/medicalStore';
import { useFlashStore } from '@/stores/flashStore/flashStore';
import { notify } from '@/components/shared/notify';
import { DEMO_PATIENT } from '@/services';
import { formatDate, formatTimeRange } from '@/utils';
import type { Doctor, Slot } from '@/types';

interface BookingDialogProps {
  slot: Slot | null;
  doctor: Doctor | null;
  onOpenChange: (open: boolean) => void;
  onBooked: () => void;
}

export function BookingDialog({
  slot,
  doctor,
  onOpenChange,
  onBooked,
}: BookingDialogProps) {
  const bookAppointment = useMedicalStore((s) => s.bookAppointment);
  const flash = useFlashStore((s) => s.flash);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const open = slot !== null && doctor !== null;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setError(null);
      setSubmitting(false);
    }
    onOpenChange(next);
  };

  const handleConfirm = () => {
    if (!slot) return;
    setError(null);
    setSubmitting(true);
    const result = bookAppointment({
      doctorId: slot.doctorId,
      patientId: DEMO_PATIENT.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    if (!result.ok) {
      setError(result.reason);
      notify.error('Booking failed', result.reason);
      setSubmitting(false);
      return;
    }
    // Briefly highlight the new appointment where it lands in the upcoming list.
    flash(result.data.id);
    notify.success(
      'Appointment booked',
      `${formatDate(slot.date)}, ${formatTimeRange(slot.startTime, slot.endTime)} with ${doctor!.name}`
    );
    setSubmitting(false);
    onBooked();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm booking</DialogTitle>
          <DialogDescription>
            Review the details before confirming your appointment.
          </DialogDescription>
        </DialogHeader>

        {slot && doctor && (
          <div className="space-y-2 rounded-lg border border-border bg-surface-muted p-4 text-sm">
            <p className="flex items-center gap-2 text-foreground">
              <Stethoscope className="size-4 text-primary" aria-hidden="true" />
              <span className="font-medium">{doctor.name}</span>
              <span className="text-muted-foreground">
                · {doctor.specialty}
              </span>
            </p>
            <p className="flex items-center gap-2 text-foreground">
              <Calendar className="size-4 text-primary" aria-hidden="true" />
              {formatDate(slot.date)}
            </p>
            <p className="flex items-center gap-2 text-foreground">
              <Clock className="size-4 text-primary" aria-hidden="true" />
              {formatTimeRange(slot.startTime, slot.endTime)}
            </p>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-md bg-cancelled/10 px-3 py-2 text-sm text-cancelled"
          >
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Booking…' : 'Confirm booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
