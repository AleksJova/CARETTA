import type { Role } from '@/types';

export interface AuthStore {
  role: Role | null;
  patientId: string | null;
  loginAs: (role: Role) => void;
  selectPatient: (patientId: string) => void;
  logout: () => void;
}
