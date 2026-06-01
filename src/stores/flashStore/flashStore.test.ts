import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useFlashStore, FLASH_DURATION_MS } from './flashStore';

describe('flashStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useFlashStore.setState({ flashes: new Map() });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('records a key with a nonce when flashed', () => {
    useFlashStore.getState().flash('apt-1');
    expect(useFlashStore.getState().flashes.get('apt-1')).toBeTypeOf('number');
  });

  it('bumps the nonce on a repeat flash so the animation can replay', () => {
    useFlashStore.getState().flash('apt-1');
    const first = useFlashStore.getState().flashes.get('apt-1');
    useFlashStore.getState().flash('apt-1');
    const second = useFlashStore.getState().flashes.get('apt-1');
    expect(second).not.toBe(first);
  });

  it('clears the key after the flash duration', () => {
    useFlashStore.getState().flash('apt-1');
    expect(useFlashStore.getState().flashes.has('apt-1')).toBe(true);
    vi.advanceTimersByTime(FLASH_DURATION_MS);
    expect(useFlashStore.getState().flashes.has('apt-1')).toBe(false);
  });

  it("a re-flash's timeout is not cut short by the previous flash's timeout", () => {
    useFlashStore.getState().flash('apt-1');
    // Re-flash partway through the first duration: the older timeout must not
    // clear the key when it fires, since a newer flash now owns it.
    vi.advanceTimersByTime(FLASH_DURATION_MS - 1000);
    useFlashStore.getState().flash('apt-1');

    // First flash's timeout fires here; the key must survive.
    vi.advanceTimersByTime(1000);
    expect(useFlashStore.getState().flashes.has('apt-1')).toBe(true);

    // The full duration from the second flash must still elapse before clearing.
    vi.advanceTimersByTime(FLASH_DURATION_MS - 1000);
    expect(useFlashStore.getState().flashes.has('apt-1')).toBe(false);
  });

  it('tracks multiple flashed keys independently', () => {
    useFlashStore.getState().flash('slot-a');
    useFlashStore.getState().flash('apt-b');
    const { flashes } = useFlashStore.getState();
    expect(flashes.has('slot-a')).toBe(true);
    expect(flashes.has('apt-b')).toBe(true);
  });
});
