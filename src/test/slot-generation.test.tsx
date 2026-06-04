import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, screen, within } from '@testing-library/react';
import {
  CARDIOLOGIST,
  DERMATOLOGIST,
  makeUser,
  renderPatientView,
  setupClinic,
  teardownClinic,
} from './flows/fixtures';
import type { Doctor } from '@/types';

// Reads every visible slot card's "Book ..." label so we can assert on the
// dates and times the patient actually sees.
function bookLabels(): string[] {
  return screen
    .getAllByRole('button', { name: /^Book/i })
    .map((b) => b.getAttribute('aria-label') ?? '');
}

// Opens the date popover and clicks the given day of the frozen clinic week.
async function pickDay(
  user: ReturnType<typeof makeUser>,
  dayName: string
): Promise<void> {
  await user.click(screen.getByLabelText('Date'));
  await user.click(screen.getByRole('button', { name: new RegExp(dayName) }));
}

beforeEach(() => setupClinic({ doctors: [CARDIOLOGIST] }));
afterEach(() => {
  cleanup();
  teardownClinic();
});

describe('Slot generation flow', () => {
  it('a morning doctor offers five one-hour slots on a working day', async () => {
    const user = makeUser();
    renderPatientView();

    // The patient picks Wednesday and presses search.
    await pickDay(user, 'Wednesday, June 3rd, 2026');
    await user.click(screen.getByRole('button', { name: /search/i }));

    // Morning shift is 08:00 to 13:00, so exactly five one-hour slots.
    const labels = bookLabels();
    expect(labels).toHaveLength(5);
    expect(labels[0]).toMatch(/8:00 – 9:00 AM/);
    expect(labels[4]).toMatch(/12:00 – 1:00 PM/);
  });

  it('an afternoon doctor offers six one-hour slots on a working day', async () => {
    setupClinic({ doctors: [DERMATOLOGIST] });
    const user = makeUser();
    renderPatientView();

    await pickDay(user, 'Wednesday, June 3rd, 2026');
    await user.click(screen.getByRole('button', { name: /search/i }));

    // Afternoon shift is 13:00 to 19:00, so exactly six one-hour slots.
    const labels = bookLabels();
    expect(labels).toHaveLength(6);
    expect(labels[0]).toMatch(/1:00 – 2:00 PM/);
    expect(labels[5]).toMatch(/6:00 – 7:00 PM/);
  });

  it('shows slots on each working day the patient picks', async () => {
    const user = makeUser();
    renderPatientView();

    // Monday is a working day, so the search returns its five slots.
    await pickDay(user, 'Monday, June 1st, 2026');
    await user.click(screen.getByRole('button', { name: /search/i }));
    expect(bookLabels()).toHaveLength(5);

    // Switching to Saturday still finds that day's five slots.
    await pickDay(user, 'Saturday, June 6th, 2026');
    await user.click(screen.getByRole('button', { name: /search/i }));
    expect(bookLabels()).toHaveLength(5);
  });

  it('never lets the patient pick a Sunday, since the clinic is closed', async () => {
    const user = makeUser();
    renderPatientView();

    // Sunday June 7th is rendered but disabled, so it cannot be searched.
    await user.click(screen.getByLabelText('Date'));
    const sunday = screen.getByRole('button', {
      name: /Sunday, June 7th, 2026/,
    });
    expect(sunday).toBeDisabled();
  });

  it('shows no slots on a day the doctor does not work', async () => {
    const partTime: Doctor = {
      ...CARDIOLOGIST,
      workingDays: ['Mon', 'Wed'],
    };
    setupClinic({ doctors: [partTime] });
    const user = makeUser();
    renderPatientView();

    // Tuesday is outside this doctor's working days, so nothing is available.
    await pickDay(user, 'Tuesday, June 2nd, 2026');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(screen.getByText('No available slots')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Book/i })
    ).not.toBeInTheDocument();
  });

  it('counts how many slots are available right above the results', async () => {
    const user = makeUser();
    renderPatientView();

    await pickDay(user, 'Wednesday, June 3rd, 2026');
    await user.click(screen.getByRole('button', { name: /search/i }));

    // The "Find a slot" heading shows a running count of what was found.
    const heading = screen.getByText('Find a slot').closest('div')!;
    expect(within(heading).getByText('5 available')).toBeInTheDocument();
  });
});
