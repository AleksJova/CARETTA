import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useMedicalStore } from '@/stores/medicalStore/medicalStore';
import { notify } from '@/components/shared/notify';
import { SPECIALTIES, WEEKDAYS } from '@/constants';
import type { Doctor, Shift, Weekday } from '@/types';

const SHIFTS: { value: Shift; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
];

// Letters of any alphabet (incl. accents/ñ) plus spaces, hyphens, apostrophes
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} '-]*$/u;
const NAME_ERROR = 'Only letters, spaces, hyphens and apostrophes are allowed';

const nameField = z
  .string()
  .trim()
  .min(1, 'Required')
  .regex(NAME_PATTERN, NAME_ERROR);

const doctorSchema = z.object({
  firstName: nameField,
  lastName: nameField,
  specialty: z.enum(SPECIALTIES, { message: 'Specialty is required' }),
  shift: z.enum(['morning', 'afternoon']),
  workingDays: z
    .array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']))
    .min(1, 'Select at least one working day'),
});

// specialty is widened with '' so the form can start unpicked; the resolver
// rejects '' on submit.
type DoctorFormValues = Omit<z.infer<typeof doctorSchema>, 'specialty'> & {
  specialty: z.infer<typeof doctorSchema>['specialty'] | '';
};

// "Dr. Maria Santos" -> { firstName: 'Maria', lastName: 'Santos' }.
function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name
    .replace(/^Dr\.?\s*/i, '')
    .trim()
    .split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

const EMPTY_DEFAULTS: DoctorFormValues = {
  firstName: '',
  lastName: '',
  specialty: '',
  shift: 'morning',
  workingDays: [],
};

function valuesFor(editDoctor: Doctor | null): DoctorFormValues {
  if (!editDoctor) return EMPTY_DEFAULTS;
  return {
    ...splitName(editDoctor.name),
    specialty: editDoctor.specialty as DoctorFormValues['specialty'],
    shift: editDoctor.shift,
    workingDays: editDoctor.workingDays,
  };
}

interface AddDoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editDoctor?: Doctor | null;
}

export function AddDoctorModal({
  open,
  onOpenChange,
  editDoctor = null,
}: AddDoctorModalProps) {
  const addDoctor = useMedicalStore((s) => s.addDoctor);
  const updateDoctor = useMedicalStore((s) => s.updateDoctor);
  const isEdit = editDoctor !== null;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema) as never,
    defaultValues: EMPTY_DEFAULTS,
  });

  const seedKey = open ? (editDoctor?.id ?? '__add__') : null;
  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (seededFor !== seedKey) {
    setSeededFor(seedKey);
    if (seedKey) reset(valuesFor(editDoctor));
  }

  const onSubmit = (values: DoctorFormValues) => {
    const name = `Dr. ${values.firstName} ${values.lastName}`.trim();

    if (isEdit && editDoctor) {
      // Only the first and last name is editable
      updateDoctor(editDoctor.id, { name });
      notify.success('Doctor updated', name);
    } else {
      addDoctor({
        id: crypto.randomUUID(),
        name,
        specialty: values.specialty,
        shift: values.shift,
        // Keep WEEKDAYS order regardless of click order.
        workingDays: WEEKDAYS.filter((d) => values.workingDays.includes(d)),
        daysOff: [],
      });
      notify.success('Doctor added', name);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="flex size-7 items-center justify-center rounded-lg bg-accent-teal text-accent-teal-foreground"
              aria-hidden="true"
            >
              {isEdit ? (
                <Pencil className="size-4" />
              ) : (
                <UserPlus className="size-4" />
              )}
            </span>
            {isEdit ? "Edit doctor's details" : 'Add doctor'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Edit the doctor's personal details, first and last name."
              : 'Add a doctor and set their shift and working days.'}
          </DialogDescription>
        </DialogHeader>

        <form
          id="doctor-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="First name"
              htmlFor="firstName"
              error={errors.firstName?.message}
            >
              <input
                id="firstName"
                className="form-input"
                {...register('firstName')}
                aria-invalid={!!errors.firstName}
              />
            </Field>
            <Field
              label="Last name"
              htmlFor="lastName"
              error={errors.lastName?.message}
            >
              <input
                id="lastName"
                className="form-input"
                {...register('lastName')}
                aria-invalid={!!errors.lastName}
              />
            </Field>
          </div>

          {/* Specialty, shift and working days are set once at creation. They're
              hidden when editing because changing them would orphan the doctor's
              existing appointments against the derived-slots model. */}
          {!isEdit && (
            <>
              <Controller
                control={control}
                name="specialty"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="specialty"
                      className="text-xs text-muted-foreground"
                    >
                      Specialty
                    </Label>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="specialty"
                        aria-invalid={!!errors.specialty}
                      >
                        <SelectValue placeholder="Select a specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.specialty && (
                      <p role="alert" className="text-xs text-cancelled">
                        {errors.specialty.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="shift"
                render={({ field }) => (
                  <fieldset>
                    <legend className="mb-1.5 text-xs text-muted-foreground">
                      Shift
                    </legend>
                    <div className="flex gap-2">
                      {SHIFTS.map(({ value, label }) => {
                        const selected = field.value === value;
                        return (
                          <label
                            key={value}
                            className={cn(
                              'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm',
                              selected
                                ? 'border-primary bg-accent-teal font-medium text-accent-teal-foreground'
                                : 'border-border text-foreground'
                            )}
                          >
                            <input
                              type="radio"
                              className="accent-primary"
                              value={value}
                              checked={selected}
                              onChange={() => field.onChange(value)}
                            />
                            {label}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                )}
              />

              <Controller
                control={control}
                name="workingDays"
                render={({ field }) => (
                  <fieldset>
                    <legend className="mb-1.5 text-xs text-muted-foreground">
                      Working days
                    </legend>
                    <div className="flex flex-wrap gap-1.5">
                      {WEEKDAYS.map((day) => {
                        const selected = field.value.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              field.onChange(
                                selected
                                  ? field.value.filter(
                                      (d: Weekday) => d !== day
                                    )
                                  : [...field.value, day]
                              )
                            }
                            className={cn(
                              'rounded-md border px-2.5 py-1 text-xs',
                              selected
                                ? 'border-primary bg-accent-teal font-medium text-accent-teal-foreground'
                                : 'border-border bg-surface-muted text-muted-foreground'
                            )}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    {errors.workingDays && (
                      <p role="alert" className="mt-1.5 text-xs text-cancelled">
                        {errors.workingDays.message}
                      </p>
                    )}
                  </fieldset>
                )}
              />
            </>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="doctor-form" disabled={isSubmitting}>
            {isEdit ? 'Save changes' : 'Save doctor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Labelled field wrapper with an inline error slot
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
    <div className="space-y-1.5">
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
