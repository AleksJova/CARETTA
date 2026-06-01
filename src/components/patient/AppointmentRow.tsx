import { memo } from 'react';
import { HeartPulse, Stethoscope, Wind, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { useFlashNonce } from '@/stores/flashStore/flashStore';
import { formatDate, formatTimeRange } from '@/utils';
import type { Appointment, Doctor } from '@/types';

const SPECIALTY_ICON: Record<string, LucideIcon> = {
  Cardiology: HeartPulse,
  Pulmonology: Wind,
  Dermatology: Sparkles,
};

interface AppointmentRowProps {
  appointment: Appointment;
  doctor: Doctor | undefined;
  onCancel: (appointment: Appointment) => void;
}

function AppointmentRowBase({
  appointment,
  doctor,
  onCancel,
}: AppointmentRowProps) {
  const Icon = (doctor && SPECIALTY_ICON[doctor.specialty]) ?? Stethoscope;
  const nonce = useFlashNonce(appointment.id);
  const flashing = nonce !== undefined;

  return (
    <div
      key={nonce}
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-3',
        flashing && 'animate-flash-highlight'
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex size-9 items-center justify-center rounded-lg bg-accent-teal text-accent-teal-foreground"
          aria-hidden="true"
        >
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">
            {doctor ? `${doctor.name} · ${doctor.specialty}` : 'Doctor'}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(appointment.date)} ·{' '}
            {formatTimeRange(appointment.startTime, appointment.endTime)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <StatusBadge status={appointment.status} />
        <Button
          variant="outline"
          size="sm"
          className="text-cancelled hover:text-cancelled"
          onClick={() => onCancel(appointment)}
          aria-label={`Cancel appointment with ${doctor?.name ?? 'doctor'} on ${formatDate(
            appointment.date
          )}`}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export const AppointmentRow = memo(AppointmentRowBase);
