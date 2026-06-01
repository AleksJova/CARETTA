import { create } from 'zustand';
import { authService, slotSearchService } from '@/services';
import { clearAppointmentFilters } from '@/components/admin/appointmentFilterStorage';
import type { AuthStore } from './authStoreContract';

// A new session must never inherit the previous user's persisted filters.
function clearPersistedFilters(): void {
  slotSearchService.clear();
  clearAppointmentFilters();
}

export const useAuthStore = create<AuthStore>((set) => ({
  role: authService.getRole(),
  loginAs: (role) => {
    clearPersistedFilters();
    authService.saveRole(role);
    set({ role });
  },
  logout: () => {
    clearPersistedFilters();
    authService.clearRole();
    set({ role: null });
  },
}));

export const useRole = () => useAuthStore((s) => s.role);
