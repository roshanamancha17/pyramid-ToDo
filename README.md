# Pyramid — Task Management System

Full Stack Developer (Fresher) technical assessment submission.

**Stack:** Next.js 14 (App Router) + Tailwind · NestJS + Prisma + PostgreSQL · TypeScript throughout.

## Project structure

```
pyramid/
├── backend/     NestJS API (auth, tasks, projects, users, labels)
├── frontend/    Next.js app (login, board/list views, task detail, settings)
└── docker-compose.yml   local PostgreSQL for development
```

## Part 1 — Running locally

### 1. Database
```bash
docker compose up -d          # starts Postgres on localhost:5432
```
(No Docker? Point `DATABASE_URL` at any Postgres instance instead — Railway, Supabase, Neon, etc.)

### 2. Backend
```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL, JWT_SECRET, Google OAuth creds
npm install
npx prisma migrate dev --name init
npm run prisma:seed           # seeds default labels
npm run start:dev             # http://localhost:3001/api
```

### 3. Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

Open http://localhost:3000 — you'll land on the login screen. **Continue as Guest** works immediately with no setup. Google login requires OAuth credentials (see below).

### Google OAuth setup (optional, for "Login with Google")
1. Create an OAuth 2.0 Client ID in the Google Cloud Console.
2. Authorized redirect URI: `http://localhost:3001/api/auth/google/callback` (update for your deployed backend URL too).
3. Put the client ID/secret in `backend/.env`.

## Architecture notes

- **Auth**: JWT stored in an httpOnly cookie, issued on guest signup or Google OAuth callback. `JwtAuthGuard` protects all API routes except the auth endpoints themselves.
- **Theme system**: Light/Dark + 6 accent colors (Amber, Blue, Pink, Rose, Emerald, Black) are implemented as CSS custom properties toggled via `data-theme` / `data-color` attributes on `<html>`, consumed through Tailwind's `rgb(var(--x) / <alpha-value>)` pattern. Preference is persisted to the user's profile in the DB (and mirrored to `localStorage` pre-login) so it survives refreshes across devices.
- **Board & List views** read from the same `GET /api/tasks` endpoint and simply group the flat task list by `status` client-side — this keeps the two views trivially in sync.
- **Guest login** creates a throwaway `User` row (`isGuest: true`, a generated `guest-xxxx@guest.pyramid.local` email) so graders can try the app with zero setup.
- **Activity log**: status/priority changes on a task are automatically recorded and rendered in the task detail sidebar's "Updates" feed.

## Known deviations from the Figma design

_(fill this in as you polish pixel-level details — spacing, exact colors, icon set, animations, etc. Documenting intentional deviations here is explicitly part of the grading criteria.)_

- Example: "Used Lucide icons instead of the custom icon set shown in Figma, as the originals weren't exported."

## Deployment

- **Frontend → Vercel**: import the repo, set root directory to `frontend`, add `NEXT_PUBLIC_API_URL` pointing at your deployed backend.
- **Backend → Railway/Render**: deploy `backend` as a Node service, attach a managed Postgres addon, set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and Google OAuth env vars. Run `npx prisma migrate deploy` as a release/build step.

## Part 2 — Product Understanding (AbleSpace Take Data / Caseload)

See `PART2_PRODUCT_WALKTHROUGH.md` (or the submitted video) — not included in this scaffold since it requires live access to the AbleSpace product.
