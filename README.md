# Pyramid — Task Management System

Full-stack task management app for the assessment. Monorepo with two apps:

- `frontend/` — Next.js (App Router) + Tailwind CSS
- `backend/` — NestJS + MongoDB (Mongoose), JWT auth (guest + Google OAuth)

## Quick start

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in MongoDB URI, JWT secret, Google OAuth creds
npm run start:dev       # http://localhost:4000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                   # http://localhost:3000
```

The frontend works even without the backend running (it falls back to local mock data), so you can preview the UI standalone, but full persistence/auth requires the backend + a MongoDB connection.

See `frontend/README.md` and `backend/README.md` for details on each half, including deployment and Google OAuth setup.

## Part 2 — Product Understanding
See `PART-2-PRODUCT-UNDERSTANDING.md` for the AbleSpace Take Data workflow writeup.
