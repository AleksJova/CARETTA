import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import {
  CARDIOLOGIST,
  DERMATOLOGIST,
  makeUser,
  renderPatientView,
  setupClinic,
  teardownClinic,
} from './flows/fixtures';

function bookLabels(): string[] {
  return screen
    .getAllByRole('button', { name: /^Book/i })
    .map((b) => b.getAttribute('aria-label') ?? '');
}

// Chooses an option in one of the filter dropdowns by its visible label.
async function chooseInDropdown(
  user: ReturnType<typeof makeUser>,
  dropdownLabel: string,
  optionName: string
): Promise<void> {
  await user.click(screen.getByLabelText(dropdownLabel));
  await user.click(screen.getByRole('option', { name: optionName }));
}

async function pickWednesday(user: ReturnType<typeof makeUser>): Promise<void> {
  await user.click(screen.getByLabelText('Date'));
  await user.click(
    screen.getByRole('button', { name: /Wednesday, June 3rd, 2026/ })
  );
}

// Two doctors of different specialties, both working the whole week.
beforeEach(() => setupClinic({ doctors: [CARDIOLOGIST, DERMATOLOGIST] }));
afterEach(() => {
  cleanup();
  teardownClinic();
});

describe('Filtering flow', () => {
  it('searching one specialty returns only that specialty', async () => {
    const user = makeUser();
    renderPatientView();

    // The patient filters to Dermatology for a single day.
    await pickWednesday(user);
    await chooseInDropdown(user, 'Specialty', 'Dermatology');
    await user.click(screen.getByRole('button', { name: /search/i }));

    // Only the dermatologist's six afternoon slots come back.
    const labels = bookLabels();
    expect(labels).toHaveLength(6);
    expect(labels.every((l) => l.includes('Dr. Liam Brooks'))).toBe(true);
  });

  it('searching one doctor returns only that doctor', async () => {
    const user = makeUser();
    renderPatientView();

    await pickWednesday(user);
    await chooseInDropdown(user, 'Doctor', 'Dr. Emily Carter');
    await user.click(screen.getByRole('button', { name: /search/i }));

    // Only Dr. Carter's five morning slots are listed.
    const labels = bookLabels();
    expect(labels).toHaveLength(5);
    expect(labels.every((l) => l.includes('Dr. Emily Carter'))).toBe(true);
  });

  it('searching one date returns only that days slots', async () => {
    const user = makeUser();
    renderPatientView();

    // With both doctors and one day chosen, the results are all on that day.
    await pickWednesday(user);
    await user.click(screen.getByRole('button', { name: /search/i }));

    const labels = bookLabels();
    // Five morning plus six afternoon slots, all dated the same Wednesday.
    expect(labels).toHaveLength(11);
    expect(labels.every((l) => l.includes('Wed 3 Jun'))).toBe(true);
  });

  it('shows an empty state when no slot matches the filter', async () => {
    // A neurologist exists but only works Mondays.
    setupClinic({
      doctors: [
        {
          ...CARDIOLOGIST,
          id: 'doc-neuro',
          name: 'Dr. Mara Singh',
          specialty: 'Neurology',
          workingDays: ['Mon'],
        },
      ],
    });
    const user = makeUser();
    renderPatientView();

    // Searching Neurology on a Wednesday matches nothing.
    await pickWednesday(user);
    await chooseInDropdown(user, 'Specialty', 'Neurology');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(screen.getByText('No available slots')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Book/i })
    ).not.toBeInTheDocument();
  });

  it('narrowing the specialty clears a doctor who no longer fits', async () => {
    const user = makeUser();
    renderPatientView();

    // The patient picks a cardiologist, then switches specialty to Dermatology.
    await pickWednesday(user);
    await chooseInDropdown(user, 'Doctor', 'Dr. Emily Carter');
    await chooseInDropdown(user, 'Specialty', 'Dermatology');
    await user.click(screen.getByRole('button', { name: /search/i }));

    // The stale doctor filter is dropped, so results follow the new specialty.
    const labels = bookLabels();
    expect(labels.every((l) => l.includes('Dr. Liam Brooks'))).toBe(true);
  });
});
