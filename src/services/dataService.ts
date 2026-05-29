import type { Appointment, Doctor, Patient } from '../types';

export interface DataService {
  getDoctors(): Doctor[];
  saveDoctors(doctors: Doctor[]): boolean;

  getPatients(): Patient[];
  savePatients(patients: Patient[]): boolean;

  getAppointments(): Appointment[];
  saveAppointments(appointments: Appointment[]): boolean;
}
