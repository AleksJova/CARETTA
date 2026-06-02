import { NavLink, Outlet } from 'react-router-dom';
import { CalendarDays, Stethoscope } from 'lucide-react';
import Header from '@/components/shared/Header';
import { LocalTimeBadge } from '@/components/shared/LocalTimeBadge';
import { ADMIN_APPOINTMENTS_PATH, ADMIN_DOCTORS_PATH } from '@/routes';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: ADMIN_DOCTORS_PATH, label: 'Doctors', icon: Stethoscope, end: true },
  {
    to: ADMIN_APPOINTMENTS_PATH,
    label: 'Appointments',
    icon: CalendarDays,
    end: false,
  },
] as const;

export default function AdminLayout() {
  return (
    <div className="min-h-svh bg-surface-muted">
      <Header roleLabel="Admin" />
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:flex-row sm:gap-6 sm:px-6 sm:py-8">
        <nav aria-label="Admin sections" className="shrink-0 sm:w-44">
          <p className="hidden px-3 pb-1.5 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground sm:block">
            Manage
          </p>
          <ul className="flex gap-1 sm:flex-col sm:gap-0.5">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <li key={to} className="flex-1 sm:flex-none">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors sm:justify-start',
                      isActive
                        ? 'bg-accent-teal font-medium text-accent-teal-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    )
                  }
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex justify-end">
            <LocalTimeBadge iconClassName="text-pending" />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
