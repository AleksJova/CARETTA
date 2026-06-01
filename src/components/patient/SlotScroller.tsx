import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SlotCard } from './SlotCard';
import type { Doctor, Slot } from '@/types';

interface SlotScrollerProps {
  slots: Slot[];
  doctorsById: Map<string, Doctor>;
  onBook: (slot: Slot) => void;
}

export function SlotScroller({
  slots,
  doctorsById,
  onBook,
}: SlotScrollerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= maxScroll - 1);
  }, []);

  // Recompute edge state when the slot set changes (a new search) and on
  // resize, so the fades/arrows reflect the current overflow.
  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateEdges, slots]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // Page by ~90% of the viewport so a card stays visible as an anchor.
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Edge fades — only shown when there's content hidden that way. */}
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-surface-muted to-transparent transition-opacity',
          atStart && 'opacity-0'
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-surface-muted to-transparent transition-opacity',
          atEnd && 'opacity-0'
        )}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        disabled={atStart}
        aria-label="Scroll to earlier slots"
        className="absolute -left-3 top-1/2 z-20 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition-opacity hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-0 sm:flex"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        disabled={atEnd}
        aria-label="Scroll to later slots"
        className="absolute -right-3 top-1/2 z-20 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition-opacity hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-0 sm:flex"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>

      {/*
        Two-row grid that flows column-by-column (auto-cols fixed width), so the
        cards pack into two rows and the overflow scrolls horizontally. snap-start
        on each cell keeps paging aligned to a column.
      */}
      <div
        ref={trackRef}
        onScroll={updateEdges}
        className="grid snap-x snap-mandatory grid-flow-col grid-rows-2 gap-3 overflow-x-auto scroll-smooth pb-2 [grid-auto-columns:220px] [scrollbar-width:thin]"
      >
        {slots.map((slot) => {
          const doctor = doctorsById.get(slot.doctorId);
          if (!doctor) return null;
          return (
            <div
              key={`${slot.doctorId}-${slot.date}-${slot.startTime}`}
              className="snap-start"
            >
              <SlotCard slot={slot} doctor={doctor} onBook={onBook} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
