import { useCallback, useMemo, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import {
  useAppointments,
  useDoctors,
} from '@/stores/medicalStore/medicalStore';
import { upcomingAppointments, todayISO } from '@/utils';
import { DEMO_PATIENT } from '@/services';
import { AppointmentRow } from './AppointmentRow';
import { CancelDialog } from './CancelDialog';
import type { Appointment, Doctor } from '@/types';

export function UpcomingAppointments() {
  const appointments = useAppointments();
  const doctors = useDoctors();
  const [pendingCancel, setPendingCancel] = useState<Appointment | null>(null);

  const upcoming = useMemo(
    () => upcomingAppointments(appointments, DEMO_PATIENT.id, todayISO()),
    [appointments]
  );

  const doctorsById = useMemo(() => {
    const map = new Map<string, Doctor>();
    for (const d of doctors) map.set(d.id, d);
    return map;
  }, [doctors]);

  const handleCancel = useCallback(
    (appointment: Appointment) => setPendingCancel(appointment),
    []
  );

  const pendingDoctor = pendingCancel
    ? (doctorsById.get(pendingCancel.doctorId) ?? null)
    : null;

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-medium text-foreground">
        My upcoming appointments
      </h2>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white px-6 py-10 text-center">
          <CalendarCheck
            className="size-6 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-medium text-foreground">
            No upcoming appointments
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Book a slot above and it will show up here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-white">
          {upcoming.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              doctor={doctorsById.get(appointment.doctorId)}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      <CancelDialog
        appointment={pendingCancel}
        doctor={pendingDoctor}
        onOpenChange={(open) => {
          if (!open) setPendingCancel(null);
        }}
        onCancelled={() => setPendingCancel(null)}
      />
    </section>
  );
}
