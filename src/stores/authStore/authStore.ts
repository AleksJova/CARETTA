import { create } from 'zustand';
import { authService, slotSearchService } from '@/services';
import { clearAppointmentFilters } from '@/components/admin/appointmentFilterStorage';
import type { AuthStore } from './authStoreContract';

// A new session must never inherit the previous user's persisted filters.
function clearPersistedFilters(): void {
  slotSearchService.clear();
  clearAppointmentFilters();
}

const initialRole = authService.getRole();

export const useAuthStore = create<AuthStore>((set) => ({
  role: initialRole,
  // Restore a persisted patient identity only for a patient session.
  patientId: initialRole === 'patient' ? authService.getPatientId() : null,
  loginAs: (role) => {
    clearPersistedFilters();
    authService.saveRole(role);
    // Entering a role always drops any prior patient identity; the patient
    // flow re-establishes it via selectPatient.
    authService.clearPatientId();
    set({ role, patientId: null });
  },
  selectPatient: (patientId) => {
    authService.savePatientId(patientId);
    set({ patientId });
  },
  logout: () => {
    clearPersistedFilters();
    authService.clearRole();
    authService.clearPatientId();
    set({ role: null, patientId: null });
  },
}));

export const useRole = () => useAuthStore((s) => s.role);
export const usePatientId = () => useAuthStore((s) => s.patientId);
