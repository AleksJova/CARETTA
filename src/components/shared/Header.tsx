import type { ReactNode } from 'react';
import { LogOut, User, ShieldHalf } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore/authStore';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';

export default function Header({
  roleLabel,
  children,
}: {
  roleLabel: string;
  children?: ReactNode;
}) {
  const logout = useAuthStore((s) => s.logout);
  const role = useAuthStore((s) => s.role);

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Logo size="sm" />
          <span className="text-lg font-medium tracking-tight text-primary">
            Caretta
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {children}
          <div className="flex items-center gap-2">
            <span
              className={`flex size-7 items-center justify-center rounded-full ${
                role === 'patient'
                  ? 'bg-accent-teal text-accent-teal-foreground'
                  : 'bg-pending/15 text-pending'
              }`}
            >
              {role === 'patient' && (
                <User className="size-4" aria-hidden="true" />
              )}

              {role === 'admin' && (
                <ShieldHalf className="size-4" aria-hidden="true" />
              )}
            </span>
            <span className="hidden text-sm text-foreground sm:inline">
              {roleLabel}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            aria-label="Log out"
          >
            <LogOut aria-hidden="true" />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
