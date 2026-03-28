# openmindplus.com

Monorepo for openmindplus.com

## Structure

```
openmindplus.com/
├── frontend/        # Next.js (public pages + admin)
├── backend/         # Fastify API
├── db/              # Database
│   ├── migrations/  # SQL migrations
│   └── seeds/       # Seed data
└── scripts/         # Deploy & utility scripts
```

## Stack

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Node.js + Fastify
- **Database:** PostgreSQL
- **Auth:** JWT (backend) + NextAuth.js (frontend admin)

## Development

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npm run dev
```
