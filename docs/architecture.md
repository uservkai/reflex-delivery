# Reflex Architecture

## Overview

Reflex is a delivery management MVP for small retailers. It provides a shared workflow for creating delivery requests, assigning riders, tracking delivery status, and confirming final handover.

The system supports three operational roles:

- **Retailer** — creates and tracks delivery requests.
- **Dispatcher** — views open requests and assigns riders.
- **Rider** — views assigned deliveries and updates delivery status.

The delivery lifecycle is:

```text
Pending → Assigned → Picked Up → Delivered
```

A QR-based confirmation step is used at final handover.

---

## System Context

Reflex is implemented as a client-side web application backed by Supabase.

```text
┌──────────────────────────────────────────────┐
│              React Web Application           │
│                                              │
│  Retailer UI   Dispatcher UI   Rider UI      │
└───────────────────┬──────────────────────────┘
                    │
                    │ Supabase JavaScript SDK
                    │
┌───────────────────▼──────────────────────────┐
│                  Supabase                    │
│                                              │
│  Authentication                             │
│  PostgreSQL                                 │
│  Row Level Security                         │
│  Realtime                                   │
│  Database functions / triggers / policies   │
└──────────────────────────────────────────────┘
```

The frontend is deployed independently from the backend. The current deployment uses Vercel for the web application and Supabase for managed backend services.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | Role-based user interface |
| Language | TypeScript | Type safety and maintainability |
| Build tooling | Vite | Development server and production build |
| Authentication | Supabase Auth | User identity and sessions |
| Database | PostgreSQL via Supabase | Persistent delivery and profile data |
| Authorization | Supabase Row Level Security | Database-level access control |
| Realtime | Supabase Realtime | Live delivery updates |
| Hosting | Vercel | Static frontend deployment |
| Source control | GitHub | Version control and collaboration |

---

## Architectural Rationale

### React, TypeScript, and Vite

React was selected because the application consists of several interactive, role-specific views that benefit from reusable components.

TypeScript is used to make data contracts explicit and reduce errors when working with delivery records, profiles, and role-dependent UI.

Vite provides a lightweight development and build setup suitable for a client-side React application.

### Supabase

Supabase was selected because the MVP requires:

- authentication
- relational data storage
- role-based access control
- realtime updates

Using Supabase provides these capabilities without requiring a separate custom API server for the current scope.

The trade-off is increased dependence on a managed platform. That decision is documented separately in `tradeoff-log.md`.

---

## Core Data Model

### Profile

Each authenticated user has a corresponding profile record.

Typical fields:

```text
id
full_name
role
```

The profile `id` matches the Supabase Authentication user UUID.

Supported roles:

```text
retailer
dispatcher
rider
```

Public registration is restricted to the `retailer` role. Rider and dispatcher accounts are provisioned separately.

### Delivery

The delivery record is the central domain entity.

Typical fields include:

```text
id
retailer_id
customer_name
phone
address
item
status
rider_id
confirmation data
created_at
updated_at
```

The database is the source of truth for delivery state.

---

## Delivery State Model

Reflex uses a constrained delivery lifecycle:

```text
Pending
   ↓
Assigned
   ↓
Picked Up
   ↓
Delivered
```

The state model prevents invalid transitions such as moving directly from `Pending` to `Delivered`.

Status transitions represent operational events rather than free-form labels.

---

## User Flows

### Retailer

The retailer:

1. signs in or creates a retailer account
2. creates a delivery request
3. provides customer name, phone, address, and item description
4. tracks delivery progress
5. presents the customer confirmation QR at final handover

The retailer cannot assign riders.

### Dispatcher

The dispatcher:

1. signs in
2. views open delivery requests
3. selects a rider
4. assigns the delivery
5. monitors delivery progress

The dispatcher is an operational coordinator, not a full system administrator.

### Rider

The rider:

1. signs in
2. views deliveries assigned to them
3. updates an assigned delivery to `Picked Up`
4. completes the physical delivery
5. scans the customer confirmation QR at handover
6. completes the delivery

The rider cannot create or assign deliveries.

---

## Assignment Model

A new delivery begins without a rider.

Assignment updates the record to include the selected rider and changes the delivery state:

```text
rider_id = selected rider
status = Assigned
```

Assignment should be validated against the current database state.

If two dispatchers attempt to assign the same pending delivery at the same time, only one valid assignment should succeed. The browser UI is not treated as authoritative for concurrency control.

---

## Realtime Synchronization

