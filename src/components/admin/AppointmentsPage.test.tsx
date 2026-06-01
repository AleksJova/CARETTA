import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AppointmentsPage from './AppointmentsPage';
import { useMedicalStore } from '@/stores/medicalStore/medicalStore';
import { todayISO } from '@/utils';
import type { Appointment, Doctor, Patient } from '@/types';

const DOCTOR: Doctor = {
  id: 'doc-1',
  name: 'Dr. Emily Carter',
  specialty: 'Cardiology',
  shift: 'morning',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  daysOff: [],
};

const PATIENT: Patient = {
  id: 'pat-1',
  name: 'Ana Rivera',
  email: 'ana@example.com',
  phone: '+1 (555) 0111',
};

// Appointments are dated today so they fall within the page's default
// (today) date filter.
function appointment(id: string, status: Appointment['status']): Appointment {
  return {
    id,
    doctorId: DOCTOR.id,
    patientId: PATIENT.id,
    date: todayISO(),
    startTime: '09:00',
    endTime: '10:00',
    status,
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AppointmentsPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  // Persisted filters would otherwise bleed across tests.
  sessionStorage.clear();
  useMedicalStore.setState({
    doctors: [DOCTOR],
    patients: [PATIENT],
    appointments: [],
  });
});

afterEach(cleanup);

describe('AppointmentsPage', () => {
  it('shows the empty admin state when there are no appointments', () => {
    renderPage();
    expect(screen.getByText('No appointments found')).toBeInTheDocument();
  });

  it('renders a row per appointment with patient, doctor and specialty', () => {
    useMedicalStore.setState({
      appointments: [appointment('a-1', 'confirmed')],
    });
    renderPage();

    const row = screen.getByText('Ana Rivera').closest('tr')!;
    expect(within(row).getByText('Dr. Emily Carter')).toBeInTheDocument();
    expect(within(row).getByText('Cardiology')).toBeInTheDocument();
    // A confirmed appointment reads as "Pending" in the admin view.
    expect(within(row).getByText('Pending')).toBeInTheDocument();
  });

  it('excludes cancelled appointments from the admin view', () => {
    useMedicalStore.setState({
      appointments: [
        appointment('a-confirmed', 'confirmed'),
        appointment('a-cancelled', 'cancelled'),
      ],
    });
    renderPage();

    // One visible data row (the confirmed/"Pending" one); the cancelled row is gone.
    expect(screen.queryByText('Cancelled')).not.toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('only offers Complete for confirmed appointments; completed rows show a dash', () => {
    useMedicalStore.setState({
      appointments: [
        appointment('a-confirmed', 'confirmed'),
        appointment('a-completed', 'completed'),
      ],
    });
    renderPage();

    // Exactly one Complete button — for the single confirmed row.
    expect(screen.getAllByRole('button', { name: /complete/i })).toHaveLength(
      1
    );
  });

  it('marks a confirmed appointment complete via the store action', async () => {
    const user = userEvent.setup();
    useMedicalStore.setState({
      appointments: [appointment('a-1', 'confirmed')],
    });
    renderPage();

    await user.click(screen.getByRole('button', { name: /complete/i }));

    expect(useMedicalStore.getState().appointments[0].status).toBe('completed');
    // The action disappears once the row is terminal.
    expect(
      screen.queryByRole('button', { name: /complete/i })
    ).not.toBeInTheDocument();
  });
});
