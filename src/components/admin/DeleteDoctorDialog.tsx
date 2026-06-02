import { AlertTriangle, Ban } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  useAppointments,
  useMedicalStore,
} from '@/stores/medicalStore/medicalStore';
import { notify } from '@/components/shared/notify';
import type { Doctor } from '@/types';

interface DeleteDoctorDialogProps {
  doctor: Doctor | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteDoctorDialog({
  doctor,
  onOpenChange,
  onDeleted,
}: DeleteDoctorDialogProps) {
  const removeDoctor = useMedicalStore((s) => s.removeDoctor);
  const appointments = useAppointments();
  const open = doctor !== null;

  const activeCount = doctor
    ? appointments.filter((a) => a.doctorId === doctor.id).length
    : 0;
  const blocked = activeCount > 0;

  const handleConfirm = () => {
    if (!doctor) return;
    const result = removeDoctor(doctor.id);
    if (!result.ok) {
      notify.error("Can't delete doctor", result.reason);
      return;
    }
    notify.success('Doctor deleted', doctor.name);
    onDeleted();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {blocked ? (
          // Has active appointments — deletion isn't allowed.
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-pending">
                <Ban className="size-5" aria-hidden="true" />
                Can&apos;t delete doctor
              </DialogTitle>
              <DialogDescription>
                {doctor?.name} has {activeCount} active appointment
                {activeCount === 1 ? '' : 's'}. Cancel or reassign them to
                another doctor first, then delete.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Got it</Button>
            </DialogFooter>
          </>
        ) : (
          // No active appointments — safe to delete.
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-cancelled">
                <AlertTriangle className="size-5" aria-hidden="true" />
                Delete doctor
              </DialogTitle>
              <DialogDescription>
                This removes {doctor?.name} from the clinic. This can&apos;t be
                undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleConfirm}
                className="border-cancelled/40 text-cancelled hover:bg-cancelled/10 hover:text-cancelled"
              >
                Delete doctor
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
