# Budget Buddy

A full-stack personal finance dashboard built with Next.js, PostgreSQL, and
Prisma.

## Local development

Requirements:

- Node.js 20.19 or newer
- A PostgreSQL database, such as a Supabase project

Copy `.env.example` to `.env.local`, then set the application, migration, and
authentication-throttling values:

```env
DATABASE_URL="postgresql://...transaction-pooler..."
DIRECT_URL="postgresql://...session-pooler..."
APP_URL="http://localhost:3000"
AUTH_RATE_LIMIT_SECRET="a-long-random-secret"
```

Create the database schema and generate the Prisma client:

```bash
npm run db:deploy
npm run db:generate
```

Then start the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

New accounts can load a one-time fictional dataset from the empty dashboard to
explore accounts, categories, transactions, budgets, and reporting. The public
health check is available at `/api/health` and returns no database or user data.

## Current MVP scope

The MVP supports self-service authentication, spending accounts, categories,
transactions, monthly budgets, and dashboard reporting. CSV import, savings
goals, and recurring transactions are intentionally disabled for a later phase.

For later schema changes, edit `prisma/schema.prisma` and create a migration:

```bash
npm run db:migrate -- --name describe_the_change
```

Other useful database commands:

```bash
npm run db:validate
npm run db:studio
```

## Project structure

```text
src/app/      Routes, layouts, and page composition
src/features/ Feature-specific UI, state, actions, and validation
src/shared/   Shared components, types, and utilities
src/server/   Server-only infrastructure, data access, and generated clients
prisma/       Database schema and migration history
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for module-boundary conventions.
