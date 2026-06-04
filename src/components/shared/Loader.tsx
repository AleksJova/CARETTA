import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoaderSize = 'sm' | 'md' | 'lg';

const ICON_SIZE: Record<LoaderSize, string> = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-9',
};

const TEXT_SIZE: Record<LoaderSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

interface LoaderProps {
  label?: string;
  size?: LoaderSize;
  className?: string;
  iconClassName?: string;
}

// A spinner with an optional label, inline by default.
// Live status region so screen readers announce the wait.
export function Loader({
  label,
  size = 'sm',
  className,
  iconClassName,
}: LoaderProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-2 text-muted-foreground',
        TEXT_SIZE[size],
        className
      )}
    >
      <Loader2
        className={cn(
          'animate-spin text-primary',
          ICON_SIZE[size],
          iconClassName
        )}
        aria-hidden="true"
      />
      {label && <span>{label}</span>}
      {!label && <span className="sr-only">Loading</span>}
    </span>
  );
}

interface LoaderOverlayProps {
  label?: string;
  // When true (default) the panel sits over a dimmed, blurred backdrop.
  backdrop?: boolean;
}

// A modal-style loading panel: a centered card with a large spinner stacked
// above its label. The backdrop is optional so it can also sit inline.
export function LoaderOverlay({ label, backdrop = true }: LoaderOverlayProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-30 flex items-center justify-center',
        backdrop && 'bg-background/70 backdrop-blur-sm'
      )}
    >
      <div className="flex min-w-[280px] flex-col items-center gap-5 rounded-xl border border-border bg-card px-12 py-10 shadow-md">
        <Loader2
          className="size-11 animate-spin text-primary"
          aria-hidden="true"
        />
        <p
          role="status"
          aria-live="polite"
          className="text-base font-medium text-foreground"
        >
          {label ?? 'Loading'}
        </p>
      </div>
    </div>
  );
}
