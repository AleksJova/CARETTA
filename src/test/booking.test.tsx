import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, screen, within } from '@testing-library/react';
import {
  CARDIOLOGIST,
  makeUser,
  renderPatientView,
  setupClinic,
  teardownClinic,
} from './helpers';
import { useMedicalStore } from '@/stores/medicalStore/medicalStore';

// Picks Wednesday and runs the search so the day's slot cards are on screen.
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

beforeEach(() => setupClinic({ doctors: [CARDIOLOGIST] }));
afterEach(() => {
  cleanup();
  teardownClinic();
});

describe('Booking flow', () => {
  it('books a slot, and that slot leaves the available list', async () => {
    const user = makeUser();
    renderPatientView();

    await searchWednesday(user);
    // Five morning slots before booking anything.
    expect(bookButtons()).toHaveLength(5);
    const firstLabel = bookButtons()[0].getAttribute('aria-label');

    // The patient opens the first slot and confirms the booking dialog.
    await user.click(bookButtons()[0]);
    await user.click(screen.getByRole('button', { name: /confirm booking/i }));

    // That slot is gone, leaving four, and the booked time no longer appears.
    const remaining = bookButtons();
    expect(remaining).toHaveLength(4);
    expect(remaining.map((b) => b.getAttribute('aria-label'))).not.toContain(
      firstLabel
    );
  });

  it('shows the booked appointment in the upcoming list', async () => {
    const user = makeUser();
    renderPatientView();

    await searchWednesday(user);
    await user.click(bookButtons()[0]);
    await user.click(screen.getByRole('button', { name: /confirm booking/i }));

    // The new appointment appears under "My upcoming appointments".
    const upcoming = screen
      .getByText('My upcoming appointments')
      .closest('section')!;
    expect(within(upcoming).getByText(/Dr. Emily Carter/)).toBeInTheDocument();
    expect(within(upcoming).getByText('Confirmed')).toBeInTheDocument();
  });

  it('lets the patient back out without booking', async () => {
    const user = makeUser();
    renderPatientView();

    await searchWednesday(user);
    await user.click(bookButtons()[0]);
    // Closing the dialog with Cancel leaves every slot available.
    await user.click(screen.getByRole('button', { name: /^Cancel$/ }));

    expect(bookButtons()).toHaveLength(5);
    expect(useMedicalStore.getState().appointments).toHaveLength(0);
  });

  it('frees the slot for someone else only after it is given up', async () => {
    const user = makeUser();
    renderPatientView();

    await searchWednesday(user);
    // Once this patient takes the 08:00 slot, no one can pick it in the
    // same session because it is no longer in the available list.
    const eight = bookButtons().find((b) =>
      b.getAttribute('aria-label')?.includes('8:00')
    )!;
    await user.click(eight);
    await user.click(screen.getByRole('button', { name: /confirm booking/i }));

    const stillBookable = bookButtons().some((b) =>
      b.getAttribute('aria-label')?.includes('8:00')
    );
    expect(stillBookable).toBe(false);
  });

  it('keeps each booking distinct when the patient books two slots', async () => {
    const user = makeUser();
    renderPatientView();

    await searchWednesday(user);
    // Book the first slot, then the first of the remaining slots.
    await user.click(bookButtons()[0]);
    await user.click(screen.getByRole('button', { name: /confirm booking/i }));
    await user.click(bookButtons()[0]);
    await user.click(screen.getByRole('button', { name: /confirm booking/i }));

    // Two confirmed appointments, and three slots left for that day.
    expect(useMedicalStore.getState().appointments).toHaveLength(2);
    expect(bookButtons()).toHaveLength(3);
  });
});
