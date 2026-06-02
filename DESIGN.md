# Caretta - Architecture and Design notes

WIP

These are the architectural and design decisions behind the prototype and the reasoning for each one.

1. Component hierarchy
   Describe the main components, how they are organized, and any deliberate boundary decisions (e.g., why something was split into two components rather than kept as one).

2. State management decision
   Explain which approach you chose (local state, React Context, an external store, or a combination) and why. If you used more than one approach for different parts of the app, explain the reasoning behind each boundary.

3. Slot generation logic
   Describe where this logic lives (utility function, custom hook, service module) and why you placed it there. What would break if it lived somewhere else?

4. Concurrency note
   You are not implementing locking, but explain in 3–5 sentences how you would prevent two patients from booking the same slot simultaneously in a production system. Describe the strategy and its trade-offs.

5. One trade-off you made
   Pick any decision where you consciously chose one approach over another. Describe both options and why you went with the one you did.

6. One product improvement you would propose
   If you were presenting this to the product team after delivering the prototype, what would you suggest adding or changing, and why?

## Render control: time-based list freshness

Two patient-facing lists depend on the current time: the upcoming-appointments list
(`UpcomingAppointments`) and the available-slots list (`useAvailableSlots`). Both are
derived with `useMemo` and read "now" through `todayISO()` / `nowHHmm()` once per recompute.
They refresh when their data changes (appointments, doctors, filters) — not on a timer.

The trade-off: a same-day entry whose start time passes while the tab sits idle stays
visible until the next interaction that changes the underlying data (a book/cancel, a filter
change) rather than disappearing on the minute. We chose this deliberately over ticking a
`now` value on a `setInterval`, because an interval is a wall-clock re-render source that
re-runs the memo and re-renders the list whether or not any entry is actually expiring — the
opposite of the deliberate render control the app aims for, and especially costly on the
slot list, which the performance guidelines single out as the expensive computation that
must not recompute needlessly.

The staleness is display-only and cannot cause a bad write: slot derivation excludes past
times, and `validateBooking` independently rejects a started slot, so a lingering row cannot
be booked. If instant freshness were ever required, the narrowest fix is an interval gated on
whether a same-day entry is still pending, so idle patients with no today-entries pay nothing.

## Security: client-side role gating

The role a user picks on login is stored client-side and used only to decide which
view to render. The router guard (RequireRole) stops a patient from seeing the admin
view and an admin from seeing the patient view, and logout clears the role and returns
to login. This is a user-experience affordance, not a security boundary. Anyone can edit
local storage or call the data layer directly, so the client side cannot be trusted to keep a
patient out of admin data.

Real enforcement belongs on the server, checked on every request against an authenticated
session rather than a value the browser holds. The server would verify identity, confirm
the role is allowed to perform the action, and scope every query to the data that role may
see, returning the same answer no matter what the client renders. The client guard and the
server check are layered: the guard makes the wrong view unreachable in normal client side use, and the
server makes it unreachable in fact.