Supabase Realtime is used to propagate changes between active clients.

Example:

```text
Retailer creates request
        ↓
Database insert
        ↓
Dispatcher sees open request
```

and:

```text
Dispatcher assigns rider
        ↓
Database update
        ↓
Rider sees assignment
        ↓
Retailer sees status change
```

Realtime improves visibility, but the PostgreSQL database remains the authoritative state.

If realtime connectivity is interrupted, reloading or reconnecting should retrieve the committed database state.

---

## QR Confirmation

The QR confirmation step is used only at final handover.

```text
Picked Up
   ↓
Rider reaches customer
   ↓
Customer confirmation QR is presented
   ↓
Rider scans QR
   ↓
Delivered
```

The QR provides lightweight confirmation that the rider had access to the order confirmation at handover.

It does not independently prove:

- customer identity
- rider GPS location
- customer signature
- item condition

Stronger proof-of-delivery mechanisms are considered future enhancements.

---

## Authentication and Authorization

Supabase Authentication manages sessions.

After authentication, the application loads the user profile using the same user ID:

```text
auth.users.id = profiles.id
```

The profile role determines which application view the user receives.

### Public Signup

Public users can create retailer accounts only.

Rider and dispatcher roles are not publicly selectable because users should not be able to grant themselves operational privileges.

### Database Security

Row Level Security is used so access control is enforced at the database layer rather than relying only on frontend routing.

The intended access model is:

- retailers access appropriate retailer-owned deliveries
- riders access deliveries assigned to them
- dispatchers access the operational queue needed for assignment and monitoring

---

## Environment and Secrets

Runtime configuration is supplied through environment variables.

Examples:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Demo account credentials are also configured through environment variables.


## Deployment

Current deployment flow:

```text
Developer
   ↓
Git push
   ↓
GitHub
   ↓
Vercel build
   ↓
React/Vite frontend
   ↓
Supabase backend
```

The frontend and backend are independently hosted.

This means the frontend can be moved to another static hosting provider without redesigning the data model.

---

## External Processes and System Boundaries

Not every activity occurs inside Reflex.

### Physical Delivery

The actual transport of the package and physical handover happen outside the application.

Reflex records the operational state but does not control the physical movement of the item.

### Rider and Dispatcher Provisioning

Rider and dispatcher accounts are provisioned administratively rather than through public self-registration.

### Customer Communication

The MVP does not provide automated SMS or push notifications. Any communication outside the application remains manual.

### Deployment and Configuration

GitHub, Vercel, and Supabase are external services used for source control, deployment, database management, and authentication configuration.

---

## Failure and Edge Cases

### Rider loses connectivity

The current MVP depends on network connectivity for status updates.

A future version should support:

- local persistence
- queued mutations
- retry after reconnect
- idempotency
- conflict resolution

### Two dispatchers assign the same delivery

The assignment operation should only succeed while the delivery remains in an assignable state.

### QR confirmation fails

The delivery should not be completed until confirmation succeeds.

Possible future fallbacks include:

- OTP
- manual proof review
- audited dispatcher override

### Realtime connection drops

The database remains authoritative. Clients should re-query the latest state after reconnecting.

---

## Deliberately Excluded Scope

The MVP does not currently include:

- GPS tracking
- route optimization
- payment processing
- inventory management
- advanced analytics
- customer mobile accounts
- automated SMS notifications
- advanced rider scheduling

These features are outside the minimum workflow required to prove the delivery coordination model.

---

## Known Architectural Limitations

The main known limitations are:

- dependence on Supabase as a managed backend
- lightweight QR proof of delivery
- no offline-first rider synchronization
- shared demo accounts
- manual provisioning of rider and dispatcher accounts

These are documented in detail in `tradeoff-log.md`.

---

## Roadmap

The next architectural priorities are:

1. offline-safe rider updates
2. stronger proof-of-delivery options
3. automated authorization and concurrency tests
4. audit history for delivery state changes
5. operational monitoring and observability
6. staff invitation and provisioning workflow
7. customer notifications
8. GPS and route support where justified
9. a dedicated API layer if business rules become materially more complex

---

## Summary

Reflex intentionally uses a lean architecture suitable for the current MVP.

The design provides:

- role-based authentication
- structured relational delivery data
- controlled status transitions
- realtime visibility
- database-level authorization
- QR-based delivery confirmation

The architecture is sufficient to support the complete delivery flow while keeping infrastructure complexity low. Known production limitations are documented explicitly and form the basis of the future roadmap.
