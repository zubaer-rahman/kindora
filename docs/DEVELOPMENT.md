# 🛠 Kindora Development Guide

This guide outlines the conventions, architecture, and workflows for developing on the Kindora monorepo.

## 🏗 Architecture Overview

Kindora uses a decoupled, scalable architecture hosted within a `pnpm` monorepo:

### 1. Frontend (`apps/web`)
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4, Radix UI (via `shadcn/ui`)
- **Data Fetching**: `@tanstack/react-query` & Axios
- **Routing**: App Router pattern. Protected routes are isolated in `app/(protected)/[role]/` to handle role-based dashboards.

### 2. Backend (`apps/api`)
- **Framework**: Express.js 5
- **Database**: MongoDB via Mongoose
- **Validation**: Zod
- **Structure**: Modular routes (`src/routes`), controllers (`src/controllers`), and services (`src/services`).

## 🚀 Running Locally

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   Ensure both `.env` files are configured:
   - `apps/web/.env`: Needs `NEXT_PUBLIC_API_URL`, `NEXTAUTH_SECRET`, etc.
   - `apps/api/.env`: Needs `MONGODB_URI`, `NEXTAUTH_SECRET`, `JWT_SECRET`, etc.

3. **Start the Development Server**
   Run the following from the root directory to start both apps concurrently:
   ```bash
   pnpm dev
   ```
   - Web App runs on `http://localhost:3000`
   - API runs on `http://localhost:8000`

## 📋 Coding Conventions

### Styling & Components
- Use `shadcn/ui` components located in `apps/web/components/ui/` instead of building custom raw HTML elements where possible.
- Keep Tailwind classes clean and utilize the predefined design system colors (`primary`, `background`, `foreground`).

### Backend Architecture
- **Controllers**: Handle HTTP req/res objects and error catching using the `catchAsync` wrapper.
- **Services**: Contain the core business logic and database interactions. Keep controllers slim by moving complex logic here.
- **Validators**: Use Zod to define schemas for `req.body` and `req.query`.

### Git Workflow
- Commit messages follow the conventional commit format (e.g., `feat:`, `fix:`, `chore:`).
- Always ensure the project compiles (`pnpm build`) and passes type checks (`pnpm build:server` or `npx tsc --noEmit`) before merging to `main`.
