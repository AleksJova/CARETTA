import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '@/types';
import { useRole } from '@/stores/authStore/authStore';
import { HOME_PATH } from '@/routes';

/**
 * Route guard. Renders the nested routes (<Outlet/>) only when the signed-in role matches `allow`.
 * Otherwise it redirects:
 *   - no role at all     -> login ("/")
 *   - wrong role         -> back to the chosen role's home page
 */
export default function RequireRole({ allow }: { allow: Role }) {
  const role = useRole();

  if (role === null) return <Navigate to="/" replace />;
  if (role !== allow) return <Navigate to={HOME_PATH[role]} replace />;

  return <Outlet />;
}
