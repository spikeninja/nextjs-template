# Next.js Starter Kit

An opinionated, batteries-included Next.js starter kit for shipping full-stack apps fast. It bundles authentication, a type-safe API layer, a database with migrations, background jobs, analytics, and a modern UI toolkit — all wired up and ready to go.

## Features

- **Authentication** — email/password auth with email verification, password reset (rate-limited), and one-time codes via [Better Auth](https://www.better-auth.com/).
- **Type-safe API** — [Hono](https://hono.dev/) mounted inside the App Router (`/api/*`) with Zod-validated routes.
- **Database & migrations** — [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/) and Drizzle Kit migrations (auto-run in production).
- **Background jobs** — [BullMQ](https://docs.bullmq.io/) + Redis for queues and workers.
- **Modern UI** — [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) components (Radix + CVA), `lucide-react` icons, dark mode via `next-themes`, and toasts via `sonner`.
- **Data & state** — [TanStack Query](https://tanstack.com/query) for data fetching and [Zustand](https://zustand-demo.pmnd.rs/) for client state.
- **Forms & validation** — [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) with typed, validated env variables.
- **Email** — transactional email via Nodemailer / Resend.
- **Bot protection** — Cloudflare Turnstile captcha support.
- **Analytics** — self-hosted [Umami](https://umami.is/) in the production stack.
- **DX** — TypeScript, ESLint, Prettier, and Husky pre-commit hooks.
- **Containerized** — Docker Compose setups for both development and production.

## Tech Stack

| Area           | Technology                                            |
| -------------- | ----------------------------------------------------- |
| Framework      | Next.js 16 (App Router), React 19                     |
| Language       | TypeScript                                            |
| API            | Hono                                                  |
| Auth           | Better Auth                                           |
| Database / ORM | PostgreSQL + Drizzle ORM                              |
| Queue          | BullMQ + Redis                                        |
| Styling / UI   | Tailwind CSS v4, shadcn/ui, Radix, lucide-react       |
| Data / State   | TanStack Query, Zustand                               |
| Forms          | React Hook Form + Zod                                 |
| Tooling        | Bun, ESLint, Prettier, Husky, Docker                  |

## Prerequisites

- [Bun](https://bun.sh/) installed on your system
- [Docker](https://www.docker.com/) & Docker Compose (for Postgres, Redis, etc.)

## Getting Started (Development)

1. **Configure environment variables**

   ```bash
   cp env.example .env
   ```

   Then adjust the values in `.env` as needed.

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Start the supporting services** (PostgreSQL, Redis)

   ```bash
   docker compose -f compose-dev.yml up --build
   ```

4. **Apply database migrations**

   ```bash
   bun db:migrate
   ```

5. **Start the dev server**

   ```bash
   bun dev
   ```

The app runs at [http://localhost:3000](http://localhost:3000).

To open a `psql` shell against the running dev database:

```bash
bash ./scripts/dev/enter-db.sh
```

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `bun dev`           | Start the Next.js dev server             |
| `bun build`         | Create a production build                |
| `bun start`         | Run the production build                 |
| `bun lint`          | Run ESLint                               |
| `bun format-check`  | Check formatting with Prettier           |
| `bun db:generate`   | Generate a new migration from the schema |
| `bun db:migrate`    | Apply pending migrations                 |

## Production

The production stack is defined in `compose.yml` and includes the app, PostgreSQL, Redis, and Umami analytics. Migrations run automatically on startup in production (see `src/instrumentation.ts`).

1. Create and configure your production `.env` (see `env.example`).
2. Build and start the stack:

   ```bash
   docker compose -f compose.yml up --build -d
   ```

The app is served on port `3001` and Umami on port `3002`. A sample GitHub Actions deploy workflow lives in `.github/workflows/prod.yml`.

To open a `psql` shell against the production database:

```bash
bash ./scripts/prod/enter-db.sh
```

## Project Structure

```
src/
├── app/                 # Next.js App Router (routes, layouts, pages)
│   ├── (auth)/          # Auth pages: login, register, verify, reset password
│   ├── (landing)/       # Public landing page
│   ├── (main)/          # Authenticated app area
│   └── api/[[...route]] # Hono API catch-all handler
├── components/          # UI components, providers, shadcn/ui primitives
├── lib/                 # Auth, security, and shared utilities
├── server/              # Backend logic
│   ├── api/             # Hono route modules
│   ├── db/              # Drizzle schemas & migration runner
│   ├── interactors/     # Use-case / business logic
│   ├── repos/           # Data-access layer
│   └── services/        # Email, sessions, etc.
├── store/               # Zustand stores
├── tasks/               # BullMQ queues, workers, and job processors
└── envs.ts              # Typed, validated environment variables
```

## Conventions

See `check-list.md` for the project's conventions, including:

- Data fetching (GET) via API routes, consumed with TanStack Query.
- Mutations implemented as Server Actions.
- User-facing errors surfaced as toast messages.
- Loaders / skeletons shown while requests are in progress.
