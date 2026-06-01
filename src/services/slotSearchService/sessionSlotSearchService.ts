import type { SlotSearchService } from './slotSearchServiceContract';

// sessionStorage so the search clears when the tab closes; also cleared on
// login/logout via authStore.
const STORAGE_KEY = 'caretta:patient:slotSearch';

export const slotSearchService: SlotSearchService = {
  read: () => {
    try {
      return sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },
  write: (raw) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, raw);
    } catch {
      // Storage full / unavailable — persistence is best-effort, never fatal.
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Best-effort; nothing to do if storage is unavailable.
    }
  },
};
