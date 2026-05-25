# Caretta

Appointment management prototype for a medical center.

## Overview

The clinic runs Monday to Saturday with two specialist shifts:
- **Morning shift**: 8 am to 1 pm (5 slots)
- **Afternoon shift**: 1 pm to 7 pm (6 slots)

**Roles:**
- **Admins**: manage doctors, mark doctors unavailable for dates, view all appointments, mark appointments completed
- **Patients**: search available slots, book and cancel appointments, view upcoming appointments

Front-end prototype with no backend. Architecture and design reasoning are documented in [DESIGN.md](DESIGN.md).

## Tech Stack

- **Build tool**: Vite
- **Framework**: React 19 + TypeScript
- **State management**: Zustand (separate domain and auth stores)
- **Data persistence**: localStorage (behind a data-service interface)
- **Routing**: React Router
- **Forms**: React Hook Form
- **UI**: Tailwind CSS + shadcn/ui
- **Testing**: Vitest + React Testing Library

## Getting Started

### Requirements
- Node 18+

### Installation and Development

```bash
npm install
npm run dev
```

Open the local URL Vite prints.

Example:

```
  ➜  Local:   * http://localhost:5173/ *
```

## Test

 The testing covers the five required flows: slot generation (count, timing, day coverage), day-off enforcement, booking, cancellation, and filtering. They favor flow-level tests through hooks and components over isolated units.

```bash
npm run test
```

## Mock Authentication

There is no real auth backend. On the login screen, select a role:
- **Admin**: manage doctors and schedules
- **Patient**: book and manage appointments

The role is stored in the auth store and persisted for the session. See [DESIGN.md](DESIGN.md) for more information.
