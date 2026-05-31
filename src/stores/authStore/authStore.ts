import { create } from 'zustand';
import { authService } from '@/services';
import type { AuthStore } from './authStoreContract';

export const useAuthStore = create<AuthStore>((set) => ({
  role: authService.getRole(),
  loginAs: (role) => {
    authService.saveRole(role);
    set({ role });
  },
  logout: () => {
    authService.clearRole();
    set({ role: null });
  },
}));

export const useRole = () => useAuthStore((s) => s.role);
