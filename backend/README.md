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

### Setting up real Google OAuth (step by step, ~5–10 min)

1. Go to **console.cloud.google.com** → sign in → top-left project dropdown → **New Project** → give it any name (e.g. "Pyramid") → Create → make sure it's selected.
2. Left sidebar → **APIs & Services → OAuth consent screen**.
   - User Type: **External** → Create.
   - Fill in: App name (e.g. "Pyramid"), User support email, Developer contact email → **Save and Continue** through Scopes (leave defaults) and Test users.
   - **Important**: while the app is in "Testing" publishing status, **only emails you explicitly add as Test users can log in** — add your own Google account under **Test users** or you'll get an "access blocked" error when you try to sign in.
3. Left sidebar → **APIs & Services → Credentials** → **+ Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Name: anything (e.g. "Pyramid Web").
   - Under **Authorized redirect URIs**, click **+ Add URI** and add exactly:
     `http://localhost:4000/auth/google/callback`
     (add your deployed API's callback too once you deploy, e.g. `https://your-api.onrender.com/auth/google/callback` — you can have both at once).
   - Click **Create**. A popup shows your **Client ID** and **Client Secret** — copy both.
4. Paste them into `backend/.env`:
   ```
   GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxxxxxxx
   GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback
   ```
5. Restart the backend (`npm run start:dev`) so it picks up the new env vars.
6. **Test it**: with both frontend and backend running, go to `http://localhost:3000/login` → click "Login with Google" → you should land on Google's real account picker/consent screen (not an error page) → after accepting, you're redirected back and land on `/onboarding` (first time) to fill in your name/title/username, then `/tasks`.

**Common errors and what they mean:**
- *"Error 400: redirect_uri_mismatch"* → the `GOOGLE_CALLBACK_URL` in your `.env` doesn't exactly match an Authorized redirect URI in the Google Cloud client (check for trailing slashes, http vs https, port number).
- *"Access blocked: this app's request is invalid"* or *"has not completed the Google verification process"* → your account isn't added as a Test user yet (step 2), or you're trying to log in with an account other than one of the test users.
- Backend logs `missing-client-id` / auth redirects straight to an error → `.env` wasn't loaded — confirm the file is named exactly `.env` (not `.env.example`) and restart the server.

## Auth flow notes
- Guest login creates a fully-formed account immediately (`profileComplete: true`) — no onboarding needed.
- A new Google login intentionally does **not** copy the Google display name — only the verified email is taken from Google. The account is created with `profileComplete: false`, and `GET /auth/google/callback` redirects the browser to `FRONTEND_URL/onboarding` instead of `/tasks` until the user fills in full name (required), title, and username (optional) via `PATCH /users/me`.
- Every task and project is scoped to the `owner` field (the logged-in user's id from the JWT). Different guest sessions and different Google accounts never see each other's tasks/projects.

## API overview

All routes except `/auth/guest` and `/auth/google*` require a valid JWT (sent automatically as an httpOnly cookie once logged in).

- `POST /auth/guest` — creates a guest user, sets auth cookie
- `GET /auth/google` — starts Google OAuth flow (redirect the browser here)
- `GET /auth/google/callback` — Google redirects here; sets auth cookie, redirects to `FRONTEND_URL/onboarding` (new Google account) or `FRONTEND_URL/tasks` (everyone else)
- `GET /auth/me` — minimal identity from the JWT (id + email only)
- `POST /auth/logout` — clears the auth cookie
- `GET /users/me` — full profile (fullName, title, username, profileComplete, avatarUrl)
- `PATCH /users/me` — update fullName / title / username / profileComplete
- `GET /users` — list all users (used to populate member/reporter pickers)
- `GET /projects`, `POST /projects`, `GET /projects/:id`, `PATCH /projects/:id`, `DELETE /projects/:id` — all scoped to the caller; accept `name, status, priority, lead, members[], reporter, teams[], labels[], dueDate`
- `GET /tasks?project=<id>`, `POST /tasks`, `GET /tasks/:id`, `PATCH /tasks/:id`, `DELETE /tasks/:id` — all scoped to the caller; accept `title, description, status, priority, member, reporter, teams[], labels[], dueDate, project`
- `POST /tasks/:id/subtasks`, `POST /tasks/:id/comments`

## Notes
- Validation is enforced globally via `class-validator` DTOs (`whitelist: true` strips unknown fields).
- CORS is locked to `FRONTEND_URL` with `credentials: true` so the cookie-based auth works cross-origin.
- No seed script yet — the database starts empty; create your first project/tasks through the UI or with `curl`/Postman against the endpoints above.
