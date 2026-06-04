# Caretta - Architecture and Design notes

These are the design decisions behind the prototype and the reasoning for each one.

## 1. Component hierarchy

The app is organized by role and by responsibility. `App.tsx` holds the router and three branches: the login screen at `/`, a patient branch behind a role guard, and an admin branch behind a role guard. Each branch has a layout (`PatientLayout`, `AdminLayout`) that owns the page chrome, which for admin includes the two-item nav (Doctors and Appointments). Feature components live under their role folder (`patient`, `admin`), role-agnostic pieces (`Header`, `RequireRole`, `StatusBadge`, `ShiftBadge`, `Toaster`) live under `shared`, and shadcn primitives live under `ui`. Pure logic with no React lives under `utils`, and all persistence sits behind service modules.

The boundary worth calling out is in the patient slot view. `AvailableSlots` owns the search state and the booking dialog, but each slot is rendered by a separate, memoized `SlotCard`. I split these on purpose. The parent changes often, because the user edits filters and opens and closes the booking dialog, and if the cards were inline JSX they would all re-render on every one of those changes. By making `SlotCard` its own memoized component that receives a stable `onBook` callback, editing a filter or opening a dialog re-renders only the parent, not the whole list. The same split is applied to the admin and upcoming lists, where `AppointmentAdminRow`, `AppointmentRow`, and `DoctorRow` are all memoized rows. `RequireRole` is likewise a small standalone guard rather than logic baked into each page, so the rule that maps a role to a redirect lives in exactly one place.

## 2. State management decision

I used three Zustand stores plus local component state, and the rule for what goes where is simply "who needs to read this." Shared domain data (doctors, patients, appointments) lives in `medicalStore`. Session identity (the chosen role and the selected patient) lives in `authStore`. A small transient highlight state, used to flash a row that just changed, lives in `flashStore`. They are separate stores because they have different lifecycles and different subscribers: an auth change should not wake up domain subscribers, and a cosmetic flash should not share a store with the medical data.

I chose Zustand over React Context because for this small prototype it gives me lightweight shared state with selector-based subscriptions, while avoiding unnecessary Context re-renders when unrelated parts of the state change. Zustand lets each component subscribe to one slice through a selector hook (`useDoctors`, `useAppointments`, `useRole`), so a component that reads appointments does not re-render when only doctors change. In a larger production-grade application, I would still consider Zustand valid, but Redux Toolkit may become more suitable if the app needs stricter conventions, complex async flows, middleware, normalized data, advanced debugging, or API caching with RTK Query.
Ephemeral UI state stays in local `useState` rather than a store, because it has no other readers: the filter draft, the open dialog, and the currently selected slot are each owned by a single component, and putting them in a global store would add global re-renders for no benefit. Slots are deliberately not stored anywhere. They are derived, which is the subject of the next point.

## 3. Slot generation logic

Slot logic lives in pure functions under `src/utils`, with no imports from React, the store, or localStorage. `generateSlots` takes a doctor and a week start and returns that doctor's one-hour slots for the week, honoring the shift window (morning 5 slots, afternoon 6 slots), the working days, and the days off. `availableSlots` composes `generateSlots` across the relevant doctors, then subtracts booked appointments and applies the patient's filters. The only React-aware layer is the `useAvailableSlots` hook, which reads the store slices through selectors, calls `availableSlots` inside a `useMemo`, and additionally hides slots whose time has already passed.

I placed it there for three reasons: it is unit-testable without rendering anything (the suite checks slot count, timing, day coverage, and that a day off zeroes out a date), it is reusable by any caller, and its referentially stable inputs let `useMemo` cache the result. If this logic lived inside a component it would recompute on every render and could not be reused or tested without mounting the component. If it lived inside the store it would force one of two bad options: store the derived slots, which creates a second source of truth that has to be kept in sync with appointments, days off, and schedules and is the exact synchronization bug this design exists to avoid, or recompute on every store read with no memo boundary. Keeping generation pure and free of any notion of "now" also keeps it deterministic, so the "hide past slots" concern is layered on in the hook and the core function always returns the same output for the same input.

## 4. Concurrency note

In the prototype every action runs in one browser against one shared store, so a booked slot disappears from availability for everyone immediately, and `validateBooking` rejects any stale attempt at the moment of confirmation. In production the real risk is two patients submitting the same slot at almost the same instant, and the client cannot be the authority for that. The strategy I would use is a database uniqueness constraint on the combination of doctor, date, and start time for active appointments, so that when two inserts race the database commits the first and rejects the second atomically, and the losing request gets a clear "this slot was just taken" message together with a refreshed list. This is optimistic concurrency: it is simple and always correct, and its trade-off is that the losing patient only finds out at submit time, which I would soften with live availability updates by polling or websockets to shrink the window. The alternative, a short-lived hold that reserves the slot while the patient fills in the form, improves that experience but adds expiry, cleanup, and abandoned-hold handling, so I would add it only if real usage showed the race happening often.

## 5. One trade-off I made

The decision I want to highlight is that cancelling an appointment deletes it rather than keeping it with a "cancelled" status. The two options were a soft delete, where the record stays and its status is set to cancelled and every availability and list query filters cancelled records out, and a hard delete, where the record is removed entirely. I chose the hard delete for the prototype.

