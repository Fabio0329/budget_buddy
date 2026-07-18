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

## Continuous integration and preview deployments

Pull requests targeting `main` run the GitHub Actions quality gates in
`.github/workflows/ci.yml`: dependency installation, Prisma client generation
and schema validation, ESLint, TypeScript checking, and a production Next.js
build. Pushes to `main` run the same validation. Run the complete sequence
locally with:

```bash
npm run ci
```

After the quality gates pass, each non-draft pull request is deployed to the
Vercel Preview environment. Configure a GitHub environment named `preview`
with these secrets before enabling the workflow:

- `VERCEL_TOKEN`: a Vercel access token
- `VERCEL_ORG_ID`: the `orgId` produced by `vercel link`
- `VERCEL_PROJECT_ID`: the `projectId` produced by `vercel link`

Configure `DATABASE_URL`, `DIRECT_URL`, and `AUTH_RATE_LIMIT_SECRET` in the
Vercel project's Preview environment. Leave `APP_URL` unset for previews so
the app uses the deployment-specific `VERCEL_URL`. Preview deployments should
use an isolated non-production database because the app can create and modify
financial records. For security, preview deployment is skipped for pull
requests from forks; their quality gates still run. The custom GitHub Actions
deployment is the preview deployment owner, so disable Vercel's parallel
automatic Git deployments to avoid duplicate previews.

Protect `main` in GitHub and require the `Quality gates` check before merging.
Production deployment and migration automation are reserved for the next
deployment phase.

## Project structure

```text
src/app/      Routes, layouts, and page composition
src/features/ Feature-specific UI, state, actions, and validation
src/shared/   Shared components, types, and utilities
src/server/   Server-only infrastructure, data access, and generated clients
prisma/       Database schema and migration history
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for module-boundary conventions.
