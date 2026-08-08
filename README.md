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
See `docs/Part-2-Product-Understanding.docx` for the AbleSpace Take Data workflow writeup.

## Deploying (required by the assessment — live URL + public repo)

### 1. Push to GitHub
```bash
cd pyramid-project
git remote add origin https://github.com/<your-username>/pyramid-project.git
git branch -M main
git push -u origin main
```
(Create the empty repo on GitHub first — no README/license, so it doesn't conflict with this history.)

### 2. Database — MongoDB Atlas (free tier)
1. atlas.mongodb.com → create a free M0 cluster.
2. Database Access → add a user + password.
3. Network Access → Add IP Address → "Allow access from anywhere" (0.0.0.0/0) so your host can connect.
4. Connect → Drivers → copy the connection string → this is your `MONGODB_URI`.

### 3. Backend — Render (or Railway)
1. render.com → New → Web Service → connect your GitHub repo → set **root directory** to `backend`.
2. Build command: `npm install && npm run build`. Start command: `npm run start:prod`.
3. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` (use the Render URL: `https://<your-service>.onrender.com/auth/google/callback`), `FRONTEND_URL` (fill in after step 4).
4. Deploy. Note the resulting URL, e.g. `https://pyramid-api.onrender.com`.
5. Back in Google Cloud Console, add that same callback URL to your OAuth client's **Authorized redirect URIs**.

### 4. Frontend — Vercel
1. vercel.com → New Project → import the same GitHub repo → set **root directory** to `frontend`.
2. Add environment variable: `NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com`.
3. Deploy. Note the resulting URL, e.g. `https://pyramid-app.vercel.app`.
4. Go back to Render, set the backend's `FRONTEND_URL` env var to this Vercel URL, and redeploy the backend so CORS + the post-login redirect point at the right place.

### 5. Sanity check
Visit your Vercel URL → `/login` → "Continue as Guest" → you should land on `/tasks` with a working, empty board. Create a task; refresh; it should persist (confirms Mongo + API + frontend are all wired correctly). Try "Login with Google" once the OAuth client + callback URL are in place.

