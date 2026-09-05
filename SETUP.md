# UFAC — Local Setup

Postgres runs in Docker; the backend and frontend run natively with `npm run dev` for fast hot-reload during the hackathon.

## Prerequisites

- Node.js 20+
- Docker & Docker Compose

## First-time setup

From the **project root** (`UFAC/`, not `backend/`):

```bash
# 1. Start PostgreSQL (docker-compose.yml lives at project root)
docker compose up -d

# 2. Backend
cd backend
npm install
cp .env.example .env   # set DATABASE_URL to match docker-compose.yml
npx prisma migrate dev
npx prisma generate
node prisma/seed.js
npm run dev
```

In a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

- API: http://localhost:5000  
- App: http://localhost:5173  

### Seed login

| Email | Password |
|-------|----------|
| admin@ufac.local | Admin123! |
| accountant@ufac.local | Account123! |

## Wait for the database before migrations

If you script setup, wait until Postgres is healthy:

```bash
docker compose up -d
docker compose ps   # STATUS should show "healthy"
```

Or poll manually:

```bash
until docker compose exec db pg_isready; do sleep 1; done
```

## Stopping Postgres

```bash
# Stop containers; data is kept in the pgdata volume
docker compose down
```

```bash
# Stop containers AND delete the pgdata volume (wipes all DB data — use to re-test seeding from scratch)
docker compose down -v
```

> **Note:** Always run `docker compose` from the project root (the folder containing `docker-compose.yml`), not from `backend/`.

After `docker compose down -v`, run migrations and seed again:

```bash
cd backend
npx prisma migrate dev
node prisma/seed.js
```

## Port conflicts

UFAC Postgres runs on host port **5437** (see `docker-compose.yml`). Set `DATABASE_URL` in `backend/.env` to match the user, password, port, and database name in `docker-compose.yml`.
