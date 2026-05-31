import type { Role } from '@/types';

export interface AuthStore {
  role: Role | null;
  loginAs: (role: Role) => void;
  logout: () => void;
}
