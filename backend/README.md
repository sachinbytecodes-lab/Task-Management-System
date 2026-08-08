# Pyramid API (NestJS + MongoDB)

Backend for the Pyramid task management app. TypeScript, NestJS, MongoDB via Mongoose, JWT (cookie-based) auth with guest login and real Google OAuth.

## Setup

```bash
npm install
cp .env.example .env
# fill in .env — see below
npm run start:dev
```

Runs on `http://localhost:4000` by default.

## Environment variables (`.env`)

| Variable | What it is | Where to get it |
|---|---|---|
| `MONGODB_URI` | Mongo connection string | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → free cluster → "Connect" → "Drivers" |
| `JWT_SECRET` | Any long random string | Generate with `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Real Google OAuth credentials | Google Cloud Console → APIs & Services → Credentials → "OAuth client ID" (type: Web application) |
| `GOOGLE_CALLBACK_URL` | Must exactly match an "Authorized redirect URI" in that Google client | e.g. `http://localhost:4000/auth/google/callback` locally, or `https://your-api.onrender.com/auth/google/callback` in production |
| `FRONTEND_URL` | Used for CORS + post-login redirect | e.g. `http://localhost:3000` or your deployed frontend URL |

### Setting up Google OAuth (5 min)
1. Go to console.cloud.google.com → create/select a project.
2. **APIs & Services → OAuth consent screen** → External → fill app name/email → save.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → type "Web application".
4. Under **Authorized redirect URIs**, add: `http://localhost:4000/auth/google/callback` (and your deployed API's callback URL once deployed).
5. Copy the generated Client ID and Client Secret into `.env`.

## API overview

All routes except `/auth/guest` and `/auth/google*` require a valid JWT (sent automatically as an httpOnly cookie once logged in).

- `POST /auth/guest` — creates a guest user, sets auth cookie
- `GET /auth/google` — starts Google OAuth flow (redirect the browser here)
- `GET /auth/google/callback` — Google redirects here; sets auth cookie, redirects to `FRONTEND_URL/tasks`
- `GET /auth/me` — current identity from the JWT
- `POST /auth/logout` — clears the auth cookie
- `GET /users/me` / `PATCH /users/me` — read/update the logged-in user's profile
- `GET /projects`, `POST /projects`, `GET /projects/:id`, `PATCH /projects/:id`, `DELETE /projects/:id`
- `GET /tasks?project=<id>`, `POST /tasks`, `GET /tasks/:id`, `PATCH /tasks/:id`, `DELETE /tasks/:id`
- `POST /tasks/:id/subtasks`, `POST /tasks/:id/comments`

## Notes
- Validation is enforced globally via `class-validator` DTOs (`whitelist: true` strips unknown fields).
- CORS is locked to `FRONTEND_URL` with `credentials: true` so the cookie-based auth works cross-origin.
- No seed script yet — the database starts empty; create your first project/tasks through the UI or with `curl`/Postman against the endpoints above.
