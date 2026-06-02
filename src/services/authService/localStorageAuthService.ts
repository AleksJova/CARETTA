import type { AuthService } from './authServiceContract';

const KEY = 'caretta:role';
const PATIENT_KEY = 'caretta:patientId';

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

  getPatientId: () => {
    try {
      return localStorage.getItem(PATIENT_KEY);
    } catch {
      return null;
    }
  },
  savePatientId: (patientId) => {
    try {
      localStorage.setItem(PATIENT_KEY, patientId);
      return true;
    } catch {
      return false;
    }
  },
  clearPatientId: () => {
    try {
      localStorage.removeItem(PATIENT_KEY);
      return true;
    } catch {
      return false;
    }
  },
};
