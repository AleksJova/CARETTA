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
  email: string;
  phone: string;
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
}

// Result of an operation. Success has ok: true and optional data; failure has ok: false and reason.
export type Result<T = void> =
  | ([T] extends [void] ? { ok: true } : { ok: true; data: T })
  | { ok: false; reason: string };

// A booking attempt is a slot the patient wants to claim, plus their identity
export interface BookingRequest extends Slot {
  patientId: string;
}
