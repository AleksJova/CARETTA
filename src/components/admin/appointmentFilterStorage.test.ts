import { afterEach, describe, expect, it } from 'vitest';
import {
  readAppointmentFilters,
  writeAppointmentFilters,
  clearAppointmentFilters,
} from './appointmentFilterStorage';

afterEach(() => sessionStorage.clear());

describe('appointment filter storage', () => {
  it('returns no filters when nothing is persisted', () => {
    expect(readAppointmentFilters()).toEqual({});
  });

  it('persists and restores all three filters', () => {
    writeAppointmentFilters({
      doctorId: 'doc-1',
      status: 'completed',
      date: '2026-06-03',
    });
    const read = readAppointmentFilters();
    expect(read.doctorId).toBe('doc-1');
    expect(read.status).toBe('completed');
    expect(read.date).toBe('2026-06-03');
  });

  it('restores an undefined date as the whole-week view', () => {
    writeAppointmentFilters({ doctorId: 'doc-1' });
    expect(readAppointmentFilters().date).toBeUndefined();
  });

  it('drops an invalid persisted status', () => {
    sessionStorage.setItem(
      'caretta:admin:appointmentFilters',
      JSON.stringify({ status: 'cancelled' })
    );
    expect(readAppointmentFilters().status).toBeUndefined();
  });

  it('clear removes the persisted filters', () => {
    writeAppointmentFilters({ doctorId: 'doc-1' });
    clearAppointmentFilters();
    expect(readAppointmentFilters()).toEqual({});
  });
});
