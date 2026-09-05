# Urban Furniture Accounting System (UFAC)

Double-entry bookkeeping application for the Urban Furniture hackathon — Contacts, Products, Chart of Accounts, Journals, Purchase/Sales flows, Payments, and financial Reports.

## Tech Stack

- **PostgreSQL** — database
- **Express.js** — REST API
- **React + Vite** — frontend SPA
- **Prisma 6** — ORM (latest stable classic ORM; Node 20 compatible)
- **Zod** — shared validation
- **JWT + bcrypt** — authentication

## Roles

| Role | Description |
|------|-------------|
| `ADMIN` | Business owner — full access |
| `ACCOUNTANT` | Invoicing user — operational access |
| `CONTACT` | Customer/vendor portal — scoped to own records |

## Quick Start

See **[SETUP.md](./SETUP.md)** for full copy-paste setup (Docker Postgres + native `npm run dev`).

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL via `docker compose up -d` (see SETUP.md)

### Short version

```bash
docker compose up -d
cd backend && npm install && cp .env.example .env
npx prisma migrate dev && node prisma/seed.js && npm run dev
# second terminal: cd frontend && npm install && npm run dev
```

### Seed credentials

| Email | Password | Role |
|-------|----------|------|
| admin@ufac.local | Admin123! | ADMIN |
| accountant@ufac.local | Account123! | ACCOUNTANT |

## Project Structure

```
UFAC/
├── backend/          # Express API + Prisma
└── frontend/         # React SPA
```

## UI Library

Components use minimal custom CSS. To add **Tailwind** or **MUI**, install your preferred library and update `frontend/src/components/common/`.

## API

All routes are under `/api/v1`. Responses follow:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "message" }
```
