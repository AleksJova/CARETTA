import { useMemo } from 'react';
import {
  useDoctors,
  useAppointments,
} from '@/stores/medicalStore/medicalStore';
import { availableSlots, getWeekStart } from '@/utils';
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
  const today = new Date().toISOString().slice(0, 10);

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
    return date ? all : all.filter((slot) => slot.date >= today);
  }, [doctors, appointments, weekStart, specialty, doctorId, date, today]);
}
