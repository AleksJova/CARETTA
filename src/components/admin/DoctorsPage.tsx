import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDoctors } from '@/stores/medicalStore/medicalStore';
import { todayISO, weekDaysOff } from '@/utils';
import { DoctorRow } from './DoctorRow';
import { AddDoctorModal } from './AddDoctorModal';
import { DayOffModal } from './DayOffModal';
import { DeleteDoctorDialog } from './DeleteDoctorDialog';
import type { Doctor } from '@/types';

export default function DoctorsPage() {
  const doctors = useDoctors();
  const [addOpen, setAddOpen] = useState(false);
  const [dayOffDoctor, setDayOffDoctor] = useState<Doctor | null>(null);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [deleteDoctor, setDeleteDoctor] = useState<Doctor | null>(null);

  const daysOffThisWeek = useMemo(
    () => weekDaysOff(doctors, todayISO()),
    [doctors]
  );

  const handleDayOff = useCallback(
    (doctor: Doctor) => setDayOffDoctor(doctor),
    []
  );
  const handleEdit = useCallback((doctor: Doctor) => setEditDoctor(doctor), []);
  const handleDelete = useCallback(
    (doctor: Doctor) => setDeleteDoctor(doctor),
    []
  );

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-foreground">Doctors</h1>
        <Button onClick={() => setAddOpen(true)}>
          <Plus aria-hidden="true" />
          Add doctor
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white p-4">
          <p className="text-xs text-muted-foreground">Total doctors</p>
          <p className="mt-1 text-2xl font-medium text-foreground">
            {doctors.length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4">
          <p className="text-xs text-muted-foreground">
            Total days off this week
          </p>
          <p className="mt-1 text-2xl font-medium text-foreground">
            {daysOffThisWeek}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white">
        {doctors.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">
              No doctors yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a doctor to start building the clinic schedule.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-left text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Doctor</th>
                  <th className="px-4 py-2.5 font-medium">Specialty</th>
                  <th className="px-4 py-2.5 font-medium">Shift</th>
                  <th className="px-4 py-2.5 font-medium">Working days</th>
                  <th className="px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <DoctorRow
                    key={doctor.id}
                    doctor={doctor}
                    onDayOff={handleDayOff}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddDoctorModal open={addOpen} onOpenChange={setAddOpen} />
      <AddDoctorModal
        editDoctor={editDoctor}
        open={editDoctor !== null}
        onOpenChange={(open) => {
          if (!open) setEditDoctor(null);
        }}
      />
      <DayOffModal
        doctor={dayOffDoctor}
        onOpenChange={(open) => {
          if (!open) setDayOffDoctor(null);
        }}
      />
      <DeleteDoctorDialog
        doctor={deleteDoctor}
        onOpenChange={(open) => {
          if (!open) setDeleteDoctor(null);
        }}
        onDeleted={() => setDeleteDoctor(null)}
      />
    </section>
  );
}
