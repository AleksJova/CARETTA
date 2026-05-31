import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRole } from '@/stores/authStore/authStore';
import { HOME_PATH } from '@/routes';
import LoginScreen from '@/components/auth/LoginScreen';
import RequireRole from '@/components/shared/RequireRole';
import PatientLayout from '@/components/patient/PatientLayout';
import AdminLayout from '@/components/admin/AdminLayout';

/**
 * Index ("/"): the login screen when signed out,
 * otherwise bounce to the chosen signed-in role's home.
 */
function Index() {
  const role = useRole();
  if (role) return <Navigate to={HOME_PATH[role]} replace />;
  return <LoginScreen />;
}

/**
 * App shell + routing. Role gating is enforced by RequireRole on each branch:
 * a patient who navigates to /admin is redirected to /patient, and vice versa.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />

        <Route element={<RequireRole allow="patient" />}>
          <Route path="/patient" element={<PatientLayout />} />
        </Route>

        <Route element={<RequireRole allow="admin" />}>
          <Route path="/admin" element={<AdminLayout />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
