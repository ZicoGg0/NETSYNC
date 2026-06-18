# Netsync

Fast, transparent delivery platform for Lagos, Nigeria. Book a delivery in under 60 seconds with real-time pricing, live tracking, and reliable logistics.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (dark-mode, mobile-first)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: OTP-based via Termii SMS + JWT sessions
- **Maps**: Google Maps API

## Features

- **OTP Authentication** — Nigerian phone number login with 6-digit OTP
- **Role-Based Access** — Customer, Provider, and Admin dashboards
- **Real-Time Pricing** — Haversine distance + surge pricing (peak hours)
- **Job Lifecycle** — 10+ status states from PENDING to COMPLETED
- **Notification System** — In-app notifications for all status changes
- **Admin Panel** — User management, job overview, revenue tracking

## Pricing

| Vehicle | Base Fare | Per km | Avg Speed |
|---------|-----------|--------|-----------|
| Bike    | ₦2,500    | ₦200   | 35 km/h   |
| Van     | ₦5,000    | ₦300   | 30 km/h   |
| Truck   | ₦8,000    | ₦400   | 25 km/h   |
| Haulage | ₦15,000   | ₦600   | 20 km/h   |

Surge pricing applies during peak hours (up to 1.5x).

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 13+

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

Required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Generate with `openssl rand -base64 32`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps API key
- `TERMII_API_KEY` — Termii SMS API key (OTP auth for Nigerian numbers)

### 3. Set up database

```bash
npx prisma migrate dev
```

### 4. Run development server

```bash
npm run dev
```

Visit http://localhost:3000

> In dev mode, OTP codes are shown in the UI — no Termii key needed for local development.

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy — Vercel handles the build automatically

For the database, use a managed PostgreSQL provider (e.g. Neon, Supabase, Railway) and set `DATABASE_URL` in Vercel.

```bash
# Production build
npm run build
npx prisma migrate deploy
npm run start
```

## Project Structure

```
app/
  (auth)/          Customer & Provider login pages
  (customer)/      Customer dashboard, post-job, job list
  (provider)/      Provider dashboard, available jobs
  (admin)/         Admin dashboard, users, all jobs
  api/             REST API routes
    auth/          send-otp, verify-otp, logout, me
    jobs/          CRUD + status transitions
    quotes/        Real-time pricing
    notifications/ Notification feed
    admin/         Admin stats & user management
components/        Shared UI components
lib/               Core utilities (auth, prisma, pricing, errors, termii)
prisma/            Database schema & migrations
types/             TypeScript type definitions
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP & create session |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/jobs` | List jobs (paginated) |
| POST | `/api/jobs` | Create a delivery job |
| GET | `/api/jobs/[id]` | Get job details |
| PATCH | `/api/jobs/[id]` | Update job status |
| POST | `/api/quotes` | Get pricing estimate |
| GET | `/api/notifications` | Get notifications |
| PATCH | `/api/notifications` | Mark notifications read |
| GET | `/api/admin/stats` | Admin statistics |
| GET | `/api/admin/users` | Admin user list |

## License

MIT
