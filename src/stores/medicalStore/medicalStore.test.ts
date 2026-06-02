import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useMedicalStore, useDoctors, useAppointments } from './medicalStore';
import type { Doctor, Patient } from '@/types';

const DOCTOR: Doctor = {
  id: 'doc-1',
  name: 'Dr. Ada Lovelace',
  specialty: 'Cardiology',
  shift: 'morning',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  daysOff: [],
};

const PATIENT: Patient = {
  id: 'pat-1',
  name: 'Charlie Fakename',
  email: 'charlie@example.com',
  phone: '+1-555-0100',
};

const BASE_INPUT = {
  doctorId: DOCTOR.id,
  patientId: PATIENT.id,
  date: '2026-06-02',
  startTime: '09:00',
  endTime: '10:00',
};

beforeEach(() => {
  useMedicalStore.setState({ doctors: [], patients: [], appointments: [] });
});

describe('Store shape — exposes expected state slices and action methods', () => {
  it('exposes doctors, patients, appointments arrays', () => {
    const s = useMedicalStore.getState();
    expect(Array.isArray(s.doctors)).toBe(true);
    expect(Array.isArray(s.patients)).toBe(true);
    expect(Array.isArray(s.appointments)).toBe(true);
  });

  it('exposes all required action methods', () => {
    const s = useMedicalStore.getState();
    expect(typeof s.addDoctor).toBe('function');
    expect(typeof s.updateDoctor).toBe('function');
    expect(typeof s.removeDoctor).toBe('function');
    expect(typeof s.setDoctorDayOff).toBe('function');
    expect(typeof s.removeDoctorDayOff).toBe('function');
    expect(typeof s.addPatient).toBe('function');
    expect(typeof s.bookAppointment).toBe('function');
    expect(typeof s.cancelAppointment).toBe('function');
    expect(typeof s.completeAppointment).toBe('function');
  });
});

describe('Selector isolation — unrelated slices do not trigger re-renders', () => {
  it('a doctors subscriber does not re-render when appointments change', () => {
    useMedicalStore.setState({ doctors: [DOCTOR], patients: [PATIENT] });

    let doctorRenders = 0;
    let appointmentRenders = 0;

    const doctorsHook = renderHook(() => {
      doctorRenders++;
      return useDoctors();
    });
    const appointmentsHook = renderHook(() => {
      appointmentRenders++;
      return useAppointments();
    });

    const beforeDoctors = doctorRenders;
    const beforeAppointments = appointmentRenders;

    act(() => {
      useMedicalStore.getState().bookAppointment(BASE_INPUT);
    });

    expect(appointmentRenders).toBeGreaterThan(beforeAppointments);
    expect(doctorRenders).toBe(beforeDoctors);

    doctorsHook.unmount();
    appointmentsHook.unmount();
  });
});

describe('Action stability — action references remain stable across state updates', () => {
  it('action references are identical across state updates', () => {
    const { result, rerender } = renderHook(() =>
      useMedicalStore((s) => s.bookAppointment)
    );

    const ref1 = result.current;

    act(() => {
      useMedicalStore.getState().addDoctor(DOCTOR);
    });

    rerender();
    const ref2 = result.current;

    expect(ref1).toBe(ref2);
  });
});

describe('Immutable state updates — mutations produce new object references', () => {
  it('addDoctor returns a new doctors array reference', () => {
    const before = useMedicalStore.getState().doctors;
    act(() => {
      useMedicalStore.getState().addDoctor(DOCTOR);
    });
    const after = useMedicalStore.getState().doctors;
    expect(after).not.toBe(before);
    expect(after).toHaveLength(1);
  });

  it('setDoctorDayOff returns a new doctor object reference', () => {
    useMedicalStore.setState({ doctors: [DOCTOR] });
    const beforeDoctor = useMedicalStore.getState().doctors[0];
    act(() => {
      useMedicalStore.getState().setDoctorDayOff(DOCTOR.id, '2026-06-10');
    });
    const afterDoctor = useMedicalStore.getState().doctors[0];
    expect(afterDoctor).not.toBe(beforeDoctor);
    expect(afterDoctor.daysOff).toContain('2026-06-10');
  });

  it('cancelAppointment returns a new appointments array reference', () => {
    useMedicalStore.setState({ doctors: [DOCTOR], patients: [PATIENT] });
    act(() => {
      useMedicalStore.getState().bookAppointment(BASE_INPUT);
    });
    const before = useMedicalStore.getState().appointments;
    const id = before[0].id;
    act(() => {
      useMedicalStore.getState().cancelAppointment(id);
    });
    const after = useMedicalStore.getState().appointments;
    expect(after).not.toBe(before);
    // Cancelling deletes the appointment, freeing its slot.
    expect(after).toHaveLength(0);
  });
});

