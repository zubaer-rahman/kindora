<div align="center">
  <img src="public/v1.svg" alt="Kindora Logo" width="120" />

  <h1>Kindora</h1>
  <p><strong>A Modern Platform Connecting Volunteers, Mentors, and Organizations</strong></p>

  <p>
    <a href="#overview">Overview</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#documentation">Documentation</a>
  </p>
</div>

---

## 🌟 Overview

**Kindora** is a comprehensive, full-stack web application designed to bridge the gap between passionate volunteers, experienced mentors, and impactful organizations. It streamlines the recruitment process, manages volunteer rosters, enables seamless messaging, and tracks community opportunities all in one unified ecosystem. 

## ✨ Key Features

- 🏢 **Organization Dashboard**: Manage opportunities, review applications, and organize volunteer rosters.
- 🤝 **Role-Based Profiles**: Dedicated workflows and profiles for Volunteers, Mentors, and Organizations.
- 💬 **Messaging & Notifications**: Stay in sync with integrated communications.
- 📅 **Shift Management**: Advanced scheduling tools for seamless event coordination.
- 📱 **Responsive Design**: Fully responsive, mobile-first experience using Tailwind CSS v4.

## 🛠 Tech Stack

Kindora is a monorepo built with modern, scalable technologies.

**Frontend (`apps/web`):**
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4 + Radix UI (shadcn/ui)
- React Query for data fetching

**Backend (`apps/api`):**
- Express.js 5 REST API
- MongoDB & Mongoose
- Zod for validation

**Tooling & Infrastructure:**
- `pnpm` Workspaces
- NextAuth v4 / JWT Authentication
- Upstash Redis (for cron/caching)

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- [pnpm](https://pnpm.io/installation) (v9+)
- MongoDB instance

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/kindora.git
   cd kindora
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment Setup:**
   You will need to configure environment variables for both the Web and API apps.
   Copy the example files and fill in the required values (like `MONGODB_URI` and `NEXTAUTH_SECRET`).
   
   ```bash
   cp apps/web/.env.example apps/web/.env
   cp apps/api/.env.example apps/api/.env
   ```

4. **Start the Development Servers:**
   From the root of the project, run:
   ```bash
   pnpm dev
   ```
   This command concurrently starts the frontend on `http://localhost:3000` and the backend API on `http://localhost:8000`.

## 📁 Project Structure

```text
kindora/
├── apps/
│   ├── web/        # Next.js Frontend Application
│   └── api/        # Express.js REST API
├── docs/           # Technical documentation and user guides
└── package.json    # Monorepo root configuration
```

## 📄 Documentation

For more detailed information, check out the `docs/` folder:
- [User Guide](./docs/USER_GUIDE.md) - Platform navigation for end-users.
- [Development Guide](./docs/DEVELOPMENT.md) - Deep dive into architecture and conventions.
- [API Integration Guide](./docs/API_INTEGRATION.md) - Workflows for fetching data and building new endpoints.

---
<div align="center">
  <p>Built with ❤️ for the community.</p>
</div>
