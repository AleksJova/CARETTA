import { cn } from '@/lib/utils';
import type { AppointmentStatus } from '@/types';

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  confirmed: 'bg-accent-teal text-accent-teal-foreground',
  completed: 'bg-completed/10 text-completed',
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmed: 'Confirmed',
  completed: 'Completed',
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
