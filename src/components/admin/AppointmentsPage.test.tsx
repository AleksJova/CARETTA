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

function appointment(id: string, status: Appointment['status']): Appointment {
  return {
    id,
    doctorId: DOCTOR.id,
    patientId: PATIENT.id,
    date: todayISO(),
    startTime: '00:00',
    endTime: '00:01',
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

    expect(within(row).getByText('Awaiting completion')).toBeInTheDocument();
  });

  it('only offers Complete for an awaiting (past, confirmed) appointment; completed rows show a dash', () => {
    useMedicalStore.setState({
      appointments: [
        appointment('a-confirmed', 'confirmed'),
        appointment('a-completed', 'completed'),
      ],
    });
    renderPage();

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

    expect(
      screen.queryByRole('button', { name: /complete/i })
    ).not.toBeInTheDocument();
  });
});
