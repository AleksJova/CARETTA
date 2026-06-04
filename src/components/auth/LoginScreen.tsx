import { useState } from 'react';
import { Sprout, ShieldHalf, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Role } from '@/types';
import { useAuthStore } from '@/stores/authStore/authStore';
import { isSeeded, toggleSeed } from '@/utils';
import { Button } from '@/components/ui/button';
import { LoaderOverlay } from '@/components/shared/Loader';
import TurtlePond from '@/components/shared/TurtlePondBg';
import Logo from '@/components/shared/Logo';

// Demo-only: how long to show the loading state before the seed write + reload.
// The data layer is synchronous today, so this stands in for the wait a real
// (async) backend would add. Set to 0 to skip the spinner.
const SEED_LOADING_MS = 1000;

function RoleButton({
  role,
  label,
  variant,
  icon: Icon,
  onChoose,
}: {
  role: Role;
  label: string;
  variant: 'default' | 'outline';
  icon: LucideIcon;
  onChoose: (role: Role) => void;
}) {
  return (
    <Button
      variant={variant}
      size="lg"
      className="w-full"
      onClick={() => onChoose(role)}
    >
      <Icon aria-hidden="true" />
      {label}
    </Button>
  );
}

/**
 * Mock Auth: Login / role selection
 */
export default function LoginScreen() {
  const loginAs = useAuthStore((s) => s.loginAs);
  const seeded = isSeeded();

  const [seedLoading, setSeedLoading] = useState(false);
  const handleSeed = () => {
    setSeedLoading(true);
    setTimeout(toggleSeed, SEED_LOADING_MS);
  };

  return (
    <main className="h-svh w-full select-none">
      {seedLoading && (
        <LoaderOverlay label={seeded ? 'Clearing data…' : 'Loading data…'} />
      )}
      <TurtlePond turtleCount={5}>
        {/* Demo-only: load or clear sample data before signing in, then reload. */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSeed}
          disabled={seedLoading}
          className="absolute right-3 top-3 bg-white/65 backdrop-blur-md"
          title={seeded ? 'Clear demo data' : 'Load demo data'}
        >
          <Sprout
            className={seeded ? 'text-primary' : 'text-muted-foreground'}
            aria-hidden="true"
          />
          {seeded ? 'Clear data' : 'Seed data'}
        </Button>
        <div className="w-[320px] max-w-[90vw] rounded-2xl border border-white/70 bg-white/65 p-6 backdrop-blur-md sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo className="mb-3" />
            <h1 className="text-xl font-medium tracking-tight text-foreground">
              Caretta
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Appointment management for your clinic
            </p>
          </div>

          <p
            id="role-prompt"
            className="mb-3 text-center text-xs text-muted-foreground"
          >
            Choose a role to continue
          </p>

          <div
            role="group"
            aria-labelledby="role-prompt"
            className="flex flex-col gap-2.5"
          >
            <RoleButton
              role="patient"
              label="Continue as patient"
              variant="default"
              icon={User}
              onChoose={loginAs}
            />
            <RoleButton
              role="admin"
              label="Continue as admin"
              variant="outline"
              icon={ShieldHalf}
              onChoose={loginAs}
            />
          </div>

          <div className="my-4 flex items-center gap-2.5">
            <span className="h-px flex-1 bg-primary/20" />
            <span className="text-[11px] text-muted-foreground">
              mock authentication
            </span>
            <span className="h-px flex-1 bg-primary/20" />
          </div>
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            Demo only — no password required.
          </p>
        </div>

        <p className="pointer-events-none absolute inset-x-0 bottom-2.5 text-center text-[11px] text-primary/50">
          move your cursor — the turtles are shy
        </p>
      </TurtlePond>
    </main>
  );
}
