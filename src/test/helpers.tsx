import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PatientLayout from '@/components/patient/PatientLayout';
import AppointmentsPage from '@/components/admin/AppointmentsPage';
import DoctorsPage from '@/components/admin/DoctorsPage';
import { useMedicalStore } from '@/stores/medicalStore/medicalStore';
import { useAuthStore } from '@/stores/authStore/authStore';
import type { Appointment, Doctor, Patient } from '@/types';

// The clinic week these flows run in. We freeze the clock to Monday 6am so the
// week's slots are always in the future and the tests never depend on real time.
export const MONDAY = '2026-06-01';
export const TUESDAY = '2026-06-02';
export const WEDNESDAY = '2026-06-03';

// A full-week morning cardiologist: 5 one-hour slots a day, 08:00 to 13:00.
export const CARDIOLOGIST: Doctor = {
  id: 'doc-cardio',
  name: 'Dr. Emily Carter',
  specialty: 'Cardiology',
  shift: 'morning',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  daysOff: [],
};

// A full-week afternoon dermatologist: 6 one-hour slots a day, 13:00 to 19:00.
export const DERMATOLOGIST: Doctor = {
  id: 'doc-derm',
  name: 'Dr. Liam Brooks',
  specialty: 'Dermatology',
  shift: 'afternoon',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  daysOff: [],
};

export const PATIENT: Patient = {
  id: 'pat-1',
  name: 'Ana Rivera',
  email: 'ana@example.com',
  phone: '+1 (555) 0111',
};

interface SeedState {
  doctors?: Doctor[];
  patients?: Patient[];
  appointments?: Appointment[];
}

// Freezes time to Monday 6am, clears storage, and seeds the stores. Call from a
// beforeEach so every flow starts from the same clean clinic state.
export function setupClinic(state: SeedState = {}): void {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(2026, 5, 1, 6, 0, 0));
  localStorage.clear();
  sessionStorage.clear();
  useMedicalStore.setState({
    doctors: state.doctors ?? [CARDIOLOGIST],
    patients: state.patients ?? [PATIENT],
    appointments: state.appointments ?? [],
  });
}

export function teardownClinic(): void {
  vi.useRealTimers();
}

// A keyboard/pointer driver whose timers advance with our fake clock.
export function makeUser() {
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
}

// Signs in as the patient and renders their booking view.
export function renderPatientView(): void {
  useAuthStore.setState({ role: 'patient', patientId: PATIENT.id });
  render(
    <MemoryRouter>
      <PatientLayout />
    </MemoryRouter>
  );
}

// Signs in as an admin and renders the all-appointments view.
export function renderAdminAppointments(): void {
  useAuthStore.setState({ role: 'admin', patientId: null });
  render(
    <MemoryRouter>
      <AppointmentsPage />
    </MemoryRouter>
  );
}

// Signs in as an admin and renders the doctors / day-off view.
export function renderAdminDoctors(): void {
  useAuthStore.setState({ role: 'admin', patientId: null });
  render(
    <MemoryRouter>
      <DoctorsPage />
    </MemoryRouter>
  );
}
