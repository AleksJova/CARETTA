import Header from '@/components/shared/Header';

/**
 * WIP - Patient views (search/filter, book, cancel, upcoming)
 */
export default function PatientLayout() {
  return (
    <div className="min-h-svh bg-background">
      <Header title="Caretta · Patient" />
      <main className="mx-auto max-w-5xl px-6 py-8">
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
