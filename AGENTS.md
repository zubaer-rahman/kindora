# AGENTS.md

Kindora: volunteer/mentor matching platform. pnpm monorepo with `apps/web` (Next.js 16, React 19) and `apps/api` (Express 5 REST API).

## Commands

- `pnpm dev` — runs web (:3000) + API (:8000) in parallel via root `package.json`
- `pnpm build` / `pnpm start` — builds/starts both apps
- `pnpm build:server` — `tsc --project server/tsconfig.json` (backend-only typecheck)
- Typecheck: `npx tsc --noEmit` — currently passes. **No test framework exists.**
- **Lint is broken** — `pnpm lint` calls `next lint` (removed in Next 16). `npx eslint .` crashes (ESLint 9 FlatCompat circular JSON). Skip both.

## Architecture

- **Web (`apps/web`)** is the whole frontend. Role-based protected routes live under `app/(protected)/[role]/` (dynamic segment) and `app/(protected)/system-admin/` (separate route). Each role folder has `dashboard/`, `messages/`, `profile/`, `settings/` subpages.
- **API (`apps/api`)** is a standalone Express 5 app. Routers in `src/routes/`, controllers in `src/controllers/`, Mongoose models in `src/db/models/`. Served at `/api/v1`.
- **Auth is dual.** Web uses NextAuth v4 (`auth/`), mobile uses JWT (`server/modules/auth/mobile-token.ts`: 1h access + 30d refresh). `server/config/context.ts` resolves the user from NextAuth session first, else `Authorization: Bearer`.
- **Role routing pattern:** `app/(protected)/[role]/dashboard/page.tsx` reads `params.role` and switches between `<OrganisationDashboard />`, `<SystemAdminDashboard />`, etc. `ProtectedLayout` (`components/layout/ProtectedLayout.tsx`) redirects users without a profile to `/signup?role=...`, except `system_admin` who is redirected straight to `/system-admin/dashboard`.
- **System admin is special:** must have role `system_admin` AND email ending `.kindora.com`. Enforced client-side in `SystemAdminShell` (`components/layout/system-admin/SystemAdminShell.tsx`) and server-side in `controllers/system-admin.controller.ts` (`isSystemAdmin` helper). Separate layout with sidebar but no footer.
- **Data fetching:** client components use `@tanstack/react-query` with `useAxiosAuth` hook (`hooks/useAxiosAuth.ts`) that attaches the NextAuth session's `api_token` as a Bearer header.
- **Cron jobs** (`services/init-cron.ts`) initialize at API import time unless `NODE_ENV=test`. Uses node-cron + Upstash Redis.

## Env & setup gotchas

- Each app has its own `.env`: `apps/web/.env` and `apps/api/.env`. Both are gitignored; examples in `apps/web/.env.example` and `apps/api/.env.example`.
- `apps/web` needs: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_API_URL`, optional `GOOGLE_*`.
- `apps/api` needs: `MONGODB_URI`, `NEXTAUTH_SECRET`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `CLOUDINARY_*`, `SMTP_*`, `UPSTASH_REDIS_REST_*`, `ALLOWED_ORIGINS`.
- Path aliases: `@/*` maps to `apps/web/*`, `@/server/*` maps to `apps/api/src/*`.
- `next.config.ts` sets `turbopack.root` to `../../` because the web app lives in a monorepo subdirectory.

## Conventions

- Commit messages use conventional style (`feat:`, `chore:`); work is committed to `main` on `origin` (github.com/zubaer-rahman/kindora).
- Components: shadcn/ui (new-york) in `components/ui`; domain layouts in `components/layout/` (per-role shells + dashboards). Hooks in `hooks/`.
- Role strings in code: `volunteer`, `mentor`, `organisation` (note: also aliased as `organization`/`admin` in some places), `system_admin`.
- No comment-bloated code; match existing style. `server/modules/auth/index.ts` is the canonical router pattern for the API.
