export type Shift = 'morning' | 'afternoon';

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled';

export type Role = 'patient' | 'admin';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  shift: Shift;
  workingDays: Weekday[];
  daysOff: string[]; // ISO date strings
}

export interface Patient {
  id: string;
  name: string;
  contact: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
}

// Derived at runtime from Doctor schedules and Appointments — never persisted
export interface Slot {
  doctorId: string;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'available' | 'booked';
}
