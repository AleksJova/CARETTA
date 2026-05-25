import carettaLogo from './assets/carettaLogo.svg';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background text-foreground">
      <section className="flex flex-col items-center gap-6 px-5 py-8">
        <img src={carettaLogo} width={200} alt="Caretta Logo" />

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-medium text-foreground">Get started</h2>
          <p className="text-muted-foreground">
            Appointment care, with a soft shell
          </p>
        </div>

        <Button>Caretta primary</Button>
      </section>
    </main>
  );
}

export default App;
