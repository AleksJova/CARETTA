import type { Role } from '@/types';

export interface AuthService {
  getRole(): Role | null;
  saveRole(role: Role): boolean;
  clearRole(): boolean;
}
