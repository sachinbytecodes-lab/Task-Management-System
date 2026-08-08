# Pyramid — Task Management System (Frontend)

Frontend implementation for the Full Stack Developer assessment, built with Next.js (App Router), TypeScript, and Tailwind CSS. This covers **Part 1's frontend layer**, matching the provided reference screens: guest & Google login, Tasks (list + board views), Projects, task detail, and theme/color settings.

## Stack
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- lucide-react for icons
- No backend yet — data is mocked in `src/lib/mock-data.ts`, and auth/theme state is persisted to `localStorage` so the app is fully interactive. A NestJS + MongoDB API layer is the next milestone (see "Next steps").

## Getting started
```bash
npm install
npm run dev
```
Visit `http://localhost:3000`. You'll land on `/login`.

## Structure
```
src/
  app/
    login/              Guest / Google login screen
    (app)/               Authenticated shell (sidebar + pages)
      tasks/              List & board views, grouped by status
      tasks/[id]/          Task detail (properties, subtasks, comments, side panel)
      projects/            Projects list
      projects/[id]/        Project's tasks
    settings/             Full-page profile / theme / color settings
  components/            Reusable UI: Sidebar, TopBar, dropdowns, cards, avatar, etc.
  context/               ThemeProvider (light/dark + 6 accent colors) and AuthProvider (guest/Google mock)
  lib/                   Types + mock data
```

## Features implemented
- **Guest login / "Login with Google" (mocked)** — persisted in `localStorage`, redirects unauthenticated users back to `/login`.
- **Tasks — List view**: grouped by status (To Do / Doing / Completed / On Hold), collapsible sections, inline "Add Task".
- **Tasks — Board view**: Kanban columns with cards (drag reordering not wired up yet), due-date and label chips.
- **Fields menu**: toggle List/Board and which columns are visible (Priority, Members, Due Date, Labels, Status, Reporter).
- **Filter menu**: nested category → Priority submenu, live-filters the task list.
- **Search**: inline search box that filters by title.
- **Task detail page**: properties, labels, subtasks table, comments/replies, and a right-hand Details panel with an editable priority dropdown and a date-range picker.
- **Projects**: list of projects with priority/lead/due date; clicking a project opens its tasks with a breadcrumb (`Projects > <name>`).
- **Theme system**: Light/Dark mode **and** 6 accent colors (Amber, Blue, Pink, Rose, Emerald, Black), accessible from the sidebar user menu (nested flyout) and from the dedicated `/settings` page. Both selections persist across refresh via `localStorage` and are applied through CSS custom properties (`--bg`, `--text`, `--accent`, etc.).
- **Settings page**: Profile (name/title/username, avatar, email), Theme, Color, and "Leave Workspace" action.
- **Responsive**: layout reflows down to tablet/mobile widths.

## Known deviations from the design (documented per assignment instructions)
- Login/Google OAuth is mocked client-side (no real OAuth) since no auth provider/backend was specified for this stage.
- Drag-and-drop reordering on the Kanban board is not implemented — cards open the task detail on click, but don't reorder yet.
- The date-range picker in the task detail panel is a static month view for visual fidelity; wiring it to real date state is a follow-up.
- "Add Task" / "Add Project" open a lightweight modal with a title field only, rather than the full creation flow, to keep the mocked-data model simple until the API lands.

## Next steps (backend)
- NestJS API (MongoDB via Mongoose) with modules for Auth (guest + Google OAuth), Tasks, Projects, Members, Comments.
- Replace `src/lib/mock-data.ts` reads with real API calls.
- Wire drag-and-drop status updates (`PATCH /tasks/:id`) and priority/date edits to the API.