The reason is that it makes the central rule fall out for free. Availability is the schedule minus days off minus existing appointments, so removing the appointment immediately makes the slot bookable again, with no "ignore the cancelled ones" filtering anywhere in the derivation. It also keeps the model to the two statuses the prototype actually needs, confirmed and completed. The cost is that there is no cancellation history, but that is acceptable here because a full audit log is explicitly out of scope. In production I would switch to a soft delete, precisely because the audit and history requirements need the record to survive. The derivation would then filter on active status instead of on whether the row exists, which is a small change in one place thanks to keeping that logic centralized in `availableSlots`.

## 6. One product improvement I would propose

After delivering the prototype, I would improve the existing doctor day-off flow by adding guided rescheduling for affected appointments. The app already prevents booking on a doctor’s day off, but if that doctor already has appointments, the admin still needs to resolve them manually before marking the doctor unavailable. I would add a rule that planned doctor days off require at least 7 days’ notice when appointments already exist, while still allowing the admin to override this rule for emergencies such as illness or same-day unavailability.

In an emergency case, the system would detect all affected appointments and generate rescheduling options automatically. Each patient could receive a secure link with the next available slot, or the three closest available alternatives with another suitable doctor. Those options could be placed on a short-lived hold, for example two hours, so they stay reserved while the patient decides and cannot be booked by someone else.

Once the patient selects an option, the appointment is moved and the unused holds are released. If the patient does not respond in time, the system could either assign the closest available slot automatically or move the case into an admin follow-up queue, depending on clinic policy. To make last-minute cancellations fairer, patients affected by emergency doctor cancellations could also receive reward points that can be used for something meaningful, such as priority booking, a discount, or an additional clinic service.

## Performance and render control

The implementation controls rendering deliberately rather than by accident. Slot generation runs inside a `useMemo` keyed on its real inputs, so it does not recalculate on unrelated renders. The patient filter bar keeps two snapshots, a `draft` that the user edits and an `applied` set that derivation reads, and the search only commits the draft to applied on submit, so typing in the filters never triggers the expensive recompute. Store reads go through selector hooks so unrelated views do not re-render across the patient and admin boundary, and list rows are memoized with stable action callbacks so a change to one row does not re-render the list.

There is one deliberate staleness trade-off. The upcoming-appointments list and the available-slots list both depend on the current time, and both read "now" once per recompute rather than on a timer. The effect is that a same-day entry whose start time passes while the tab sits idle stays visible until the next interaction that changes the underlying data, such as a booking, a cancellation, or a filter change, instead of vanishing on the minute. I chose this over ticking a "now" value on an interval, because an interval is a wall-clock re-render source that re-runs the memo whether or not anything is actually expiring, which is the opposite of the deliberate render control the app aims for and is especially costly on the slot list. The staleness is display only and cannot cause a bad write, because slot derivation excludes past times and `validateBooking` independently rejects a started slot, so a lingering row cannot be booked.

## Security and access control

### Role enforcement

The role chosen at login is stored on the client and is used only to decide which view to render. `RequireRole` stops a patient from reaching the admin view and an admin from reaching the patient view, and logout clears the role and returns to login. This is a user-experience affordance, not a security boundary, because anyone can edit local storage or call the data layer directly. In production the role must be checked on the server on every request against an authenticated session, and every query must be scoped to the data that role is allowed to see, so the answer is the same no matter what the client renders.

### Input validation

Every form validates before it can submit and shows inline feedback. The doctor form uses React Hook Form with a zod schema and requires a name, a specialty, and at least one working day, and the patient registration form validates the name and the contact email and phone. Invalid fields are marked with `aria-invalid` and an associated message so the feedback is both visible and announced to assistive technology. In production the same rules would be re-validated on the server, because client validation is for guidance and can always be bypassed.

### OWASP awareness

The most relevant risk for this system is Broken Access Control (OWASP A01). Because the data is patient health information, the danger is not only a patient reaching admin screens but also one patient reading or cancelling another patient's appointment through a guessable id. I would mitigate it on the server with deny-by-default authorization on every endpoint, a role check for admin actions, and object-level checks that confirm the requesting patient actually owns the appointment they are acting on.

The second is Cryptographic Failures (OWASP A02), which covers exposure of sensitive data. Patient names, contact details, and which specialist a person is seeing are all health information, so I would serve everything over TLS, encrypt the data at rest, keep this information out of logs and error messages, and return only the fields a given view needs rather than whole records.

## Out of scope

These features are not implemented. The notes describe how I would approach them.

### Automated appointment reminders (SMS or email)

For automated reminders, I would handle the process on the server, not in the browser. A scheduled service like AWS EventBridge Scheduler would run every few minutes or every hour and trigger an AWS Lambda function. That function would look for confirmed appointments that need a reminder, for example appointments happening in the next 24 hours.

After finding those appointments, the Lambda function would send the reminder through the right channel: Amazon SES for email and AWS End User Messaging for SMS. Each reminder attempt would be saved in a notifications table, so if the job runs again or needs to retry after an error, the same patient does not receive the same reminder twice. The patient model already carries the email and phone the reminder needs, so the main additions are a notifications table, per-patient channel preferences, and the scheduler itself.

### Full audit log

I would add an append-only event log on the server that records every booking, cancellation, day-off change, and completion, each with the actor, timestamp, and before and after state. This is the main reason production would move cancellation from a hard delete to a soft delete, since the appointment record needs to survive even after it is no longer active. For patient health data, this kind of audit log is valuable both for compliance and for resolving disputes about who changed what and when.

The application-level events would live in an append-only audit_events table, because the system needs to preserve the business history of appointment changes, not only the latest state. In a production AWS setup, I would complement this with CloudTrail for infrastructure-level auditing, and optionally export audit events to S3 with Object Lock if stronger retention or immutability requirements were needed.
