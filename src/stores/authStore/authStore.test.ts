import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore, useRole, usePatientId } from './authStore';

beforeEach(() => {
  useAuthStore.setState({ role: null, patientId: null });
  localStorage.clear();
});

describe('useAuthStore shape', () => {
  it('exposes role, patientId and auth actions', () => {
    const s = useAuthStore.getState();
    expect(s.role).toBeNull();
    expect(s.patientId).toBeNull();
    expect(typeof s.loginAs).toBe('function');
    expect(typeof s.selectPatient).toBe('function');
    expect(typeof s.logout).toBe('function');
  });
});

describe('patient identity', () => {
  it('loginAs("patient") starts without an identity', () => {
    act(() => useAuthStore.getState().loginAs('patient'));
    expect(useAuthStore.getState().role).toBe('patient');
    expect(useAuthStore.getState().patientId).toBeNull();
  });

  it('selectPatient sets and persists the identity', () => {
    act(() => useAuthStore.getState().loginAs('patient'));
    act(() => useAuthStore.getState().selectPatient('pat-42'));
    expect(useAuthStore.getState().patientId).toBe('pat-42');
    expect(localStorage.getItem('caretta:patientId')).toBe('pat-42');
  });

  it('switching role clears a prior patient identity', () => {
    act(() => useAuthStore.getState().loginAs('patient'));
    act(() => useAuthStore.getState().selectPatient('pat-42'));
    act(() => useAuthStore.getState().loginAs('admin'));
    expect(useAuthStore.getState().patientId).toBeNull();
    expect(localStorage.getItem('caretta:patientId')).toBeNull();
  });

  it('logout clears the patient identity', () => {
    act(() => useAuthStore.getState().loginAs('patient'));
    act(() => useAuthStore.getState().selectPatient('pat-42'));
    act(() => useAuthStore.getState().logout());
    expect(useAuthStore.getState().patientId).toBeNull();
    expect(localStorage.getItem('caretta:patientId')).toBeNull();
  });

  it('usePatientId reflects the current identity', () => {
    const { result } = renderHook(() => usePatientId());
    expect(result.current).toBeNull();
    act(() => useAuthStore.getState().loginAs('patient'));
    act(() => useAuthStore.getState().selectPatient('pat-7'));
    expect(result.current).toBe('pat-7');
  });
});

describe('loginAs', () => {
  it('sets the role to patient', () => {
    act(() => useAuthStore.getState().loginAs('patient'));
    expect(useAuthStore.getState().role).toBe('patient');
  });

  it('sets the role to admin', () => {
    act(() => useAuthStore.getState().loginAs('admin'));
    expect(useAuthStore.getState().role).toBe('admin');
  });

  it('persists the role to localStorage', () => {
    act(() => useAuthStore.getState().loginAs('admin'));
    expect(localStorage.getItem('caretta:role')).toBe('admin');
  });

  it('replaces an existing role', () => {
    act(() => useAuthStore.getState().loginAs('patient'));
    act(() => useAuthStore.getState().loginAs('admin'));
    expect(useAuthStore.getState().role).toBe('admin');
  });
});

describe('logout', () => {
  it('clears the role', () => {
    act(() => useAuthStore.getState().loginAs('patient'));
    act(() => useAuthStore.getState().logout());
    expect(useAuthStore.getState().role).toBeNull();
  });

  it('clears the persisted role', () => {
    act(() => useAuthStore.getState().loginAs('patient'));
    act(() => useAuthStore.getState().logout());
    expect(localStorage.getItem('caretta:role')).toBeNull();
  });

  it('is a no-op when not logged in', () => {
    act(() => useAuthStore.getState().logout());
    expect(useAuthStore.getState().role).toBeNull();
  });
});

describe('useRole selector', () => {
  it('returns the current role', () => {
    act(() => useAuthStore.getState().loginAs('admin'));
    const { result } = renderHook(() => useRole());
    expect(result.current).toBe('admin');
  });

  it('updates when the role changes', () => {
    const { result } = renderHook(() => useRole());
    expect(result.current).toBeNull();

    act(() => useAuthStore.getState().loginAs('patient'));
    expect(result.current).toBe('patient');

    act(() => useAuthStore.getState().logout());
    expect(result.current).toBeNull();
  });
});

describe('action stability', () => {
  it('action references are stable across state updates', () => {
    const { result, rerender } = renderHook(() =>
      useAuthStore((s) => s.loginAs)
    );
    const ref1 = result.current;

    act(() => useAuthStore.getState().loginAs('patient'));
    rerender();

    expect(result.current).toBe(ref1);
  });
});
