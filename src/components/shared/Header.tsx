import type { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore/authStore';
import { Button } from '@/components/ui/button';
import TurtlePond from '@/components/shared/TurtlePondBg';
import carettaLogo from '@/assets/carettaLogo.svg';

export default function Header({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="relative">
      <TurtlePond
        interactive={false}
        ripples={false}
        turtleCount={2}
        style={{ height: 96 }}
      >
        <div className="flex h-14 w-full max-w-6xl items-center justify-between rounded-2xl border border-white/70 bg-white/45 px-6 shadow-sm backdrop-blur-md mx-4">
          <div className="flex items-center gap-3">
            <img src={carettaLogo} width={32} height={32} alt="" />
            <span className="text-lg font-medium tracking-tight text-foreground">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {children}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="bg-white/70"
            >
              <LogOut />
              Log out
            </Button>
          </div>
        </div>
      </TurtlePond>
    </header>
  );
}
