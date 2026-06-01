import { memo } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminStatusBadge } from './AdminStatusBadge';
import { formatDate, formatTime12h } from '@/utils';
import type { AppointmentView } from '@/utils';
import type { Appointment } from '@/types';

export interface AppointmentRowData {
  appointment: Appointment;
  patientName: string;
  doctorName: string;
  specialty: string;
  view: AppointmentView;
}

interface AppointmentAdminRowProps extends AppointmentRowData {
  onComplete: (id: string) => void;
}

function AppointmentAdminRowBase({
  appointment,
  patientName,
  doctorName,
  specialty,
  view,
  onComplete,
}: AppointmentAdminRowProps) {
  // Only a finished-but-not-completed appointment can be marked Done.
  const canComplete = view === 'awaiting';

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3 py-2.5 font-medium text-foreground">{patientName}</td>
      <td className="px-3 py-2.5 text-foreground">{doctorName}</td>
      <td className="px-3 py-2.5 text-muted-foreground">{specialty}</td>
      <td className="px-3 py-2.5 text-foreground">
        {formatDate(appointment.date)} · {formatTime12h(appointment.startTime)}
      </td>
      <td className="px-3 py-2.5">
        <AdminStatusBadge view={view} />
      </td>
      <td className="px-3 py-2.5">
        {canComplete ? (
          <Button
            variant="outline"
            size="sm"
            className="border-completed/40 text-completed hover:bg-completed/10 hover:text-completed"
            onClick={() => onComplete(appointment.id)}
          >
            <Check aria-hidden="true" />
            Complete
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground" aria-hidden="true">
            —
          </span>
        )}
      </td>
    </tr>
  );
}

export const AppointmentAdminRow = memo(AppointmentAdminRowBase);
