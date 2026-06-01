import { create } from 'zustand';
import { authService } from '@/services';
import type { AuthStore } from './authStoreContract';
import { clearSlotSearch } from '@/components/patient/slotSearchStorage';

export const useAuthStore = create<AuthStore>((set) => ({
  role: authService.getRole(),
  loginAs: (role) => {
    // Start each session with a clean filter slate — a new login should never
    // inherit a previous user's persisted slot search.
    clearSlotSearch();
    authService.saveRole(role);
    set({ role });
  },
  logout: () => {
    clearSlotSearch();
    authService.clearRole();
    set({ role: null });
  },
}));

export const useRole = () => useAuthStore((s) => s.role);