describe('Doctor actions — adding, updating, and managing days off', () => {
  it('addDoctor persists the doctor', () => {
    act(() => useMedicalStore.getState().addDoctor(DOCTOR));
    expect(useMedicalStore.getState().doctors).toHaveLength(1);
    expect(useMedicalStore.getState().doctors[0].id).toBe(DOCTOR.id);
  });

  it('updateDoctor patches only changed fields', () => {
    useMedicalStore.setState({ doctors: [DOCTOR] });
    act(() =>
      useMedicalStore
        .getState()
        .updateDoctor(DOCTOR.id, { specialty: 'Neurology' })
    );
    const d = useMedicalStore.getState().doctors[0];
    expect(d.specialty).toBe('Neurology');
    expect(d.name).toBe(DOCTOR.name);
  });

  it('setDoctorDayOff is idempotent', () => {
    useMedicalStore.setState({ doctors: [DOCTOR] });
    act(() =>
      useMedicalStore.getState().setDoctorDayOff(DOCTOR.id, '2026-06-10')
    );
    act(() =>
      useMedicalStore.getState().setDoctorDayOff(DOCTOR.id, '2026-06-10')
    );
    expect(useMedicalStore.getState().doctors[0].daysOff).toHaveLength(1);
  });

  it('removeDoctorDayOff removes the date', () => {
    useMedicalStore.setState({
      doctors: [{ ...DOCTOR, daysOff: ['2026-06-10'] }],
    });
    act(() =>
      useMedicalStore.getState().removeDoctorDayOff(DOCTOR.id, '2026-06-10')
    );
    expect(useMedicalStore.getState().doctors[0].daysOff).toHaveLength(0);
  });

  it('setDoctorDayOff succeeds when no appointment falls on the date', () => {
    useMedicalStore.setState({ doctors: [DOCTOR] });
    let ok = false;
    act(() => {
      ok = useMedicalStore
        .getState()
        .setDoctorDayOff(DOCTOR.id, '2026-06-10').ok;
    });
    expect(ok).toBe(true);
    expect(useMedicalStore.getState().doctors[0].daysOff).toContain(
      '2026-06-10'
    );
  });

  it('setDoctorDayOff refuses a day the doctor does not work', () => {
    // DOCTOR works Mon–Fri; 2026-06-06 is a Saturday.
    useMedicalStore.setState({ doctors: [DOCTOR] });
    let ok = true;
    act(() => {
      ok = useMedicalStore
        .getState()
        .setDoctorDayOff(DOCTOR.id, '2026-06-06').ok;
    });
    expect(ok).toBe(false);
    expect(useMedicalStore.getState().doctors[0].daysOff).toHaveLength(0);
  });

  it('setDoctorDayOff refuses a date with a non-cancelled appointment', () => {
    useMedicalStore.setState({ doctors: [DOCTOR], patients: [PATIENT] });
    act(() => {
      useMedicalStore.getState().bookAppointment(BASE_INPUT);
    });
    let ok = true;
    act(() => {
      ok = useMedicalStore
        .getState()
        .setDoctorDayOff(DOCTOR.id, BASE_INPUT.date).ok;
    });
    expect(ok).toBe(false);
    expect(useMedicalStore.getState().doctors[0].daysOff).toHaveLength(0);
  });

  it('setDoctorDayOff allows a date once its appointment is cancelled (deleted)', () => {
    useMedicalStore.setState({ doctors: [DOCTOR], patients: [PATIENT] });
    act(() => {
      useMedicalStore.getState().bookAppointment(BASE_INPUT);
    });
    const id = useMedicalStore.getState().appointments[0].id;
    act(() => useMedicalStore.getState().cancelAppointment(id));
    let ok = false;
    act(() => {
      ok = useMedicalStore
        .getState()
        .setDoctorDayOff(DOCTOR.id, BASE_INPUT.date).ok;
    });
    expect(ok).toBe(true);
  });

  it('removeDoctor deletes a doctor with no appointments', () => {
    useMedicalStore.setState({ doctors: [DOCTOR], appointments: [] });
    let ok = false;
    act(() => {
      ok = useMedicalStore.getState().removeDoctor(DOCTOR.id).ok;
    });
    expect(ok).toBe(true);
    expect(useMedicalStore.getState().doctors).toHaveLength(0);
  });

  it('removeDoctor refuses when the doctor has a confirmed appointment', () => {
    useMedicalStore.setState({ doctors: [DOCTOR], patients: [PATIENT] });
    act(() => {
      useMedicalStore.getState().bookAppointment(BASE_INPUT);
    });
    let ok = true;
    act(() => {
      ok = useMedicalStore.getState().removeDoctor(DOCTOR.id).ok;
    });
    expect(ok).toBe(false);
    expect(useMedicalStore.getState().doctors).toHaveLength(1);
  });

  it('removeDoctor allows deletion once the appointment is cancelled (deleted)', () => {
    useMedicalStore.setState({ doctors: [DOCTOR], patients: [PATIENT] });
    act(() => {
      useMedicalStore.getState().bookAppointment(BASE_INPUT);
    });
    const id = useMedicalStore.getState().appointments[0].id;
    act(() => useMedicalStore.getState().cancelAppointment(id));
    let ok = false;
    act(() => {
      ok = useMedicalStore.getState().removeDoctor(DOCTOR.id).ok;
    });
    expect(ok).toBe(true);
    expect(useMedicalStore.getState().doctors).toHaveLength(0);
  });
});

