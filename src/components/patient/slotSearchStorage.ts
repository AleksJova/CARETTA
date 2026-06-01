import { nextOpenDay, todayISO } from '@/utils';
import { slotSearchService } from '@/services';
import type { SlotFilterValue } from './SlotFilters';

// Patient-feature shape and rules for the persisted slot search. The raw
// storage I/O lives behind slotSearchService so non-feature layers (authStore)
// can clear it without importing this module. Cleared when the tab closes and
// on login/logout.

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
    const raw = slotSearchService.read();
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
  slotSearchService.write(JSON.stringify(value));
}
