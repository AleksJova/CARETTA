import { nextOpenDay, todayISO } from '@/utils';
import type { SlotFilterValue } from './SlotFilters';

// Persist the patient's last search filters across refreshes.
// Clears when the tab closes and on login/logout.

const STORAGE_KEY = 'caretta:patient:slotSearch';

export function defaultSearchDate(): string {
  return nextOpenDay(todayISO());
}

export interface PersistedSearch {
  draft: SlotFilterValue;
  applied: SlotFilterValue | null;
}

export function loadSlotSearch(): PersistedSearch {
  const fallback: PersistedSearch = {
    draft: { date: defaultSearchDate() },
    applied: null,
  };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as PersistedSearch;
    // A persisted date that's now in the past (tab left open overnight) is
    // snapped forward to today; a Sunday is bumped to the next open day.
    const today = todayISO();
    const fix = (f: SlotFilterValue): SlotFilterValue => ({
      ...f,
      date: nextOpenDay(f.date < today ? today : f.date),
    });
    return {
      draft: parsed.draft ? fix(parsed.draft) : fallback.draft,
      applied: parsed.applied ? fix(parsed.applied) : null,
    };
  } catch {
    return fallback;
  }
}

export function saveSlotSearch(value: PersistedSearch): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage full / unavailable — persistence is best-effort, never fatal.
  }
}

export function clearSlotSearch(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best-effort; nothing to do if storage is unavailable.
  }
}
