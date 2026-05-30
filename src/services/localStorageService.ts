import type { Appointment, Doctor, Patient } from '../types';
import type { DataService } from './dataServiceContract';

const KEYS = {
  doctors: 'caretta:doctors',
  patients: 'caretta:patients',
  appointments: 'caretta:appointments',
} as const;

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    // Corrupt or unparseable data; treat as missing
    return [];
  }
}

function write<T>(key: string, data: T[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

const localStorageService: DataService = {
  getDoctors: () => read<Doctor>(KEYS.doctors),
  saveDoctors: (doctors) => write(KEYS.doctors, doctors),

  getPatients: () => read<Patient>(KEYS.patients),
  savePatients: (patients) => write(KEYS.patients, patients),

  getAppointments: () => read<Appointment>(KEYS.appointments),
  saveAppointments: (appointments) => write(KEYS.appointments, appointments),
};

export const dataService = localStorageService;
