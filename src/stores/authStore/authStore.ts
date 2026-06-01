import { create } from 'zustand';
import { authService, slotSearchService } from '@/services';
import type { AuthStore } from './authStoreContract';

export const useAuthStore = create<AuthStore>((set) => ({
  role: authService.getRole(),
  loginAs: (role) => {
    // Start each session with a clean filter slate — a new login should never
    // inherit a previous user's persisted slot search.
    slotSearchService.clear();
    authService.saveRole(role);
    set({ role });
  },
  logout: () => {
    slotSearchService.clear();
    authService.clearRole();
    set({ role: null });
  },
}));

export const useRole = () => useAuthStore((s) => s.role);
