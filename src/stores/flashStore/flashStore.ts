import { create } from 'zustand';

export function slotKey(
  doctorId: string,
  date: string,
  startTime: string
): string {
  return `${doctorId}|${date}|${startTime}`;
}

export const FLASH_DURATION_MS = 3000;

interface FlashStore {
  // Map of flashing key -> nonce. Nonce increments on each flash so the element remounts and CSS animation replays.
  flashes: ReadonlyMap<string, number>;
  flash: (key: string) => void;
}

let nonce = 0;

export const useFlashStore = create<FlashStore>()((set, get) => ({
  flashes: new Map<string, number>(),
  flash: (key) => {
    const currentNonce = ++nonce;
    const next = new Map(get().flashes);
    next.set(key, currentNonce);
    set({ flashes: next });

    setTimeout(() => {
      // Only clear if this is still the active flash for this key
      if (get().flashes.get(key) !== currentNonce) return;
      const map = new Map(get().flashes);
      map.delete(key);
      set({ flashes: map });
    }, FLASH_DURATION_MS);
  },
}));

export const useFlashNonce = (key: string): number | undefined =>
  useFlashStore((s) => s.flashes.get(key));
