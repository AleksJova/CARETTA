import type { AppointmentStatus } from '@/types';

export interface AppointmentFilterState {
  doctorId?: string;
  status?: AppointmentStatus;
  // A specific ISO day, or undefined to show the whole current week.
  date?: string;
}

const STORAGE_KEY = 'caretta:admin:appointmentFilters';

const VALID_STATUSES: AppointmentStatus[] = ['confirmed', 'completed'];

// Restores all three filters across a refresh. The date is a specific ISO day
// or undefined for the whole-week view.
export function readAppointmentFilters(): AppointmentFilterState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<AppointmentFilterState>;
    return {
      doctorId:
        typeof parsed.doctorId === 'string' ? parsed.doctorId : undefined,
      status:
        parsed.status && VALID_STATUSES.includes(parsed.status)
          ? parsed.status
          : undefined,
      date: typeof parsed.date === 'string' ? parsed.date : undefined,
    };
  } catch (error) {
    console.warn('Failed to read appointment filters', error);
    return {};
  }
}

export function writeAppointmentFilters(state: AppointmentFilterState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to persist appointment filters', error);
  }
}

// Cleared on login/logout so a new session doesn't inherit prior filters.
export function clearAppointmentFilters(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear appointment filters', error);
  }
}
