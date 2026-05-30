import { type BookingRequest } from '@/types';
import type { Appointment, Doctor, Patient, Result } from '@/types';

export interface MedicalStore {
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];

  // Doctor actions
  addDoctor: (doctor: Doctor) => void;
  updateDoctor: (id: string, patch: Partial<Omit<Doctor, 'id'>>) => void;
  setDoctorDayOff: (doctorId: string, isoDate: string) => void;
  removeDoctorDayOff: (doctorId: string, isoDate: string) => void;

  // Patient actions
  addPatient: (patient: Patient) => void;

  // Appointment actions
  bookAppointment: (input: BookingRequest) => Result<Appointment>;
  cancelAppointment: (id: string) => void;
  completeAppointment: (id: string) => void;
}
