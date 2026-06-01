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
  {
    id: 'pat-james',
    name: 'James Lee',
    email: 'james@example.com',
    phone: '+1 (555) 0112',
  },
  {
    id: 'pat-sara',
    name: 'Sara Okonkwo',
    email: 'sara@example.com',
    phone: '+1 (555) 0113',
  },
  {
    id: 'pat-tom',
    name: 'Tom Fischer',
    email: 'tom@example.com',
    phone: '+1 (555) 0114',
  },
];

export const SEED_PATIENTS: Patient[] = [DEMO_PATIENT, ...SEED_OTHER_PATIENTS];

function weekdayISO(days: number): string {
  const monday = new Date(`${getWeekStart(todayISO())}T00:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() + days);
  return monday.toISOString().slice(0, 10);
}

export function buildSeedAppointments(): Appointment[] {
  return [
    {
      id: 'appt-1',
      doctorId: 'doc-carter',
      patientId: 'pat-ana',
      date: weekdayISO(0),
      startTime: '09:00',
      endTime: '10:00',
      status: 'confirmed',
    },
    {
      id: 'appt-2',
      doctorId: 'doc-stefanoska',
      patientId: 'pat-james',
      date: weekdayISO(0),
      startTime: '08:00',
      endTime: '09:00',
      status: 'completed',
    },
    {
      id: 'appt-3',
      doctorId: 'doc-fernandez',
      patientId: 'pat-sara',
      date: weekdayISO(0),
      startTime: '14:00',
      endTime: '15:00',
      status: 'cancelled',
    },
    {
      id: 'appt-4',
      doctorId: 'doc-ruiz',
      patientId: 'pat-tom',
      date: weekdayISO(1),
      startTime: '15:00',
      endTime: '16:00',
      status: 'confirmed',
    },
  ];
}
