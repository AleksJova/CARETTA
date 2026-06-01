import { useCallback, useMemo, useState } from 'react';
import { CalendarX, Search } from 'lucide-react';
import { useDoctors } from '@/stores/medicalStore/medicalStore';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { SlotCard } from './SlotCard';
import { SlotScroller } from './SlotScroller';
import { SlotFilters, type SlotFilterValue } from './SlotFilters';
import { BookingDialog } from './BookingDialog';
import {
  defaultSearchDate,
  loadSlotSearch,
  saveSlotSearch,
  type PersistedSearch,
} from './slotSearchStorage';
import { todayISO } from '@/utils';
import type { Doctor, Slot } from '@/types';

const GRID_LIMIT = 6;

/**
 * Patient "Find a slot" view: filter bar, search, available-slot cards, and the
 * booking dialog.
 *
 * Two filter snapshots are tracked locally:
 *  - `draft`   — what the user is editing in the bar.
 *  - `applied` — the last *searched* filters; this is what derives slots.
 */
export function AvailableSlots() {
  const doctors = useDoctors();
  const [activeSlot, setActiveSlot] = useState<Slot | null>(null);

  const [{ draft, applied }, setSearch] =
    useState<PersistedSearch>(loadSlotSearch);

  const persist = useCallback((next: PersistedSearch) => {
    setSearch(next);
    saveSlotSearch(next);
  }, []);

  const setDraft = useCallback(
    (next: SlotFilterValue) => persist({ draft: next, applied }),
    [persist, applied]
  );

  const runSearch = useCallback(
    () => persist({ draft, applied: draft }),
    [persist, draft]
  );

  // Derivation runs off the *applied* search
  const slots = useAvailableSlots(applied?.date ?? defaultSearchDate(), {
    specialty: applied?.specialty,
    doctorId: applied?.doctorId,
    date: applied?.date,
  });

  const doctorsById = useMemo(() => {
    const map = new Map<string, Doctor>();
    for (const d of doctors) map.set(d.id, d);
    return map;
  }, [doctors]);

  const handleBook = useCallback((slot: Slot) => setActiveSlot(slot), []);

  const activeDoctor = activeSlot
    ? (doctorsById.get(activeSlot.doctorId) ?? null)
    : null;

  const hasSearched = applied !== null;

  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-lg font-medium text-foreground">Find a slot</h2>
        {hasSearched && (
          <span className="text-sm text-muted-foreground">
            {slots.length} available
          </span>
        )}
      </div>

      <SlotFilters
        doctors={doctors}
        value={draft}
        minDate={todayISO()}
        onChange={setDraft}
        onSearch={runSearch}
      />

      {!hasSearched ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white px-6 py-12 text-center">
          <Search className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-foreground">
            Search for available slots
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a specialty, doctor, or date, then press search.
          </p>
        </div>
      ) : slots.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white px-6 py-12 text-center">
          <CalendarX
            className="size-6 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-medium text-foreground">
            No available slots
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different specialty, doctor, or date.
          </p>
        </div>
      ) : slots.length > GRID_LIMIT ? (
        <SlotScroller
          slots={slots}
          doctorsById={doctorsById}
          onBook={handleBook}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => {
            const doctor = doctorsById.get(slot.doctorId);
            if (!doctor) return null;
            return (
              <SlotCard
                key={`${slot.doctorId}-${slot.date}-${slot.startTime}`}
                slot={slot}
                doctor={doctor}
                onBook={handleBook}
              />
            );
          })}
        </div>
      )}

      <BookingDialog
        slot={activeSlot}
        doctor={activeDoctor}
        onOpenChange={(open) => {
          if (!open) setActiveSlot(null);
        }}
        onBooked={() => setActiveSlot(null)}
      />
    </section>
  );
}
