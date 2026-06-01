import Header from '@/components/shared/Header';
import { LocalTimeBadge } from '@/components/shared/LocalTimeBadge';
import { AvailableSlots } from '@/components/patient/AvailableSlots';
import { UpcomingAppointments } from '@/components/patient/UpcomingAppointments';

export default function PatientLayout() {
  return (
    <div className="min-h-svh bg-surface-muted">
      <Header roleLabel="Patient" />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 flex justify-end">
          <LocalTimeBadge />
        </div>
        <AvailableSlots />
        <UpcomingAppointments />
      </main>
    </div>
  );
}
