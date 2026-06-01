/* eslint-disable react-refresh/only-export-components */
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

// Status-aware toast helpers. Each maps to a design-system colour:

//   success -> completed green (e.g. appointment booked)
//   error   -> cancelled red (e.g. appointment cancelled / failed)
//   info    -> brand teal (informational messages)

export const notify = {
  success: (title: string, description?: string) =>
    toast.custom(() => (
      <ToastCard
        title={title}
        description={description}
        accent="completed"
        icon={<CheckCircle2 className="size-5 text-completed" />}
      />
    )),
  error: (title: string, description?: string) =>
    toast.custom(() => (
      <ToastCard
        title={title}
        description={description}
        accent="cancelled"
        icon={<XCircle className="size-5 text-cancelled" />}
      />
    )),
  info: (title: string, description?: string) =>
    toast.custom(() => (
      <ToastCard
        title={title}
        description={description}
        accent="primary"
        icon={<Info className="size-5 text-primary" />}
      />
    )),
};

const ACCENT_BORDER: Record<'completed' | 'cancelled' | 'primary', string> = {
  completed: 'border-l-completed',
  cancelled: 'border-l-cancelled',
  primary: 'border-l-primary',
};

function ToastCard({
  title,
  description,
  accent,
  icon,
}: {
  title: string;
  description?: string;
  accent: 'completed' | 'cancelled' | 'primary';
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`flex w-[var(--width)] items-start gap-3 rounded-lg border border-l-4 ${ACCENT_BORDER[accent]} bg-white px-4 py-3 shadow-md`}
    >
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
