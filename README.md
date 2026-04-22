<div align="center">
  <img src="public/v1.svg" alt="Kindora Logo" width="120" />

  <h1>Kindora</h1>
  <p><strong>A Modern Platform Connecting Volunteers, Mentors, and Organizations</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#project-structure">Project Structure</a>
  </p>
</div>

---

## 🌟 Overview

**Kindora** is a comprehensive, full-stack web application designed to bridge the gap between passionate volunteers and impactful organizations. It streamlines the recruitment process, manages volunteer rosters, enables seamless messaging, and tracks community opportunities all in one unified ecosystem. 

Whether you're an organization looking for dedicated mentors or a volunteer seeking meaningful shifts, Kindora provides the tools needed to make an impact.

## ✨ Features

- 🏢 **Organization Dashboard**: Manage opportunities, review applications, and organize volunteer rosters.
- 🤝 **Volunteer & Mentor Profiles**: Highlight skills, track completed opportunities, and set availability.
- 💬 **Real-time Messaging & Notifications**: Integrated chat system and push notifications to keep everyone in sync.
- 📅 **Shift & Roster Management**: Advanced scheduling tools for seamless event coordination.
- 🔍 **Advanced Search & Discovery**: Quickly find relevant roles, organizations, and volunteers.
- 📱 **Mobile-First Experience**: Fully responsive design for seamless use on any device.

## 🛠 Tech Stack

**Frontend:**
- [Next.js (App Router)](https://nextjs.org/)
- React 19
- Tailwind CSS (v4)
- Radix UI & Lucide Icons
- Framer Motion

**Backend & Data:**
- tRPC for type-safe API endpoints
- MongoDB & Mongoose
- Supabase (Storage & Real-time features)
- NextAuth.js (Authentication)

**Infrastructure:**
- Vercel (Deployment)
- Upstash Redis

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- Node.js (v18+)
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
   Create a `.env` file in the root directory and add the necessary environment variables (refer to `.env.example` if available).
   ```env
   DATABASE_URL=mongodb+srv://...
   NEXTAUTH_SECRET=your-secret
   # Add your Supabase, Cloudinary, and other keys here
   ```

4. **Run the development server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```text
kindora/
├── app/            # Next.js App Router (Pages & Layouts)
├── auth/           # NextAuth configuration and providers
├── components/     # Reusable UI components & Layouts
├── docs/           # Technical documentation and user guides
├── hooks/          # Custom React hooks
├── server/         # Backend: tRPC routers, Mongoose models & Services
├── supabase/       # Supabase configurations and migrations
├── types/          # TypeScript definitions
└── utils/          # Helper functions and constants
```

## 📄 Documentation

For more detailed information about the platform's usage, check out the `docs/` folder:
- [User Guide (Volunteers & Organizations)](./docs/user-guide/00_INDEX.md)
- [Mobile Setup](./docs/MOBILE_SETUP.md)

---
<div align="center">
  <p>Built with ❤️ for the community.</p>
</div>
