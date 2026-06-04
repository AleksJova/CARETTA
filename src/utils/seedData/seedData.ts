import type { Appointment, Doctor, Patient } from '@/types';
import { getWeekStart } from '@/utils/getWeekStart/getWeekStart';
import { todayISO } from '@/utils/isoDate/isoDate';
import { dataService } from '@/services';
import raw from './seedData.json';

// Convert relative day offsets to ISO dates for the current week.
interface RawDayOff {
  dayOffset: number;
}
interface RawDoctor extends Omit<Doctor, 'daysOff'> {
  daysOff: RawDayOff[];
}
interface RawAppointment extends Omit<Appointment, 'date'> {
  dayOffset: number;
}
interface RawSeed {
  patients: Patient[];
  doctors: RawDoctor[];
  appointments: RawAppointment[];
}

const data = raw as RawSeed;

function weekdayISO(days: number): string {
  const monday = new Date(`${getWeekStart(todayISO())}T00:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() + days);
  return monday.toISOString().slice(0, 10);
}

const SEED_PATIENTS: Patient[] = data.patients;

const SEED_DOCTORS: Doctor[] = data.doctors.map((d) => ({
  ...d,
  daysOff: d.daysOff.map((o) => weekdayISO(o.dayOffset)),
}));

function buildSeedAppointments(): Appointment[] {
  return data.appointments.map(({ dayOffset, ...rest }) => ({
    ...rest,
    date: weekdayISO(dayOffset),
  }));
}

export function isSeeded(): boolean {
  return (
    dataService.getDoctors().length > 0 ||
    dataService.getPatients().length > 0 ||
    dataService.getAppointments().length > 0
  );
}

export function toggleSeed(): void {
  if (isSeeded()) {
    dataService.saveDoctors([]);
    dataService.savePatients([]);
    dataService.saveAppointments([]);
  } else {
    dataService.saveDoctors(SEED_DOCTORS);
    dataService.savePatients(SEED_PATIENTS);
    dataService.saveAppointments(buildSeedAppointments());
  }
  window.location.reload();
}
