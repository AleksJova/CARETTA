import { memo } from 'react';
import { CalendarOff, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShiftBadge } from '@/components/shared/ShiftBadge';
import { formatWorkingDays } from '@/utils';
import type { Doctor } from '@/types';

interface DoctorRowProps {
  doctor: Doctor;
  onDayOff: (doctor: Doctor) => void;
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

function DoctorRowBase({ doctor, onDayOff, onEdit, onDelete }: DoctorRowProps) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-medium text-foreground">{doctor.name}</td>
      <td className="px-4 py-3 text-foreground">{doctor.specialty}</td>
      <td className="px-4 py-3">
        <ShiftBadge shift={doctor.shift} />
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {formatWorkingDays(doctor.workingDays)}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onDayOff(doctor)}
            aria-label={`Mark a day off for ${doctor.name}`}
            title="Mark day off"
          >
            <CalendarOff className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onEdit(doctor)}
            aria-label={`Edit ${doctor.name}`}
            title="Edit"
          >
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 border-cancelled/40 text-cancelled hover:bg-cancelled/10 hover:text-cancelled"
            onClick={() => onDelete(doctor)}
            aria-label={`Delete ${doctor.name}`}
            title="Delete"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export const DoctorRow = memo(DoctorRowBase);
