import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore/authStore';
import {
  usePatients,
  useMedicalStore,
} from '@/stores/medicalStore/medicalStore';
import TurtlePond from '@/components/shared/TurtlePondBg';
import Logo from '@/components/shared/Logo';

// Any-alphabet name (accents/ñ), no digits; email and phone are contact details.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} '-]*$/u;
const PHONE_PATTERN = /^[+()\d][\d\s()-]*$/;

const patientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .regex(NAME_PATTERN, 'Only letters, spaces, hyphens and apostrophes'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone is required')
    .regex(PHONE_PATTERN, 'Enter a valid phone number'),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function PatientSelect() {
  const patients = usePatients();
  const addPatient = useMedicalStore((s) => s.addPatient);
  const selectPatient = useAuthStore((s) => s.selectPatient);
  const logout = useAuthStore((s) => s.logout);

  // Default to the register form when there are no patients to pick from yet.
  const [registering, setRegistering] = useState(patients.length === 0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  const onSubmit = (values: PatientFormValues) => {
    const id = crypto.randomUUID();
    addPatient({ id, ...values });
    selectPatient(id); // enter the patient view as the new patient
  };

  return (
    <main className="h-svh w-full select-none">
      <TurtlePond turtleCount={5}>
        <div className="w-[340px] max-w-[90vw] rounded-2xl border border-white/70 bg-white/65 p-6 backdrop-blur-md sm:p-8">
          <div className="mb-5 flex flex-col items-center text-center">
            <Logo className="mb-3" />
            <h1 className="text-xl font-medium tracking-tight text-foreground">
              {registering ? 'Register patient' : 'Choose a patient'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {registering
                ? 'Enter the basic profile details'
                : 'Continue as an existing patient'}
            </p>
          </div>

          {registering ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <Field
                label="Full name"
                htmlFor="name"
                error={errors.name?.message}
              >
                <input
                  id="name"
                  className="form-input"
                  placeholder="Jane Doe"
                  {...register('name')}
                  aria-invalid={!!errors.name}
                />
              </Field>
              <Field
                label="Email"
                htmlFor="email"
                error={errors.email?.message}
              >
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="jane@example.com"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                />
              </Field>
              <Field
                label="Phone"
                htmlFor="phone"
                error={errors.phone?.message}
              >
                <input
                  id="phone"
                  className="form-input"
                  placeholder="+1 (555) 0100"
                  {...register('phone')}
                  aria-invalid={!!errors.phone}
                />
              </Field>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <UserPlus aria-hidden="true" />
                Register and continue
              </Button>

              {patients.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setRegistering(false)}
                >
                  <ArrowLeft aria-hidden="true" />
                  Back to patient list
                </Button>
              )}
            </form>
          ) : (
            <div className="space-y-2.5">
              <ul className="max-h-64 space-y-1.5 overflow-y-auto">
                {patients.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => selectPatient(p.id)}
                      className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-teal text-accent-teal-foreground">
                        <User className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {p.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {p.email}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setRegistering(true)}
              >
                <Plus aria-hidden="true" />
                Add new patient
              </Button>
            </div>
          )}

          <div className="my-4 flex items-center gap-2.5">
            <span className="h-px flex-1 bg-primary/20" />
            <span className="text-[11px] text-muted-foreground">
              mock authentication
            </span>
            <span className="h-px flex-1 bg-primary/20" />
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground"
          >
            Back to login page
          </button>
        </div>
      </TurtlePond>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 text-left">
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-cancelled">
          {error}
        </p>
      )}
    </div>
  );
}
