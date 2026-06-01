import { useMemo } from 'react';
import {
  useDoctors,
  useAppointments,
} from '@/stores/medicalStore/medicalStore';
import {
  availableSlots,
  getWeekStart,
  isSlotInPast,
  nowHHmm,
  todayISO,
} from '@/utils';
import type { SlotFilters } from '@/utils';
import type { Slot } from '@/types';

/**
 * Derives the available slots for the selected filters for the patient view.
 *
 * @param anchorDate ISO date the patient picked; normalized to its clinic week.
 * @param filters    specialty / doctor / single-date constraints.
 */
export function useAvailableSlots(
  anchorDate: string,
  filters: SlotFilters
): Slot[] {
  const doctors = useDoctors();
  const appointments = useAppointments();
  const weekStart = getWeekStart(anchorDate);
  const today = todayISO();
  const now = nowHHmm();

  const { specialty, doctorId, date } = filters;

  return useMemo(() => {
    if (date && date < today) {
      return [];
    }
    const all = availableSlots(doctors, appointments, weekStart, {
      specialty,
      doctorId,
      date,
    });
    // Hide slots that have already started — past days or hours
    return all.filter(
      (slot) => !isSlotInPast(slot.date, slot.startTime, today, now)
    );
  }, [doctors, appointments, weekStart, specialty, doctorId, date, today, now]);
}
