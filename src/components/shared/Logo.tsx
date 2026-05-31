import { Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Logo({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md';
  className?: string;
}) {
  const box = size === 'sm' ? 'size-7 rounded-lg' : 'size-11 rounded-xl';
  const icon = size === 'sm' ? 'size-4' : 'size-6';

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center bg-primary text-primary-foreground',
        box,
        className
      )}
    >
      <Stethoscope className={icon} aria-hidden="true" />
    </span>
  );
}
