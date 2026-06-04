import { useMemo } from 'react';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DatePicker } from './DatePicker';
import { nextOpenDay } from '@/utils';
import type { Doctor } from '@/types';

// Sentinel for "no constraint" — Radix Select can't hold an empty-string value,
// so the "Any …" option uses this and we map it back to undefined on change.
const ANY = '__any__';

export interface SlotFilterValue {
  specialty?: string;
  doctorId?: string;
  date: string; // always set — defaults to today
}

interface SlotFiltersProps {
  doctors: Doctor[];
  value: SlotFilterValue;
  minDate: string; // earliest selectable date — patients can't browse the past
  onChange: (next: SlotFilterValue) => void;
  onSearch: () => void;
}

export function SlotFilters({
  doctors,
  value,
  minDate,
  onChange,
  onSearch,
}: SlotFiltersProps) {
  const specialties = useMemo(
    () => [...new Set(doctors.map((d) => d.specialty))].sort(),
    [doctors]
  );

  const doctorsForSpecialty = useMemo(
    () =>
      doctors
        .filter((d) => !value.specialty || d.specialty === value.specialty)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [doctors, value.specialty]
  );

  const handleSpecialty = (next: string) => {
    const specialty = next === ANY ? undefined : next;
    // Clear a doctor that no longer belongs to the chosen specialty.
    const doctorStillValid =
      value.doctorId &&
      doctors.some(
        (d) =>
          d.id === value.doctorId && (!specialty || d.specialty === specialty)
      );
    onChange({
      ...value,
      specialty,
      doctorId: doctorStillValid ? value.doctorId : undefined,
    });
  };

  const handleDoctor = (next: string) => {
    onChange({ ...value, doctorId: next === ANY ? undefined : next });
  };

  const handleDate = (next: string) => {
    const clamped = next < minDate ? minDate : next;
    onChange({ ...value, date: nextOpenDay(clamped) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 grid grid-cols-1 items-end gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]"
    >
      <div className="space-y-1.5">
        <Label
          htmlFor="filter-specialty"
          className="text-xs text-muted-foreground"
        >
          Specialty
        </Label>
        <Select value={value.specialty ?? ANY} onValueChange={handleSpecialty}>
          <SelectTrigger id="filter-specialty" className="h-9">
            <SelectValue placeholder="Any specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any specialty</SelectItem>
            {specialties.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="filter-doctor"
          className="text-xs text-muted-foreground"
        >
          Doctor
        </Label>
        <Select value={value.doctorId ?? ANY} onValueChange={handleDoctor}>
          <SelectTrigger id="filter-doctor" className="h-9">
            <SelectValue placeholder="Any doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any doctor</SelectItem>
            {doctorsForSpecialty.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-date" className="text-xs text-muted-foreground">
          Date
        </Label>
        <DatePicker
          id="filter-date"
          value={value.date}
          minISO={minDate}
          onChange={handleDate}
        />
      </div>

      <Button type="submit" className="h-9">
        <Search />
        Search
      </Button>
    </form>
  );
}
