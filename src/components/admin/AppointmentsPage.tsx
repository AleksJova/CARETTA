import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarX } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/patient/DatePicker';
import {
  useAppointments,
  useDoctors,
  usePatients,
  useMedicalStore,
} from '@/stores/medicalStore/medicalStore';
import { notify } from '@/components/shared/notify';
import { todayISO } from '@/utils';
import {
  AppointmentAdminRow,
  type AppointmentRowData,
} from './AppointmentAdminRow';
import {
  readAppointmentFilters,
  writeAppointmentFilters,
} from './appointmentFilterStorage';
import type { AppointmentStatus, Doctor, Patient } from '@/types';

// Radix Select can't hold an empty value, so "no constraint" needs a sentinel.
const ANY = '__any__';

// A 'confirmed' appointment reads as "Pending" in the admin view.
const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'confirmed', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export default function AppointmentsPage() {
  const appointments = useAppointments();
  const doctors = useDoctors();
  const patients = usePatients();
  const completeAppointment = useMedicalStore((s) => s.completeAppointment);

  const today = todayISO();
  // Filter state is local (not in the store), seeded from sessionStorage so it
  // survives a refresh.
  const [initial] = useState(() => readAppointmentFilters(today));
  const [doctorFilter, setDoctorFilter] = useState<string | undefined>(
    initial.doctorId
  );
  const [statusFilter, setStatusFilter] = useState<
    AppointmentStatus | undefined
  >(initial.status);
  const [dateFilter, setDateFilter] = useState<string>(initial.date);

  useEffect(() => {
    writeAppointmentFilters({
      doctorId: doctorFilter,
      status: statusFilter,
      date: dateFilter,
    });
  }, [doctorFilter, statusFilter, dateFilter]);

  const doctorsById = useMemo(() => {
    const map = new Map<string, Doctor>();
    for (const d of doctors) map.set(d.id, d);
    return map;
  }, [doctors]);

  const patientsById = useMemo(() => {
    const map = new Map<string, Patient>();
    for (const p of patients) map.set(p.id, p);
    return map;
  }, [patients]);

  const rows = useMemo<AppointmentRowData[]>(() => {
    return appointments
      .filter((a) => a.status !== 'cancelled')
      .filter((a) => !doctorFilter || a.doctorId === doctorFilter)
      .filter((a) => !statusFilter || a.status === statusFilter)
      .filter((a) => a.date === dateFilter)
      .sort((a, b) =>
        a.date === b.date
          ? a.startTime.localeCompare(b.startTime)
          : a.date.localeCompare(b.date)
      )
      .map((appointment) => {
        const doctor = doctorsById.get(appointment.doctorId);
        return {
          appointment,
          patientName:
            patientsById.get(appointment.patientId)?.name ?? 'Unknown patient',
          doctorName: doctor?.name ?? 'Unknown doctor',
          specialty: doctor?.specialty ?? '—',
        };
      });
  }, [
    appointments,
    doctorFilter,
    statusFilter,
    dateFilter,
    doctorsById,
    patientsById,
  ]);

  const handleComplete = useCallback(
    (id: string) => {
      completeAppointment(id);
      notify.success('Appointment completed');
    },
    [completeAppointment]
  );

  const sortedDoctors = useMemo(
    () => [...doctors].sort((a, b) => a.name.localeCompare(b.name)),
    [doctors]
  );

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-foreground">
          All appointments
        </h1>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-white p-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="appt-doctor"
            className="text-xs text-muted-foreground"
          >
            Doctor
          </Label>
          <Select
            value={doctorFilter ?? ANY}
            onValueChange={(v) => setDoctorFilter(v === ANY ? undefined : v)}
          >
            <SelectTrigger id="appt-doctor" className="h-9 min-w-36">
              <SelectValue placeholder="All doctors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All doctors</SelectItem>
              {sortedDoctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="appt-status"
            className="text-xs text-muted-foreground"
          >
            Status
          </Label>
          <Select
            value={statusFilter ?? ANY}
            onValueChange={(v) =>
              setStatusFilter(v === ANY ? undefined : (v as AppointmentStatus))
            }
          >
            <SelectTrigger id="appt-status" className="h-9 min-w-28">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Date</Label>
          <div className="flex items-center gap-2">
            <DatePicker
              value={dateFilter}
              minISO="2000-01-01"
              onChange={setDateFilter}
            />
            {/* Clear resets to today, so only show it when off today. */}
            {dateFilter !== today && (
              <button
                type="button"
                onClick={() => setDateFilter(today)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white">
        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CalendarX
              className="mx-auto size-6 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-medium text-foreground">
              No appointments found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              No appointments have been booked for this date yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-left text-muted-foreground">
                  <th className="px-3 py-2.5 font-medium">Patient</th>
                  <th className="px-3 py-2.5 font-medium">Doctor</th>
                  <th className="px-3 py-2.5 font-medium">Specialty</th>
                  <th className="px-3 py-2.5 font-medium">Date &amp; time</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <AppointmentAdminRow
                    key={row.appointment.id}
                    {...row}
                    onComplete={handleComplete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
