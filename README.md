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

## Features

- Role-based views (admin and patient) with client-side route guarding
- Doctor management: add doctors, set per-doctor days off
- Available slots derived on the fly from each doctor's schedule, days off, and existing bookings (slots are never persisted)
- Booking and cancellation that immediately add or restore the affected slot
- Slot search and filtering by specialty, doctor, and date
- Seedable demo data with a loading state, toggled from the login screen
- Loading, empty, and error states across the views; accessible forms and dialogs

## Tech Stack

- **Build tool**: Vite
- **Framework**: React 19 + TypeScript
- **State management**: Zustand (separate domain and auth stores)
- **Data persistence**: localStorage (behind a data-service interface)
- **Routing**: React Router
- **Forms**: React Hook Form + Zod
- **UI**: Tailwind CSS + shadcn/ui
- **Testing**: Vitest + React Testing Library

## Getting Started

### Requirements

- Node 20+

### Installation and Development

```bash
npm install
npm run dev
```

Open the local URL Vite prints.

Example:

```
  ➜  Local:   http://localhost:5173/
```

## First Run (empty data)

The app starts with **no data**. The fastest way to explore it is the **Seed data** button on the login screen (see [Demo Data](#demo-data) below).

If you'd rather start from scratch, the system has to be populated in order, because patients can only book slots that doctors expose:

1. Continue as **admin** and **add one or more doctors** (each with a specialty, shift, and working days).
2. Continue as **patient**, register a patient, then **search and book** an available slot.

Without at least one doctor there are no slots to book, so the patient view will be empty by design.

## Demo Data

To explore the app with realistic content, use the **Seed data** button in the top-right of the login screen:

- **Seed data** loads sample doctors, patients, and appointments for the current week.
- **Clear data** (shown once data exists) removes everything and returns to the empty state.

Either action shows a brief **loading state** and then reloads the app. The data layer is synchronous today, so this loading state stands in for the wait a real async backend would add. Seed data is written through the same data-service interface the rest of the app uses, so it is purely a demo affordance with no special path.

## Mock Authentication

There is no real auth backend. On the login screen, select a role:

- **Admin**: manage doctors and schedules
- **Patient**: register a new patient, or pick an existing one if data is already loaded, then book and manage appointments

The role is stored in the auth store and persisted for the session. Client-side role enforcement is a UX affordance only — real enforcement would be server-side, per request. See [DESIGN.md](DESIGN.md) for more information.

## Scripts

```bash
npm run dev          # start the Vite dev server
npm run build        # typecheck (tsc -b) and build for production
npm run preview      # preview the production build locally
npm run lint         # run ESLint
npm run lint:fix     # run ESLint with --fix
npm run format       # check formatting with Prettier
npm run format:fix   # apply Prettier formatting
npm run test         # run the test suite once
npm run test:watch   # run tests in watch mode
```

## Git Hooks

[Husky](https://typicode.github.io/husky/) enforces quality gates locally:

- **pre-commit** runs `npm run format` and `npm run lint`.
- **pre-push** runs `npm run test`.

So formatting/lint failures block commits and failing tests block pushes. Hooks are installed automatically via the `prepare` script on `npm install`.

## Testing

The tests cover the five required flows: slot generation (count, timing, day coverage), day-off enforcement, booking, cancellation, and filtering. They favor flow-level tests through hooks and components over isolated units.

```bash
npm run test
```

## License

[MIT](LICENSE)
