import { create } from 'zustand';
import { dataService } from '@/services';
import { validateBooking } from '@/utils';
import type { Appointment, AppointmentStatus } from '@/types';
import type { MedicalStore } from './medicalStoreContract';

// Used by cancel/complete actions — returns a new array with the target status update
function setAppointmentStatus(
  appointments: Appointment[],
  id: string,
  status: AppointmentStatus
): Appointment[] {
  return appointments.map((a) => (a.id === id ? { ...a, status } : a));
}

export const useMedicalStore = create<MedicalStore>()((set, get) => ({
  doctors: dataService.getDoctors(),
  patients: dataService.getPatients(),
  appointments: dataService.getAppointments(),

  // ----- Doctor actions ----------------------------------------------------

  addDoctor: (doctor) => {
    set((s) => {
      const next = [...s.doctors, doctor];
      dataService.saveDoctors(next);
      return { doctors: next };
    });
  },

  updateDoctor: (id, patch) => {
    set((s) => {
      const next = s.doctors.map((d) => (d.id === id ? { ...d, ...patch } : d));
      dataService.saveDoctors(next);
      return { doctors: next };
    });
  },

  setDoctorDayOff: (doctorId, isoDate) => {
    set((s) => {
      const next = s.doctors.map((d) => {
        if (d.id !== doctorId) return d;
        if (d.daysOff.includes(isoDate)) return d;
        return { ...d, daysOff: [...d.daysOff, isoDate] };
      });
      dataService.saveDoctors(next);
      return { doctors: next };
    });
  },

  removeDoctorDayOff: (doctorId, isoDate) => {
    set((s) => {
      const next = s.doctors.map((d) => {
        if (d.id !== doctorId) return d;
        return {
          ...d,
          daysOff: d.daysOff.filter((date) => date !== isoDate),
        };
      });
      dataService.saveDoctors(next);
      return { doctors: next };
    });
  },

  // ----- Patient actions ---------------------------------------------------

  addPatient: (patient) => {
    set((s) => {
      const next = [...s.patients, patient];
      dataService.savePatients(next);
      return { patients: next };
    });
  },

  // ----- Appointment actions -----------------------------------------------

  bookAppointment: (input) => {
    const { doctors, appointments } = get();

    const validation = validateBooking(input, doctors, appointments);
    if (!validation.ok) return validation;

    const appointment: Appointment = {
      id: crypto.randomUUID(),
      doctorId: input.doctorId,
      patientId: input.patientId,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      status: 'confirmed',
    };

    set((s) => {
      const next = [...s.appointments, appointment];
      dataService.saveAppointments(next);
      return { appointments: next };
    });

    return { ok: true, data: appointment };
  },

  cancelAppointment: (id) => {
    set((s) => {
      const next = setAppointmentStatus(s.appointments, id, 'cancelled');
      dataService.saveAppointments(next);
      return { appointments: next };
    });
  },

  completeAppointment: (id) => {
    set((s) => {
      const next = setAppointmentStatus(s.appointments, id, 'completed');
      dataService.saveAppointments(next);
      return { appointments: next };
    });
  },
}));

// Selector hooks — each subscribes to one piece of store state.

export const useDoctors = () => useMedicalStore((s) => s.doctors);
export const usePatients = () => useMedicalStore((s) => s.patients);
export const useAppointments = () => useMedicalStore((s) => s.appointments);
