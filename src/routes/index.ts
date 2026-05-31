import type { Role } from '@/types';

/**
 * Where each role lives. Single source of truth shared by the router, the
 * login redirect, and the route guard so the mapping never drifts.
 */
export const HOME_PATH: Record<Role, string> = {
  patient: '/patient',
  admin: '/admin',
};
