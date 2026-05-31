import Header from '@/components/shared/Header';

/**
 * WIP - Admin views (doctors, day-off action, all appointments, mark completed)
 */
export default function AdminLayout() {
  return (
    <div className="min-h-svh bg-surface-muted">
      <Header roleLabel="Admin" />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <h2 className="text-lg font-medium text-foreground">
          Clinic management
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin views land here next.
        </p>
      </main>
    </div>
  );
}