describe('bookAppointment — validates constraints and persists confirmed appointments', () => {
  beforeEach(() => {
    useMedicalStore.setState({ doctors: [DOCTOR], patients: [PATIENT] });
  });

  it('books successfully and returns the appointment', () => {
    let result!: ReturnType<
      typeof useMedicalStore.getState
    >['bookAppointment'] extends (...args: infer _A) => infer R
      ? R
      : never;

    act(() => {
      result = useMedicalStore.getState().bookAppointment(BASE_INPUT);
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data?.status).toBe('confirmed');
      expect(result.data?.doctorId).toBe(DOCTOR.id);
    }
    expect(useMedicalStore.getState().appointments).toHaveLength(1);
  });

  it('rejects booking on a day-off date', () => {
    useMedicalStore.setState({
      doctors: [{ ...DOCTOR, daysOff: ['2026-06-02'] }],
      patients: [PATIENT],
    });
    let result!: ReturnType<
      typeof useMedicalStore.getState
    >['bookAppointment'] extends (...args: infer _A) => infer R
      ? R
      : never;

    act(() => {
      result = useMedicalStore.getState().bookAppointment(BASE_INPUT);
    });
    expect(result.ok).toBe(false);
    expect(useMedicalStore.getState().appointments).toHaveLength(0);
  });

  it('rejects a double-booking on the same slot', () => {
    act(() => useMedicalStore.getState().bookAppointment(BASE_INPUT));

    let second!: ReturnType<
      typeof useMedicalStore.getState
    >['bookAppointment'] extends (...args: infer _A) => infer R
      ? R
      : never;

    act(() => {
      second = useMedicalStore.getState().bookAppointment(BASE_INPUT);
    });
    expect(second.ok).toBe(false);
    expect(useMedicalStore.getState().appointments).toHaveLength(1);
  });

  it('rejects booking when doctor does not exist', () => {
    let result!: ReturnType<
      typeof useMedicalStore.getState
    >['bookAppointment'] extends (...args: infer _A) => infer R
      ? R
      : never;

    act(() => {
      result = useMedicalStore
        .getState()
        .bookAppointment({ ...BASE_INPUT, doctorId: 'ghost' });
    });
    expect(result.ok).toBe(false);
  });
});

describe('cancelAppointment / completeAppointment — status transitions and slot availability', () => {
  beforeEach(() => {
    useMedicalStore.setState({ doctors: [DOCTOR], patients: [PATIENT] });
  });

  it('cancel deletes the appointment and the slot can be rebooked', () => {
    act(() => useMedicalStore.getState().bookAppointment(BASE_INPUT));
    const apptId = useMedicalStore.getState().appointments[0].id;

    act(() => useMedicalStore.getState().cancelAppointment(apptId));
    expect(useMedicalStore.getState().appointments).toHaveLength(0);

    let rebook!: ReturnType<
      typeof useMedicalStore.getState
    >['bookAppointment'] extends (...args: infer _A) => infer R
      ? R
      : never;

    act(() => {
      rebook = useMedicalStore.getState().bookAppointment(BASE_INPUT);
    });
    expect(rebook.ok).toBe(true);
  });

  it('completeAppointment changes status to completed', () => {
    act(() => useMedicalStore.getState().bookAppointment(BASE_INPUT));
    const id = useMedicalStore.getState().appointments[0].id;
    act(() => useMedicalStore.getState().completeAppointment(id));
    expect(useMedicalStore.getState().appointments[0].status).toBe('completed');
  });
});
