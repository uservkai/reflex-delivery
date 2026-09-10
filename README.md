# Reflex

Reflex is a delivery management MVP for small retailers. It provides a simple, trackable workflow for creating delivery requests, assigning riders, updating delivery status, and confirming final handover.

## Problem

Small retailers often coordinate deliveries through calls and informal messaging, making it difficult to know who is assigned, where a delivery is in the process, and whether it has been completed.

Reflex provides one shared delivery record that is visible across the delivery workflow.

## Features

- Retailer delivery request creation
- Dispatcher view for open requests
- Rider assignment
- Rider-specific delivery view
- Delivery status updates
- Realtime synchronization
- QR-based delivery confirmation
- Role-based authentication
- Demo accounts for quick testing
- Responsive web interface

## Tech Stack

- React
- TypeScript
- Vite
- Supabase
  - Authentication
  - PostgreSQL
  - Realtime
  - Row Level Security
- Vercel for frontend deployment

## Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd reflex-delivery-app
```

Install dependencies:

```bash
npm install
```

Create a Supabase project and run:

```text
supabase/schema.sql
```

in the Supabase SQL Editor.

Create a `.env` file in the project root

Then start the development server:

```bash
npm run dev
```

## Environment Variables

Edit `.env`:

The application requires:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY

VITE_DEMO_RETAILER_EMAIL=
VITE_DEMO_RETAILER_PASSWORD=

VITE_DEMO_DISPATCHER_EMAIL=
VITE_DEMO_DISPATCHER_PASSWORD=

VITE_DEMO_RIDER_EMAIL=
VITE_DEMO_RIDER_PASSWORD=

VITE_DEMO_RIDER2_EMAIL=
VITE_DEMO_RIDER2_PASSWORD=
```

Do not commit your real `.env` file.

## Main User Flow

```text
Retailer creates delivery
        ↓
Dispatcher assigns rider
        ↓
Rider marks Picked Up
        ↓
Customer confirmation QR is scanned
        ↓
Delivery is marked Delivered
```

## Live Demo

```text
https://reflex-delivery-rust.vercel.app/
```

## License / Project Context

Reflex was created as an educational MVP for a system-design and readiness sprint focused on architecture, trade-offs, product storytelling, and technical defense.

© 2026 Reflex. All rights reserved.
