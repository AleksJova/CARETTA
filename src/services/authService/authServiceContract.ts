import type { Role } from '@/types';

export interface AuthService {
  getRole(): Role | null;
  saveRole(role: Role): boolean;
  clearRole(): boolean;
  getPatientId(): string | null;
  savePatientId(patientId: string): boolean;
  clearPatientId(): boolean;
}
