import Header from '@/components/shared/Header';

/**
 * WIP - Patient views (search/filter, book, cancel, upcoming)
 */
export default function PatientLayout() {
  return (
    <div className="min-h-svh bg-surface-muted">
      <Header roleLabel="Patient" />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <h2 className="text-lg font-medium text-foreground">
          Book an appointment
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Patient views land here next.
        </p>
      </main>
    </div>
  );
}
