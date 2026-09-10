# Reflex Engineering Trade-Off Log

## Purpose

This document records significant engineering trade-offs made in the Reflex MVP.

Each entry describes:

- the decision made
- the limitation introduced by that decision
- why the limitation was accepted for the current scope
- what would change in a more mature implementation

The purpose is to make architectural compromises explicit for reviewers, maintainers, and future contributors.

---

## 1. Managed Backend with Supabase

### Decision

Reflex uses Supabase for:

- authentication
- PostgreSQL
- realtime updates
- Row Level Security
- database functions and policies

A separate custom API server was not introduced for the MVP.

### Trade-off

This reduces infrastructure complexity but increases dependence on a managed platform.

As the product grows, some business logic may become harder to organize across frontend code, database policies, and database functions.

Moving away from Supabase-specific services later may also require migration work.

### Why This Was Accepted

The current system needs authentication, relational storage, authorization, and realtime updates.

Supabase provides all four without requiring the team to separately build and deploy:

- API infrastructure
- authentication middleware
- websocket infrastructure
- database connection management
- server hosting

For the current scope, the reduction in operational complexity is more valuable than full infrastructure independence.

### Future Direction

If business rules become materially more complex, introduce a dedicated API or service layer while retaining PostgreSQL as the system of record.

---

## 2. QR-Based Confirmation as Proof of Delivery

### Decision

The rider confirms final handover using a customer confirmation QR.

### Trade-off

The QR provides lightweight confirmation, but it does not independently prove:

- customer identity
- rider location
- customer signature
- item condition
- that the intended recipient personally accepted the item

Anyone with access to the confirmation QR could potentially complete the confirmation step.

### Why This Was Accepted

The project requirement includes scanning for order confirmation.

QR confirmation is:

- fast
- low-cost
- easy to demonstrate
- simple for the user
- sufficient to prove the intended confirmation workflow in the MVP

It provides more structure than a manual "Delivered" button without introducing a larger identity-verification system.

### Future Direction

The strength of proof should be matched to delivery risk.

Possible additions include:

- OTP confirmation
- timestamped confirmation
- customer signature
- delivery photo
- GPS evidence
- audited dispatcher override

---

## 3. Rider Workflow Requires Connectivity

### Decision

The current rider workflow expects network access when loading assignments and updating delivery status.

### Trade-off

In poor connectivity, the physical state of a delivery can move ahead of the digital state.

For example:

```text
Physical state: Picked Up
System state: Assigned
```

until the rider reconnects and updates the application.

This is particularly important because riders are field users.

### Why This Was Accepted

Offline synchronization introduces substantial additional complexity:

- local persistence
- mutation queues
- retry logic
- duplicate prevention
- reconnect behavior
- conflict handling
- pending-sync user interface states

The MVP prioritizes a correct online workflow before introducing distributed synchronization behavior.

### Future Direction

Add an offline-first update mechanism:

```text
Rider action
   ↓
Local durable queue
   ↓
Immediate local state
   ↓
Reconnect
   ↓
Server validation
   ↓
Sync or conflict resolution
```

Queued mutations should use idempotency identifiers so retries do not produce duplicate changes.

---

## 4. Shared Demo Accounts

### Decision

The deployed demonstration environment includes shared accounts for:

- Demo Retailer
- Demo Dispatcher
- Demo Rider
- Demo Rider 2

### Trade-off

Multiple reviewers can interact with the same accounts and demo data.

One user's actions may affect what another user sees.

Shared demo accounts are therefore unsuitable for sensitive or production data.

### Why This Was Accepted

The demo accounts reduce friction for reviewers and panel members.

They make it possible to evaluate each role without:

- creating an account
- waiting for email confirmation
- manually configuring roles

This is useful for a project demonstration environment.

### Future Direction

Create isolated demo tenants or temporary seeded sessions and automatically reset demo data between sessions.

---

## 5. Retailer-Only Public Signup

### Decision

Public account creation assigns users the `retailer` role.

Rider and dispatcher accounts are provisioned separately.

### Trade-off

Staff onboarding requires an administrative step.

There is currently no self-service invitation workflow for riders or dispatchers.

### Why This Was Accepted

Allowing public users to select privileged operational roles would weaken authorization.

A user should not be able to register and grant themselves dispatcher or rider access.

Manual provisioning protects from exposing sensitive user information.

### Future Direction

Introduce an invitation-based workflow:

```text
Authorized administrator
        ↓
Staff invitation
        ↓
Single-use invitation
        ↓
Account creation
        ↓
Server-controlled role assignment
```

---

## Summary

| Trade-off | Benefit | Cost | Future Improvement |
|---|---|---|---|
| Supabase-managed backend | Fast development and low infrastructure overhead | Platform dependency | Add API/service layer when justified |
| QR confirmation | Simple handover confirmation | Limited proof strength | Add OTP, signature, GPS, or photo evidence |
| Online-only rider updates | Simpler and more predictable MVP | Weak resilience in poor connectivity | Add offline queue and sync |
| Shared demo accounts | Easy project evaluation | Shared mutable demo state | Isolated or resettable demo sessions |
| Retailer-only public signup | Safer privilege management | Manual staff onboarding | Invitation-based staff provisioning |

---

## Current Priority

If the project moves beyond MVP, the first trade-offs to address are:

1. rider connectivity and offline synchronization
2. stronger proof of delivery
3. automated authorization and concurrency testing
4. staff provisioning
5. production monitoring and auditability

These trade-offs are accepted for the current MVP, but they should not be treated as permanent production assumptions.
