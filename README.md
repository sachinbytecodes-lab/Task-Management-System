# Pyramid — Task Management System

A full-stack task and project management app, built for the Full Stack Developer (Fresher) technical assessment. It reproduces a Linear/Asana-style workflow tool: guest or Google login, a Tasks board with list/Kanban views, Projects that own their own tasks, a rich task detail page (subtasks, comments, activity log, locking, watchers, resources), and a full theming system.

Monorepo with two independently deployable apps:

- **`frontend/`** — Next.js 15 (App Router), TypeScript, Tailwind CSS
- **`backend/`** — NestJS, TypeScript, MongoDB via Mongoose
- **`docs/`** — Part 2 (AbleSpace product-understanding writeup)

---

## Table of contents

- [Quick start](#quick-start)
- [Feature overview](#feature-overview)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [API reference](#api-reference)
- [Theming system](#theming-system)
- [Authentication](#authentication)
- [Known limitations](#known-limitations--intentional-simplifications)
- [Deploying (live URL + public repo)](#deploying-required-by-the-assessment--live-url--public-repo)
- [Part 2 — Product Understanding](#part-2--product-understanding)

---

## Quick start

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in MongoDB URI, JWT secret, Google OAuth creds
npm run start:dev       # http://localhost:4000
```

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                   # http://localhost:3000
```

Visit `http://localhost:3000` → redirects to `/login` → **Continue as Guest** works immediately with zero configuration.

The frontend degrades gracefully without a backend connection: every page falls back to local mock/demo data so the UI is still fully browsable standalone, with a visible banner noting you're in demo mode. Full persistence, real accounts, and cross-session data require the backend + a MongoDB connection.

See `frontend/README.md` and `backend/README.md` for narrower, implementation-level docs on each half.

---

## Feature overview

### Auth
- **Guest login** — one click, creates a real (but disposable) MongoDB-backed account, no signup form.
- **Google OAuth** — real `passport-google-oauth20` flow (not mocked), issued as an httpOnly JWT cookie.
- **First-time Google onboarding** — Google only gives us an email; the person fills in their own Full Name, Title, and Username on a dedicated `/onboarding` step before entering the app.
- **Per-user data isolation** — every task and project is scoped server-side to an `owner` field tied to the logged-in account. Two different guest sessions never see each other's data.

### Tasks
- **List view** — grouped by status (To Do / Doing / Completed / On Hold), collapsible sections, inline "Add Task."
- **Board (Kanban) view** — drag-and-drop cards between columns (persists the status change), per-column collapse, per-column sort (by priority or due date), and a "Clear column" bulk-delete action.
- **Full creation form** — title, description, status, priority, members, reporter, due date, labels, teams, and an optional parent project — not just a title box.
- **Task detail page** — properties, labels, teams, a Resources section (linked documents), a Subtasks table (each with its own priority/member/due date), threaded comments, and a live-updating **Updates** activity log that's generated automatically server-side whenever a tracked field changes.
- **Task controls**: lock/unlock (blocks edits while locked), watch/unwatch, copy-link share, delete — all backed by real fields, not decorative icons.
- **Fields menu** — toggle which columns are visible (Priority, Members, Due Date, Labels, Status, Reporter) and switch List ⇄ Board.
- **Filter menu** — filter by Status, Priority, Members, Labels, Reporter, or Teams simultaneously.
- **Search** — live filtering by title, with an explicit "Match not found" state.

### Projects
- Same Fields/Filter/Search toolbar as Tasks, applied to the projects list.
- Full creation form (status, priority, members, due date, teams, labels, reporter — matching Tasks).
- A project's detail page is a fully-featured Tasks view scoped to that project (its own Add Task, Fields, Filter, board/list toggle) — tasks created there automatically show up on the global Tasks page too, since a task simply optionally belongs to a project.
- Delete a project from its row menu or from inside the project itself; its tasks are preserved (unlinked, not deleted).

### Theming
- **Light / Dark mode**, plus **6 accent colors** (Amber, Blue, Pink, Rose, Emerald, Black) — applied via CSS custom properties, not hardcoded Tailwind classes, so the whole UI (buttons, active nav state, checkboxes, focus rings) actually reflects the chosen accent.
- Switchable from the sidebar user-menu flyout or from a dedicated `/settings` page; persists across refresh via `localStorage`.

### Settings
- Editable profile (Full Name, Title, Username) with autosave and a visible Saving/Saved/Offline indicator.
- Theme and Color panels.
- Leave Workspace (logs out and clears the session).

### Chrome / navigation
- Collapsible left sidebar (icon-only rail ⇄ full width), state persisted.
- Consistent top bar across Tasks/Projects with Search, Fields, Filter, and primary Add action.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend framework | Next.js 15 (App Router), TypeScript |
| Styling | Tailwind CSS v4, CSS custom properties for theming |
| Icons | lucide-react |
| Backend framework | NestJS, TypeScript |
| Database | MongoDB via Mongoose (ODM) |
| Auth | `@nestjs/passport` + `passport-jwt` (httpOnly cookie sessions) + `passport-google-oauth20` |
| Validation | `class-validator` / `class-transformer` DTOs, global `ValidationPipe` |

This follows the stack specified in the assessment PDF: Next.js (App Router) + Tailwind on the frontend, NestJS + MongoDB + TypeScript on the backend.

---

## Architecture

```
Browser (Next.js, client components)
   │  fetch(..., { credentials: "include" })
   ▼
NestJS API  ──┬── AuthModule (guest / Google OAuth / JWT cookie issuance)
              ├── UsersModule (profile CRUD)
              ├── ProjectsModule (CRUD, owner-scoped)
              └── TasksModule (CRUD, owner-scoped, subtasks/comments/resources
                                as embedded sub-documents, auto-generated
                                activity log)
   │
   ▼
MongoDB (Mongoose schemas: User, Project, Task)
```

- **Auth** is cookie-based (httpOnly JWT), not localStorage tokens, so it isn't readable/stealable from client JS. CORS is locked to a single configured `FRONTEND_URL` with `credentials: true`.
- **Ownership scoping**: every Task/Project query is filtered by the requester's own user id server-side — the frontend never has to (and can't) ask for someone else's data.
- **Resilience over fragility**: the frontend never hard-crashes if the API is unreachable — every data-fetching page catches the failure and falls back to local mock data with a visible "demo mode" indicator, so the UI is always inspectable even mid-deployment or offline.

---

## Project structure

```
pyramid-project/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── login/                 Guest / Google login screen
│       │   ├── onboarding/            First-time Google profile completion
│       │   ├── (app)/                  Authenticated shell (sidebar + pages)
│       │   │   ├── tasks/              List & board views
│       │   │   ├── tasks/[id]/          Task detail
│       │   │   ├── projects/            Projects list
│       │   │   └── projects/[id]/        Project's own task view
│       │   └── settings/               Profile / theme / color
│       ├── components/                Sidebar, TopBar, Kanban board, dropdowns,
│       │                              task/project forms, avatar, etc.
│       ├── context/                   ThemeProvider, AuthProvider, SidebarProvider
│       └── lib/                       Types, mock data (offline fallback), API client
├── backend/
│   └── src/
│       ├── auth/                      Guest login, Google OAuth, JWT strategy/guards
│       ├── users/                     Profile schema, service, controller
│       ├── projects/                  Project schema, DTOs, service, controller
│       └── tasks/                     Task schema (+ Subtask/Comment/Resource/
│                                      UpdateLogEntry sub-schemas), DTOs, service,
│                                      controller
└── docs/
    └── Part-2-Product-Understanding.docx
```

---

## Data model

**User** — `fullName`, `email`, `title`, `username`, `avatarUrl`, `isGuest`, `googleId`, `profileComplete`.

**Project** — `name`, `status`, `priority`, `lead`, `members[]`, `reporter`, `teams[]`, `labels[]`, `dueDate`, `owner`.

**Task** — `title`, `description`, `status`, `priority`, `member`, `reporter`, `dueDate`, `labels[]`, `teams[]`, `project` (optional ref), `owner`, `locked`, `watchers[]`, plus embedded sub-documents:
  - `subtasks[]` — title, priority, member, dueDate
  - `comments[]` — author, text, timestamp
  - `resources[]` — title, url (link references — see [limitations](#known-limitations--intentional-simplifications))
  - `updates[]` — auto-generated activity log entries (user + message + timestamp), written by the service whenever a tracked field actually changes value

---

## API reference

All routes except `/auth/guest` and `/auth/google*` require a valid session (sent automatically as an httpOnly cookie once logged in).

**Auth**

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/guest` | Create a guest account, set session cookie |
| GET | `/auth/google` | Start Google OAuth flow |
| GET | `/auth/google/callback` | Google redirects here; sets cookie, redirects to frontend |
| GET | `/auth/me` | Current identity from the JWT |
| POST | `/auth/logout` | Clear the session cookie |

**Users**

| Method | Path | Purpose |
|---|---|---|
| GET | `/users/me` | Own profile |
| PATCH | `/users/me` | Update fullName / title / username |
| GET | `/users` | List all users (for member/reporter pickers) |

**Projects**

| Method | Path | Purpose |
|---|---|---|
| GET | `/projects` | List own projects |
| POST | `/projects` | Create |
| GET | `/projects/:id` | Read one |
| PATCH | `/projects/:id` | Update |
| DELETE | `/projects/:id` | Delete |

**Tasks**

| Method | Path | Purpose |
|---|---|---|
| GET | `/tasks?project=<id>` | List own tasks, optionally scoped to a project |
| POST | `/tasks` | Create |
| GET | `/tasks/:id` | Read one |
| PATCH | `/tasks/:id` | Update (blocked on locked tasks except unlocking/watching) |
| DELETE | `/tasks/:id` | Delete |
| POST | `/tasks/:id/subtasks` | Add a subtask |
| POST | `/tasks/:id/comments` | Add a comment |
| POST | `/tasks/:id/resources` | Attach a link resource |
| DELETE | `/tasks/:id/resources/:resourceId` | Remove a resource |

All request bodies are validated with `class-validator` DTOs (`whitelist: true` strips unknown fields).

---

## Theming system

Implemented with CSS custom properties (`--bg`, `--text`, `--text-muted`, `--border`, `--accent`, `--accent-fg`) set on `<html data-mode="..." data-accent="...">` and consumed throughout the component tree via inline `style` bindings — this means switching the accent color genuinely re-colors primary buttons, active nav states, checkboxes, and focus rings, not just a couple of hardcoded swatches. Both `mode` (light/dark) and `accent` (6 options) persist to `localStorage` and are restored on load.

---

## Authentication

- **Guest**: `POST /auth/guest` creates a throwaway `User` document and signs a JWT, set as an httpOnly cookie. No password, no email required.
- **Google**: real `passport-google-oauth20` strategy — `GET /auth/google` redirects to Google's real consent screen; `GET /auth/google/callback` exchanges the code, upserts a `User` by `googleId`/`email`, and sets the same cookie format.
- Both paths converge on the same JWT cookie, so the rest of the app doesn't need to know which login method was used.
- First-time Google users get `profileComplete: false` and are redirected to `/onboarding` until they set a name/title/username, since Google alone only reliably gives us an email.

---

## Known limitations & intentional simplifications

Documented honestly rather than silently glossed over:

- **Resources are links, not file uploads.** Attaching a "document" stores a title + URL (e.g. a Google Drive link) in MongoDB. True file upload/storage would need an object store (S3 or similar), which isn't part of this stack.
- **The Eye/"Watch" icon** toggles a real `watchers` array on the task and shows a live count, but there's no notification delivery system (email/push) built on top of it yet — today it functions as a personal tracking marker, not an alerting system.
- **Locking** is a simple boolean gate (blocks field edits, subtasks, and comments while active) — not a granular permissions/roles system.
- **Drag-and-drop is status-only** — reordering within a column isn't persisted (no manual ordering field yet).
- **No automated test suite** — validated via `npm run build` (TypeScript strict checks on both apps) and manual QA against the Figma reference at each step; a follow-up would add Jest/RTL coverage.

---

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

---

## Part 2 — Product Understanding

See `docs/Part-2-Product-Understanding.docx` for the AbleSpace Caseload → Take Data workflow writeup, including UX/functionality observations, built from the screenshot provided in the assignment .
