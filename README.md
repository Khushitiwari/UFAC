# UFAC — Urban Furniture Accounting System

A full-stack double-entry accounting application for managing contacts, products, purchase and sales cycles, payments, budgets, and financial reports. Built for Urban Furniture with role-based access for admins, accountants, and customer/vendor portal users.

## Features

- **Master data** — Contacts (with photo upload & Kanban/list views), products, chart of accounts, analytic accounts
- **Double-entry ledger** — Journals, manual journal entries, balanced debit/credit validation
- **Purchase cycle** — Purchase orders → vendor bills → payments
- **Sales cycle** — Sales orders → customer invoices → payments
- **Budgets & analytics** — Budget planning with variance reporting
- **Financial reports** — Balance sheet, profit & loss, budget vs actual
- **Dashboard** — Sales/purchase summaries, budget metrics, recent activity, cash position
- **Portal users** — Admins can create CONTACT-role logins for customers and vendors
- **Role-based UI** — Staff see full app; portal users see only their bills, invoices, and payments

## Tech Stack

| Layer | Technology |
|-------|------------|
| Database | PostgreSQL 16 (Docker) |
| Backend | Node.js 20, Express 4, Prisma 6 |
| Frontend | React 18, Vite 6, React Router 6 |
| Validation | Zod (shared patterns on client & server) |
| Auth | JWT + bcrypt |
| UI | Custom CSS, Framer Motion |

## Architecture

```
┌─────────────┐     /api/v1      ┌─────────────┐     Prisma     ┌────────────┐
│  React SPA  │ ───────────────► │ Express API │ ─────────────► │ PostgreSQL │
│  (Vite)     │ ◄─────────────── │  + Zod      │ ◄───────────── │  (Docker)  │
└─────────────┘     JWT JSON     └─────────────┘                └────────────┘
```

- **API base path:** `/api/v1`
- **Response format:** `{ success, message?, data?, error? }`
- **Ledger:** All bills, invoices, and payments post balanced journal entries automatically

## Project Structure

```
UFAC/
├── docker-compose.yml       # PostgreSQL on port 5437
├── SETUP.md                 # Detailed local setup guide
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Data model
│   │   └── seed.js          # Demo + bulk seed (300 records/table)
│   ├── scripts/
│   │   └── e2e-smoke.mjs    # API smoke tests
│   └── src/
│       ├── routes/          # REST route definitions
│       ├── controllers/     # Request handlers
│       ├── services/        # Business logic & ledger
│       ├── validators/      # Zod schemas
│       └── middlewares/     # Auth, RBAC, validation
└── frontend/
    └── src/
        ├── api/             # Axios API clients
        ├── pages/           # Route pages
        ├── components/      # Forms, layout, shared UI
        ├── hooks/           # Data fetching hooks
        ├── validators/      # Client-side Zod schemas
        └── routes/          # App routing
```

## Quick Start

**Prerequisites:** Node.js 20+, Docker & Docker Compose

```bash
# 1. Start database
docker compose up -d

# 2. Backend
cd backend
npm install
cp .env.example .env          # configure DATABASE_URL & JWT_SECRET
npx prisma migrate dev
npx prisma generate
npm run seed
npm run dev

# 3. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:5000/api/v1 |
| Health check | http://localhost:5000/api/v1/health |

For troubleshooting, port conflicts, and database resets, see **[SETUP.md](./SETUP.md)**.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (default port `5437`) |
| `JWT_SECRET` | Secret for signing tokens (32+ chars) |
| `JWT_EXPIRY` | Token lifetime (default `7d`) |
| `PORT` | API port (default `5000`) |
| `CORS_ORIGINS` | Allowed frontend origins |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | API base URL (`/api/v1` uses Vite proxy in dev) |

## Seed Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@ufac.local | Admin123! | ADMIN |
| accountant@ufac.local | Account123! | ACCOUNTANT |
| vendor@urbanfurniture.com | Contact123! | CONTACT (vendor portal) |
| customer@designstudio.com | Contact123! | CONTACT (customer portal) |

### Bulk seed

Populate **300 records per table** for load testing:

```bash
cd backend
npm run seed                  # default: 300 records
BULK_COUNT=500 npm run seed   # custom count
```

## Roles & Permissions

| Role | Access |
|------|--------|
| **ADMIN** | Full CRUD, delete records, create portal users |
| **ACCOUNTANT** | Create and edit operational records; no delete or portal user management |
| **CONTACT** | Portal only — own vendor bills, customer invoices, and payments |

Public signup allows **ADMIN** or **ACCOUNTANT** roles only. Portal users are created by admins from the contact master.

## API Modules

| Module | Base path |
|--------|-----------|
| Auth | `/auth` (register, login, me) |
| Contacts | `/contacts` |
| Products | `/products` |
| Accounts | `/accounts` |
| Journals & entries | `/journals`, `/journals/entries` |
| Purchase orders | `/purchase-orders` |
| Vendor bills | `/vendor-bills` |
| Sales orders | `/sales-orders` |
| Customer invoices | `/customer-invoices` |
| Payments | `/payments` |
| Analytic accounts | `/analytic-accounts` |
| Budgets | `/budgets` |
| Reports | `/reports/balance-sheet`, `/reports/profit-loss`, `/reports/budget` |
| Dashboard | `/dashboard/summary` |

## Development Scripts

### Backend

```bash
npm run dev              # Start with nodemon
npm run start            # Production start
npm run seed             # Seed database
npm test                 # Run Jest unit tests
npm run prisma:studio    # Open Prisma Studio
node scripts/e2e-smoke.mjs   # API smoke tests (server must be running)
```

### Frontend

```bash
npm run dev              # Vite dev server
npm run build            # Production build
npm run preview          # Preview production build
```

## Testing

```bash
# Backend unit tests
cd backend && npm test

# API smoke tests (requires running server + seeded DB)
cd backend && node scripts/e2e-smoke.mjs

# Frontend production build check
cd frontend && npm run build
```

## Notes

- **Currency:** Display uses Indian Rupee (₹ / INR) via `frontend/src/utils/format.js`
- **Database port:** PostgreSQL runs on host port **5437** to avoid conflicts with local installs
- **CORS in dev:** Frontend uses a Vite proxy — set `VITE_API_BASE_URL=/api/v1` in `frontend/.env`

## License

MIT
