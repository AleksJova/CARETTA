import { cn } from '@/lib/utils';
import type { AppointmentView } from '@/utils';

const VIEW_STYLES: Record<AppointmentView, string> = {
  completed: 'bg-completed/10 text-completed',
  'in-progress': 'bg-progress-surface text-progress-foreground',
  awaiting: 'bg-pending/15 text-pending',
  upcoming: 'bg-shift-afternoon-surface text-shift-afternoon-foreground',
};

const VIEW_LABEL: Record<AppointmentView, string> = {
  completed: 'Done',
  'in-progress': 'In progress',
  awaiting: 'Awaiting completion',
  upcoming: 'Upcoming',
};

export function AdminStatusBadge({ view }: { view: AppointmentView }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-medium',
        VIEW_STYLES[view]
      )}
    >
      {view === 'in-progress' && (
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      )}
      {VIEW_LABEL[view]}
    </span>
  );
}
