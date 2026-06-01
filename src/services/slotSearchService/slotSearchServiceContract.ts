// Neutral persistence boundary for the patient's slot-search filters.
// The service deals only in serialized storage I/O; the patient feature owns
// the shape of what's stored (see components/patient/slotSearchStorage.ts).
// Kept here so non-feature layers (e.g. authStore on logout) can clear it
// without importing patient-feature code.
export interface SlotSearchService {
  // Returns the raw persisted JSON string, or null if absent/unavailable.
  read(): string | null;
  // Persists the raw JSON string. Best-effort; never throws.
  write(raw: string): void;
  // Removes any persisted search. Best-effort; never throws.
  clear(): void;
}
