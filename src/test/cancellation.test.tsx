import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, screen, within } from '@testing-library/react';
import {
  CARDIOLOGIST,
  makeUser,
  renderPatientView,
  setupClinic,
  teardownClinic,
} from './flows/fixtures';
import { useMedicalStore } from '@/stores/medicalStore/medicalStore';

async function searchWednesday(
  user: ReturnType<typeof makeUser>
): Promise<void> {
  await user.click(screen.getByLabelText('Date'));
  await user.click(
    screen.getByRole('button', { name: /Wednesday, June 3rd, 2026/ })
  );
  await user.click(screen.getByRole('button', { name: /search/i }));
}

function bookButtons(): HTMLElement[] {
  return screen.getAllByRole('button', { name: /^Book/i });
}

// Books the very first available slot and returns its "Book ..." label so the
// test can later check that exact slot comes back.
async function bookFirstSlot(
  user: ReturnType<typeof makeUser>
): Promise<string> {
  const label = bookButtons()[0].getAttribute('aria-label') ?? '';
  await user.click(bookButtons()[0]);
  await user.click(screen.getByRole('button', { name: /confirm booking/i }));
  return label;
}

beforeEach(() => setupClinic({ doctors: [CARDIOLOGIST] }));
afterEach(() => {
  cleanup();
  teardownClinic();
});

describe('Cancellation flow', () => {
  it('cancelling an appointment makes its slot bookable again', async () => {
    const user = makeUser();
    renderPatientView();

    await searchWednesday(user);
    const bookedLabel = await bookFirstSlot(user);
    // One slot is gone right after booking.
    expect(bookButtons()).toHaveLength(4);

    // The patient cancels from the upcoming list and confirms the warning.
    const upcoming = screen
      .getByText('My upcoming appointments')
      .closest('section')!;
    await user.click(within(upcoming).getByRole('button', { name: /^Cancel/ }));
    await user.click(
      screen.getByRole('button', { name: /cancel appointment/i })
    );

    // The freed slot is back in the list, so all five are available again.
    const labels = bookButtons().map((b) => b.getAttribute('aria-label'));
    expect(labels).toHaveLength(5);
    expect(labels).toContain(bookedLabel);
  });

  it('removes the appointment from the upcoming list once cancelled', async () => {
    const user = makeUser();
    renderPatientView();

    await searchWednesday(user);
    await bookFirstSlot(user);

    const upcoming = screen
      .getByText('My upcoming appointments')
      .closest('section')!;
    expect(within(upcoming).getByText(/Dr. Emily Carter/)).toBeInTheDocument();

    await user.click(within(upcoming).getByRole('button', { name: /^Cancel/ }));
    await user.click(
      screen.getByRole('button', { name: /cancel appointment/i })
    );

    // The empty-state message replaces the appointment row.
    expect(
      within(upcoming).getByText('No upcoming appointments')
    ).toBeInTheDocument();
    expect(useMedicalStore.getState().appointments).toHaveLength(0);
  });

  it('keeps the appointment when the patient backs out of cancelling', async () => {
    const user = makeUser();
    renderPatientView();

    await searchWednesday(user);
    await bookFirstSlot(user);

    const upcoming = screen
      .getByText('My upcoming appointments')
      .closest('section')!;
    await user.click(within(upcoming).getByRole('button', { name: /^Cancel/ }));
    // "Keep appointment" dismisses the dialog and changes nothing.
    await user.click(screen.getByRole('button', { name: /keep appointment/i }));

    expect(within(upcoming).getByText(/Dr. Emily Carter/)).toBeInTheDocument();
    expect(useMedicalStore.getState().appointments).toHaveLength(1);
    expect(bookButtons()).toHaveLength(4);
  });

  it('lets the patient rebook a slot they just cancelled', async () => {
    const user = makeUser();
    renderPatientView();

    await searchWednesday(user);
    const bookedLabel = await bookFirstSlot(user);

    const upcoming = screen
      .getByText('My upcoming appointments')
      .closest('section')!;
    await user.click(within(upcoming).getByRole('button', { name: /^Cancel/ }));
    await user.click(
      screen.getByRole('button', { name: /cancel appointment/i })
    );

    // The same slot can be claimed again straight after being freed.
    const sameSlot = bookButtons().find(
      (b) => b.getAttribute('aria-label') === bookedLabel
    )!;
    await user.click(sameSlot);
    await user.click(screen.getByRole('button', { name: /confirm booking/i }));

    expect(useMedicalStore.getState().appointments).toHaveLength(1);
    expect(bookButtons()).toHaveLength(4);
  });
});
