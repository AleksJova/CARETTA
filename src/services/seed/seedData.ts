import type { Doctor, Patient } from '@/types';

// Demo seed data. All names/contacts are obviously fake — never real PHI.
// Specialties and doctor names mirror the design mockup so the seeded UI matches
// the reference screenshot out of the box.

export const SEED_DOCTORS: Doctor[] = [
  {
    id: 'doc-patel',
    name: 'Dr. Patel',
    specialty: 'Cardiology',
    shift: 'morning',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    daysOff: [],
  },
  {
    id: 'doc-okafor',
    name: 'Dr. Okafor',
    specialty: 'Cardiology',
    shift: 'afternoon',
    workingDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    daysOff: [],
  },
  {
    id: 'doc-reyes',
    name: 'Dr. Reyes',
    specialty: 'Pulmonology',
    shift: 'morning',
    workingDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    daysOff: [],
  },
  {
    id: 'doc-nakamura',
    name: 'Dr. Nakamura',
    specialty: 'Dermatology',
    shift: 'afternoon',
    workingDays: ['Tue', 'Wed', 'Thu', 'Sat'],
    daysOff: [],
  },
];

// The single demo patient. Mock auth is role-only (no patient login), so every
// booking in the patient view is attributed to this fake identity for the demo.
export const DEMO_PATIENT: Patient = {
  id: 'pat-demo',
  name: 'Patient Demo',
  email: 'patient@example.com',
  phone: '+1 (555) 0100',
};

export const SEED_PATIENTS: Patient[] = [DEMO_PATIENT];
