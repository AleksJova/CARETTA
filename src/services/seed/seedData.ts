import type { Appointment, Doctor, Patient } from '@/types';
import { getWeekStart, todayISO } from '@/utils';

// Demo seed data
export const SEED_DOCTORS: Doctor[] = [
  {
    id: 'doc-carter',
    name: 'Dr. Emily Carter',
    specialty: 'Cardiology',
    shift: 'morning',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    daysOff: [],
  },
  {
    id: 'doc-fernandez',
    name: 'Dr. Lucía Fernández',
    specialty: 'Cardiology',
    shift: 'afternoon',
    workingDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    daysOff: [],
  },
  {
    id: 'doc-stefanoska',
    name: 'Dr. Marija Stefanoska',
    specialty: 'Pulmonology',
    shift: 'morning',
    workingDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    daysOff: [],
  },
  {
    id: 'doc-ruiz',
    name: 'Dr. Begoña Ruiz',
    specialty: 'Dermatology',
    shift: 'afternoon',
    workingDays: ['Tue', 'Wed', 'Thu', 'Sat'],
    daysOff: [],
  },
];

export const DEMO_PATIENT: Patient = {
  id: 'pat-demo',
  name: 'Patient Demo',
  email: 'patient@example.com',
  phone: '+1 (555) 0100',
};

const SEED_OTHER_PATIENTS: Patient[] = [
  {
    id: 'pat-ana',
    name: 'Ana Rivera',
    email: 'ana@example.com',
    phone: '+1 (555) 0111',
  },
];

export const SEED_PATIENTS: Patient[] = [DEMO_PATIENT, ...SEED_OTHER_PATIENTS];

// `dayOffset` is days from the current week's Monday, so the demo always lands
// in the present week rather than drifting into the past as days pass.
interface SeedAppointmentSpec extends Omit<Appointment, 'date'> {
  dayOffset: number;
}

const SEED_APPOINTMENT_SPECS: SeedAppointmentSpec[] = [
  {
    id: 'appt-1',
    doctorId: 'doc-carter',
    patientId: 'pat-ana',
    dayOffset: 0,
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed',
  },
  {
    id: 'appt-2',
    doctorId: 'doc-stefanoska',
    patientId: 'pat-demo',
    dayOffset: 0,
    startTime: '08:00',
    endTime: '09:00',
    status: 'completed',
  },
  {
    id: 'appt-3',
    doctorId: 'doc-fernandez',
    patientId: 'pat-ana',
    dayOffset: 0,
    startTime: '14:00',
    endTime: '15:00',
    status: 'confirmed',
  },
  {
    id: 'appt-4',
    doctorId: 'doc-ruiz',
    patientId: 'pat-demo',
    dayOffset: 1,
    startTime: '15:00',
    endTime: '16:00',
    status: 'confirmed',
  },
];

// IDs of the demo appointments — used to re-anchor only these, never user data.
export const SEED_APPOINTMENT_IDS: ReadonlySet<string> = new Set(
  SEED_APPOINTMENT_SPECS.map((s) => s.id)
);

function weekdayISO(days: number): string {
  const monday = new Date(`${getWeekStart(todayISO())}T00:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() + days);
  return monday.toISOString().slice(0, 10);
}

export function buildSeedAppointments(): Appointment[] {
  return SEED_APPOINTMENT_SPECS.map(({ dayOffset, ...rest }) => ({
    ...rest,
    date: weekdayISO(dayOffset),
  }));
}

// The current-week date a demo appointment should sit on, or null if the id is
// not a demo appointment (so callers leave user-created bookings untouched).
export function seedAppointmentDate(id: string): string | null {
  const spec = SEED_APPOINTMENT_SPECS.find((s) => s.id === id);
  return spec ? weekdayISO(spec.dayOffset) : null;
}
