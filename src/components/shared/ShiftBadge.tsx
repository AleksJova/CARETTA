import { cn } from '@/lib/utils';
import type { Shift } from '@/types';

const SHIFT_STYLES: Record<Shift, string> = {
  morning: 'bg-shift-morning-surface text-shift-morning-foreground',
  afternoon: 'bg-shift-afternoon-surface text-shift-afternoon-foreground',
};

const SHIFT_LABEL: Record<Shift, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
};

export function ShiftBadge({ shift }: { shift: Shift }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        SHIFT_STYLES[shift]
      )}
    >
      {SHIFT_LABEL[shift]}
    </span>
  );
}
