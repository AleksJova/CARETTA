import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRole, usePatientId } from '@/stores/authStore/authStore';
import { HOME_PATH } from '@/routes';
import LoginScreen from '@/components/auth/LoginScreen';
import PatientSelect from '@/components/auth/PatientSelect';
import RequireRole from '@/components/shared/RequireRole';
import PatientLayout from '@/components/patient/PatientLayout';
import AdminLayout from '@/components/admin/AdminLayout';
import DoctorsPage from '@/components/admin/DoctorsPage';
import AppointmentsPage from '@/components/admin/AppointmentsPage';
import { Toaster } from '@/components/shared/Toaster';

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
 * Patient branch: a patient session needs a chosen identity before the view
 * renders. Without one, show the patient-select / register step.
 */
function PatientHome() {
  const patientId = usePatientId();
  return patientId ? <PatientLayout /> : <PatientSelect />;
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
          <Route path="/patient" element={<PatientHome />} />
        </Route>

        <Route element={<RequireRole allow="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DoctorsPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
