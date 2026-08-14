# AGENTS.md

Kindora: volunteer/mentor matching platform. pnpm monorepo with `apps/web` (Next.js 16, React 19) and `apps/api` (Express 5 REST API). API served at `/api/v1` on :8000; health check at `/health`.

## Commands

- `pnpm dev` — runs web (:3000) + API (:8000) in parallel via root `package.json` (`pnpm -r --parallel run dev`)
- `pnpm build` / `pnpm start` — builds/starts both apps. API `build` = `tsc` (emits `dist/`), `start` = `node dist/index.js`
- **Typecheck per-app, not from root.** Root `npx tsc --noEmit` FAILS (root `tsconfig.json` is `strict` and globs everything; ~1000 errors). Use `npx tsc --noEmit` inside `apps/web` or `apps/api` — both pass. (No `build:server` script exists; don't invent one.)
- **Lint is broken** — `pnpm lint` calls `next lint` (removed in Next 16) and the ESLint 9 `FlatCompat` config crashes. Skip both.
- No test framework exists.

## Architecture

- **Web (`apps/web`)** is the whole frontend. Protected routes live under `app/(protected)/[role]/` (dynamic segment: `dashboard/`, `messages/`, `profile/`, `settings/`) plus role-specific folders (`volunteer/`, `mentor/`, `organisation/`, `find-opportunity`, etc.). `[role]/dashboard/page.tsx` switches per role.
- **API (`apps/api`)** is a standalone Express 5 app. Routers in `src/routes/`, controllers in `src/controllers/`, Mongoose models in `src/db/models/`, Zod validators in `src/validators/`, business logic in `src/services/`.
- **Auth:** web uses NextAuth v4 (`apps/web/auth/`) with a Credentials provider that calls the REST `/auth/login` and stores the returned JWT as `session.user.api_token`. The API is pure JWT — `src/middleware/auth.ts` verifies a Bearer token signed with `JWT_SECRET || NEXTAUTH_SECRET` (7d expiry). **No mobile-token or refresh-token flow exists** despite `REFRESH_TOKEN_SECRET` being in env — that var is unused. Google OAuth is temporarily disabled (`auth/options.ts` rejects it).
- **System admin:** served through `[role]/dashboard` with role `system-admin` (there is **no** separate `app/(protected)/system-admin/` directory). Must have role `system_admin` AND email ending `.kindora.com`; enforced in `components/features/system-admin/SystemAdminShell.tsx` and `controllers/system-admin.controller.ts` (`isSystemAdmin`). `ProtectedLayout` redirects profile-less users to `/signup?role=...`; login/proxy redirect system admins to `/system-admin/dashboard`.
- **Route protection** is done in `apps/web/proxy.ts` (Next 16's `middleware` — note the filename, not `middleware.ts`). It handles role prefixes, redirects `/organization/*` → `/organisation/*`, and `organization`/`admin` → `organisation` normalization.
- **Data fetching:** client components use `@tanstack/react-query` with `useAxiosAuth` hook (`hooks/useAxiosAuth.ts`) that attaches `Bearer ${session.user.api_token}`.
- **Realtime messaging:** SSE endpoints (`src/routes/sse.routes.ts`) + `src/services/message-pubsub.service.ts`, which uses in-memory pub/sub with an Upstash Redis backup (`src/lib/redis.ts`) for cross-instance sync.
- **Cron:** `src/jobs/init-cron.ts` runs at API startup unless `NODE_ENV=test` but is currently a **no-op** (no jobs configured; `node-cron` is unused despite being a dependency).
- **Seeds:** `apps/api/scripts/seed-system-admin.ts` and `seed-guests.ts`. Run via `pnpm --filter api exec tsx scripts/seed-system-admin.ts` (uses `SYSTEM_ADMIN_EMAIL/PASSWORD/NAME`; email must end `.kindora.com`). There is no ts-node, only tsx.

## Env & setup gotchas

- Each app has its own `.env` (`apps/web/.env`, `apps/api/.env`); both are gitignored (`\.env*` except `.env.example`). The root `.env.local` is Vercel CLI's — leave it alone.
- `apps/web` needs: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_API_URL`, optional `GOOGLE_*`.
- `apps/api` needs: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `JWT_SECRET`, `CLOUDINARY_*`, `SMTP_HOST/PORT/USER/PASSWORD`, `UPSTASH_REDIS_REST_URL/TOKEN`, `ALLOWED_ORIGINS`, optional `GOOGLE_*`, `SYSTEM_ADMIN_*`, `ENABLE_MESSAGE_NOTIFICATIONS`.
- Path aliases: in web, `@/*` → `apps/web/*` and `@/server/*` → `apps/api/src/*` (so web imports API validators/models directly).
- `next.config.ts` sets `turbopack.root` to `../../` because web lives in a monorepo subdirectory.
- **Do not edit `apps/web/AGENTS.md`.** It is auto-generated/re-added by `next dev` (Next.js 16 agent rules pointing at `node_modules/next/dist/docs/`). Commit it unchanged to keep the tree clean.

## Conventions

- Commit messages use conventional style (`feat:`, `chore:`); work is committed to `main` on `origin` (github.com/zubaer-rahman/kindora).
- Components: shadcn/ui (new-york) in `components/ui`; per-role shells, dashboards, and feature components live in `components/features/{domain}/` (e.g. `system-admin/`, `organization/`, `messages/`). `components/layout/` only holds `ProtectedLayout`, `PublicLayout`, and `auth/`; `components/features/auth/` holds signup pieces. Hooks in `hooks/`. Note: the repo is mid-refactor on branch `clean_code` — old paths under `components/layout/{domain}/` no longer exist, use `components/features/`.
- Role strings in API enum (`src/db/interfaces/user.ts`): `volunteer`, `mentor`, `organization`, `admin`, `system_admin`. **Web normalizes** `organization`/`admin` → `organisation` for routes, and `system_admin` → `system-admin`. Match whichever layer you're in.
- No comment-bloated code; match existing style. `src/controllers/*.controller.ts` + `src/routes/*.routes.ts` with Zod validators is the canonical API pattern.
