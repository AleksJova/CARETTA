import { cn } from '@/lib/utils';
import type { AppointmentStatus } from '@/types';

const ADMIN_STATUS_STYLES: Partial<Record<AppointmentStatus, string>> = {
  confirmed: 'bg-pending/15 text-pending',
  completed: 'bg-completed/10 text-completed',
};

const ADMIN_STATUS_LABEL: Partial<Record<AppointmentStatus, string>> = {
  confirmed: 'Pending',
  completed: 'Completed',
};

export function AdminStatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium',
        ADMIN_STATUS_STYLES[status]
      )}
    >
      {ADMIN_STATUS_LABEL[status] ?? status}
    </span>
  );
}
