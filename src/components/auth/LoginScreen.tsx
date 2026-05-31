import type { Role } from '@/types';
import { useAuthStore } from '@/stores/authStore/authStore';
import { Button } from '@/components/ui/button';
import TurtlePond from '@/components/shared/TurtlePondBg';
import carettaLogo from '@/assets/carettaLogo.svg';

function RoleButton({
  role,
  label,
  variant,
  onChoose,
}: {
  role: Role;
  label: string;
  variant: 'default' | 'outline';
  onChoose: (role: Role) => void;
}) {
  return (
    <Button
      variant={variant}
      size="lg"
      className="w-full"
      onClick={() => onChoose(role)}
    >
      {label}
    </Button>
  );
}

/**
 * Mock Auth: Login / role selection
 */
export default function LoginScreen() {
  const loginAs = useAuthStore((s) => s.loginAs);

  return (
    <div className="h-svh w-full select-none">
      <TurtlePond turtleCount={5}>
        <div className="w-[340px] max-w-[90vw] rounded-2xl border border-white/70 bg-white/65 p-8 backdrop-blur-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <img
              src={carettaLogo}
              width={56}
              height={56}
              alt=""
              className="mb-3"
            />
            <h1 className="text-xl font-medium tracking-tight text-foreground">
              Caretta
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Appointment management for your clinic
            </p>
          </div>

          <p className="mb-3 text-center text-xs text-muted-foreground">
            Choose a role to continue
          </p>

          <div className="flex flex-col gap-2.5">
            <RoleButton
              role="patient"
              label="Continue as patient"
              variant="default"
              onChoose={loginAs}
            />
            <RoleButton
              role="admin"
              label="Continue as admin"
              variant="outline"
              onChoose={loginAs}
            />
          </div>
        </div>
      </TurtlePond>
    </div>
  );
}
