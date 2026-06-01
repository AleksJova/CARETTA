import { dataService } from '@/services/dataService/localStorageService';
import {
  SEED_DOCTORS,
  SEED_PATIENTS,
  buildSeedAppointments,
  seedAppointmentDate,
} from './seedData';

// Populates the data store with demo data on first run only. It writes seeds
// solely when a collection is empty, so it never clobbers bookings or doctor
// edits a user has already made. Idempotent and safe to call on every boot.
//
// Seeding lives behind the same dataService interface as everything else, so
// swapping localStorage for a real backend leaves this untouched.
export function seedIfEmpty(): void {
  if (dataService.getDoctors().length === 0) {
    dataService.saveDoctors(SEED_DOCTORS);
  }
  if (dataService.getPatients().length === 0) {
    dataService.savePatients(SEED_PATIENTS);
  }
  if (dataService.getAppointments().length === 0) {
    dataService.saveAppointments(buildSeedAppointments());
  } else {
    reanchorSeedAppointments();
  }
}

// Demo appointments are seeded once, so their dates would drift into the past as
// days pass. Re-anchor the known demo appointments to the current week on each
// boot (date only — status and everything else are preserved). User-created
// bookings have unknown ids, so they're never touched.
function reanchorSeedAppointments(): void {
  const appointments = dataService.getAppointments();
  let changed = false;

  const next = appointments.map((a) => {
    const anchored = seedAppointmentDate(a.id);
    if (anchored && anchored !== a.date) {
      changed = true;
      return { ...a, date: anchored };
    }
    return a;
  });

  if (changed) dataService.saveAppointments(next);
}
