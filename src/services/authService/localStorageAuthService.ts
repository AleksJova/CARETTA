import type { AuthService } from './authServiceContract';

const KEY = 'caretta:role';

export const authService: AuthService = {
  getRole: () => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw === 'patient' || raw === 'admin' ? raw : null;
    } catch {
      return null;
    }
  },
  saveRole: (role) => {
    try {
      localStorage.setItem(KEY, role);
      return true;
    } catch {
      return false;
    }
  },
  clearRole: () => {
    try {
      localStorage.removeItem(KEY);
      return true;
    } catch {
      return false;
    }
  },
};
