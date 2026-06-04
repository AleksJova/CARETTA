import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, screen, within } from '@testing-library/react';
import {
  CARDIOLOGIST,
  WEDNESDAY,
  makeUser,
  renderAdminAppointments,
  renderAdminDoctors,
  renderPatientView,
  setupClinic,
  teardownClinic,
} from './flows/fixtures';
import { useMedicalStore } from '@/stores/medicalStore/medicalStore';

function bookButtons(): HTMLElement[] {
  return screen.queryAllByRole('button', { name: /^Book/i });
}

// Admin flow: open the day-off dialog for the doctor, pick a day, mark it off.
async function markDoctorOff(
  user: ReturnType<typeof makeUser>,
  dayName: string
): Promise<void> {
  await user.click(
    screen.getByRole('button', { name: /Mark a day off for Dr. Emily Carter/ })
  );
  await user.click(screen.getByLabelText('Date'));
  await user.click(screen.getByRole('button', { name: new RegExp(dayName) }));
  await user.click(screen.getByRole('button', { name: /^Mark off$/ }));
}

// Patient flow: pick a day and search.
async function patientSearch(
  user: ReturnType<typeof makeUser>,
  dayName: string
): Promise<void> {
  await user.click(screen.getByLabelText('Date'));
  await user.click(screen.getByRole('button', { name: new RegExp(dayName) }));
  await user.click(screen.getByRole('button', { name: /search/i }));
}

beforeEach(() => setupClinic({ doctors: [CARDIOLOGIST] }));
afterEach(() => {
  cleanup();
  teardownClinic();
});

describe('Day-off enforcement flow', () => {
  it('a day the admin marks off has no slots for the patient', async () => {
    const user = makeUser();

    // The admin marks Wednesday off for the doctor.
    renderAdminDoctors();
    await markDoctorOff(user, 'Wednesday, June 3rd, 2026');
    expect(useMedicalStore.getState().doctors[0].daysOff).toContain(WEDNESDAY);

    // Switching to the patient view, Wednesday now offers nothing.
    cleanup();
    renderPatientView();
    await patientSearch(user, 'Wednesday, June 3rd, 2026');
    expect(screen.getByText('No available slots')).toBeInTheDocument();
    expect(bookButtons()).toHaveLength(0);
  });

  it('leaves the surrounding days untouched', async () => {
    const user = makeUser();

    renderAdminDoctors();
    await markDoctorOff(user, 'Wednesday, June 3rd, 2026');

    // Tuesday, the day before the day off, still has its full five slots.
    cleanup();
    renderPatientView();
    await patientSearch(user, 'Tuesday, June 2nd, 2026');
    expect(bookButtons()).toHaveLength(5);
  });

  it('refuses to mark a day off when an appointment is booked that day', async () => {
    const user = makeUser();

    // The patient books a slot on Wednesday first.
    renderPatientView();
    await patientSearch(user, 'Wednesday, June 3rd, 2026');
    await user.click(bookButtons()[0]);
    await user.click(screen.getByRole('button', { name: /confirm booking/i }));

    // The admin then tries to mark that same Wednesday off.
    cleanup();
    renderAdminDoctors();
    await user.click(
      screen.getByRole('button', {
        name: /Mark a day off for Dr. Emily Carter/,
      })
    );
    await user.click(screen.getByLabelText('Date'));
    await user.click(
      screen.getByRole('button', { name: /Wednesday, June 3rd, 2026/ })
    );

    // The action is blocked with a clear reason, and no day off is recorded.
    expect(screen.getByRole('button', { name: /^Mark off$/ })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(/appointment/i);
    expect(useMedicalStore.getState().doctors[0].daysOff).toHaveLength(0);
  });

  it('shows the empty admin appointments view when nothing is booked', () => {
    // With no appointments anywhere, the admin sees the empty state.
    renderAdminAppointments();
    expect(screen.getByText('No appointments found')).toBeInTheDocument();
  });

  it('lists the day off back in the admin summary once it is set', async () => {
    const user = makeUser();

    renderAdminDoctors();
    await markDoctorOff(user, 'Wednesday, June 3rd, 2026');

    // The "Days off this week" panel reflects the new day off.
    const summary = screen.getByText(/Days off this week/).closest('div')!;
    expect(within(summary).getByText(/Dr. Emily Carter/)).toBeInTheDocument();
  });
});
