import { AlertTriangle, Calendar, Clock, Stethoscope } from 'lucide-react';
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
import { slotKey, useFlashStore } from '@/stores/flashStore/flashStore';
import { notify } from '@/components/shared/notify';
import { formatDate, formatTimeRange } from '@/utils';
import type { Appointment, Doctor } from '@/types';

interface CancelDialogProps {
  appointment: Appointment | null;
  doctor: Doctor | null;
  onOpenChange: (open: boolean) => void;
  onCancelled: () => void;
}

export function CancelDialog({
  appointment,
  doctor,
  onOpenChange,
  onCancelled,
}: CancelDialogProps) {
  const cancelAppointment = useMedicalStore((s) => s.cancelAppointment);
  const flash = useFlashStore((s) => s.flash);
  const open = appointment !== null && doctor !== null;

  const handleConfirm = () => {
    if (!appointment) return;
    cancelAppointment(appointment.id);
    // Briefly highlight the slot that just reappeared in the search results.
    flash(
      slotKey(appointment.doctorId, appointment.date, appointment.startTime)
    );
    notify.error(
      'Appointment cancelled',
      `${formatDate(appointment.date)}, ${formatTimeRange(appointment.startTime, appointment.endTime)}${doctor ? ` with ${doctor.name}` : ''}`
    );
    onCancelled();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cancelled">
            <AlertTriangle className="size-5" aria-hidden="true" />
            Cancel appointment
          </DialogTitle>
          <DialogDescription>
            This cancels the appointment and frees the slot for other patients.
            This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>

        {appointment && doctor && (
          <div className="space-y-2 rounded-lg border border-cancelled/20 bg-cancelled/5 p-4 text-sm">
            <p className="flex items-center gap-2 text-foreground">
              <Stethoscope
                className="size-4 text-cancelled"
                aria-hidden="true"
              />
              <span className="font-medium">{doctor.name}</span>
              <span className="text-muted-foreground">
                · {doctor.specialty}
              </span>
            </p>
            <p className="flex items-center gap-2 text-foreground">
              <Calendar className="size-4 text-cancelled" aria-hidden="true" />
              {formatDate(appointment.date)}
            </p>
            <p className="flex items-center gap-2 text-foreground">
              <Clock className="size-4 text-cancelled" aria-hidden="true" />
              {formatTimeRange(appointment.startTime, appointment.endTime)}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep appointment
          </Button>
          {/* Quiet red outline, never filled — per the design system's rule for
              destructive actions. */}
          <Button
            variant="outline"
            onClick={handleConfirm}
            className="border-cancelled/40 text-cancelled hover:bg-cancelled/10 hover:text-cancelled"
          >
            Cancel appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
