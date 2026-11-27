# STRIDEXA

**A modern, collaborative project and task management platform.**

STRIDEXA is a full-stack project management application designed to help teams organize projects, manage tasks, track progress, and collaborate through a structured workspace.

The project is being developed incrementally using a sprint-based workflow, with an emphasis on maintainable architecture, type safety, performance, accessibility, and reliable testing.

---

## Table of Contents

- [Features](#features)
- [Roles and Permissions](#roles-and-permissions)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Features

Planned capabilities (delivered progressively across development sprints):

- **Workspace management**: Personal and team workspaces, with workspace switching.
- **Project management**: Organize work into projects with short keys (e.g. `WEB`) and archive finished ones.
- **Task management**: Create, assign, prioritize, and track tasks with auto-numbered IDs (e.g. `WEB-12`).
- **Kanban board**: Accessible drag-and-drop board with keyboard support and undo after a move.
- **List and calendar views**: Sortable list view and a calendar of due dates.
- **Collaboration**: Comments (edit and delete), assignees, reviewers, and labels.
- **Notifications**: An inbox for assignments, review requests, and comments.
- **Dashboard and insights**: Progress, overdue tasks, workload, and charts.
- **Activity history**: A filterable, paginated workspace activity log.
- **Search and filters**: Filter by text, priority, assignee, label, or "needs triage".
- **Command palette**: Navigate and perform actions quickly with `Ctrl/⌘ + K`.
- **Keyboard shortcuts**: Fast navigation and task creation without the mouse.
- **Shareable task links**: Open a specific task directly via URL.
- **CSV export**: Spreadsheet-safe export of tasks.
- **Light and dark themes**: Follows the operating system preference.

---

## Roles and Permissions

| Role             | Key                | Capabilities                                                                  |
| :--------------- | :----------------- | :---------------------------------------------------------------------------- |
| **Admin**        | `org:admin`        | Full access: create and archive projects, assign anyone, delete any task      |
| **Project Lead** | `org:project_lead` | Create projects, assign anyone, choose reviewers, delete tasks and comments   |
| **Member**       | `org:member`       | Create, edit, move, and comment on tasks; can only assign tasks to themselves |
| **Viewer**       | `org:viewer`       | Read-only access                                                              |

Unknown roles are treated as **Viewer** (least privilege). Permissions are enforced on the server and mirrored in the UI.

---

## Technology Stack

| Area                   | Technology              |
| :--------------------- | :---------------------- |
| **Framework**          | Next.js (App Router)    |
| **Language**           | TypeScript              |
| **UI**                 | React                   |
| **Styling**            | Tailwind CSS            |
| **Authentication**     | Clerk                   |
| **Database**           | PostgreSQL              |
| **ORM**                | Prisma                  |
| **Server State**       | TanStack Query          |
| **Client State**       | Zustand                 |
| **Drag and Drop**      | dnd-kit                 |
| **Validation**         | Zod                     |
| **Command Palette**    | cmdk                    |
| **Charts**             | Recharts                |
| **Notifications**      | Sonner                  |
| **Unit Testing**       | Vitest, Testing Library |
| **End-to-End Testing** | Playwright, axe         |
| **CI/CD**              | GitHub Actions          |

---

## Prerequisites

Install the following before starting:

- **Node.js** 22 or later
- **npm**
- **Git**
- **Docker Desktop** or **Docker Engine**
- A **Clerk** account for authentication configuration

---

## Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd stridexa
```

### 2. Install dependencies

```bash
npm install
```

This also runs `prisma generate` through the `postinstall` script.

### 3. Start PostgreSQL with Docker

```bash
docker run -d --name stridexa-db \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=pass \
  -e POSTGRES_DB=stridexa \
  postgres:17
```

Your connection string will be:

```
postgresql://postgres:pass@localhost:5432/stridexa
```

### 4. Configure Clerk

1. Create an application in the [Clerk dashboard](https://clerk.com).
2. Enable **Organizations** (these act as team workspaces).
3. Allow **personal accounts** so new users land in a personal workspace instead of being forced to create an organization.
4. (Optional) Create two custom roles: `project_lead` and `viewer`.
5. Copy the **Publishable key** and **Secret key** from **API keys**.

### 5. Set up environment variables

```bash
cp .env.example .env
```

Fill in `.env` (see [Environment Variables](#environment-variables)). Never commit this file.

### 6. Run database migrations

```bash
npm run db:migrate -- --name init
```

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 8. (Optional) Load demo data

Add your Clerk user ID (and organization ID, if using a team workspace) to `.env`:

```ini
SEED_CLERK_ORG_ID=org_...
SEED_CLERK_USER_ID=user_...
```

In a personal workspace, use your user ID for both values. Then run:

```bash
npm run db:seed
```

---

## Available Scripts

| Script                | Description                                  |
| :-------------------- | :------------------------------------------- |
| `npm run dev`         | Start the development server                 |
| `npm run build`       | Create a production build                    |
| `npm start`           | Run the production build                     |
| `npm run lint`        | Run ESLint                                   |
| `npm run typecheck`   | Run the TypeScript compiler without emitting |
| `npm test`            | Run unit tests with Vitest                   |
| `npx playwright test` | Run end-to-end tests                         |
| `npm run db:migrate`  | Create and apply a development migration     |
| `npm run db:deploy`   | Apply pending migrations in production       |
| `npm run db:seed`     | Load demo data                               |

---

## Environment Variables

| Variable                                          | Purpose                       | Notes                                        |
| :------------------------------------------------ | :---------------------------- | :------------------------------------------- |
| `DATABASE_URL`                                    | PostgreSQL connection string  | Server only                                  |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`               | Clerk key used in the browser | Safe to expose                               |
| `CLERK_SECRET_KEY`                                | Clerk key used on the server  | **Secret.** Never prefix with `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`                   | Sign-in route                 |                                              |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`                   | Sign-up route                 |                                              |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Redirect after sign-up        | Use `/dashboard`                             |
| `SEED_CLERK_ORG_ID`, `SEED_CLERK_USER_ID`         | Demo data seeding             | Used by `prisma/seed.ts` only                |

For hosted databases such as Neon or Supabase, append `?sslmode=require` to `DATABASE_URL`.

---

## Project Structure

```
stridexa/
├── prisma/
│   ├── schema.prisma        # Data model
│   ├── migrations/          # Database history (commit this)
│   └── seed.ts              # Demo data
├── src/
│   ├── app/                 # Routes, layouts, and pages (App Router)
│   ├── features/            # Feature modules (board, tasks, projects, labels, ...)
│   ├── lib/                 # Auth, database, permissions, filters, utilities
│   ├── components/          # Shared UI components and providers
│   ├── stores/              # Zustand stores
│   ├── generated/prisma/    # Generated Prisma client (git-ignored)
│   └── proxy.ts             # Route protection
├── tests/
│   ├── unit/                # Vitest unit tests
│   └── e2e/                 # Playwright tests
├── .github/workflows/       # CI pipeline
└── prisma.config.ts         # Prisma configuration
```

---

## Architecture Overview

- **Server-first rendering**: Pages are Server Components that load data on the server; interactive parts are Client Components.
- **Server Actions**: Every write goes through a validated, workspace-scoped Server Action.
- **Single authorization entry point**: `requireWorkspace()` identifies the user, workspace, and role for every page and action.
- **Workspace isolation**: Every database query is scoped by workspace, so teams cannot access each other's data.
- **Optimistic UI**: Changes (such as moving a card) appear instantly and roll back if the server rejects them.
- **Fractional indexing**: Card order is stored as sortable string keys, so a move updates only one row.
- **Transactional activity**: Changes, activity entries, and notifications are written in one database transaction.
- **Centralized permissions**: Role rules live in one file of pure functions shared by the server and the UI.
- **Validation everywhere**: Zod validates all input on the server.

---

## Testing

```bash
npm test               # Unit tests
npm run lint           # Linting
npm run typecheck      # Type checking
```

End-to-end tests use Playwright:

```bash
npx playwright install chromium
npx playwright test smoke
```

Signed-in end-to-end tests need a saved login session:

```bash
npx playwright codegen --save-storage=tests/e2e/.auth.json http://localhost:3000
E2E_STORAGE_STATE=tests/e2e/.auth.json E2E_PROJECT_KEY=WEB npx playwright test board
```

GitHub Actions runs linting, type checking, unit tests, the build, and smoke tests on every push.

---

## Deployment

STRIDEXA is designed to deploy on [Vercel](https://vercel.com).

1. Push the repository to GitHub.
2. Create a production PostgreSQL database (for example, on Neon).
3. Apply migrations to it:
   ```bash
   DATABASE_URL="<production-url>" npm run db:deploy
   ```
4. Import the repository in Vercel.
5. Add the environment variables listed above in the Vercel project settings.
6. Deploy. `prisma generate` runs automatically during the build.
7. In Clerk, use a production instance (or add your Vercel domain) with the `pk_live_` and `sk_live_` keys, and enable Organizations there too.

Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` as GitHub repository secrets so CI can run.

---

## Troubleshooting

| Symptom                                          | Fix                                                                                    |
| :----------------------------------------------- | :------------------------------------------------------------------------------------- |
| `Cannot find module '@/generated/prisma/client'` | Run `npx prisma generate`                                                              |
| Database connection or SSL errors                | Check `DATABASE_URL`; add `?sslmode=require` for hosted databases                      |
| `Missing publishableKey` or Clerk errors         | Check `.env` and restart `npm run dev`                                                 |
| New users are asked to create an organization    | Allow personal accounts in Clerk's Organization settings                               |
| "New project" button is missing                  | Only Admins and Project Leads can create projects                                      |
| Everyone is a Viewer                             | Clerk role keys must be `org:admin`, `org:project_lead`, `org:member`, or `org:viewer` |
| Port 3000 is in use                              | Run `npm run dev -- -p 3001`                                                           |
| Need a clean development database                | Run `npx prisma migrate reset` (deletes all data)                                      |

---

## Roadmap

- Real-time updates and presence
- Accept or decline assignments
- Subtasks and checklists
- Sprints with burndown charts
- Drag-to-reschedule on the calendar
- Bulk actions
- Label rename and delete
- @mentions in comments
- Email notifications
- Auto-assignment rules

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and add tests where relevant.
3. Run `npm run lint`, `npm run typecheck`, and `npm test`.
4. Commit with a clear message and open a pull request.
