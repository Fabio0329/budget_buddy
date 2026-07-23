# Budget Buddy (WIP)

Budget Buddy is a full-stack personal finance application for tracking
accounts, transactions, spending categories, monthly budgets, and cash flow.
It combines a protected financial dashboard with a public, read-only demo that
can be explored without creating an account.

The application is built with the Next.js App Router, React, PostgreSQL, and
Prisma. Product code is colocated with the route that owns it, while reusable
UI and server infrastructure remain in dedicated shared modules.

## Features

### Personal finance management

- Create and manage cash, checking, savings, credit-card, investment, and
  other financial accounts.
- Track current and starting balances in integer cents.
- Create income, expense, and transfer transactions.
- Search, filter, sort, edit, and delete transaction activity.
- Organize income and expenses with color- and icon-based categories.
- Create category budgets for individual calendar months.
- Review budget limits, spending, remaining amounts, and status indicators.
- Keep account balances synchronized when transactions are created, edited, or
  removed.

### Dashboard reporting

- Monthly income, expenses, net cash flow, and remaining budget.
- Total balance across accounts.
- Spending by category.
- Daily spending trends.
- Three-month income and expense comparison.
- Recent transaction activity.
- Budget progress for the selected month.
- Month switching based on available financial data.

### Authentication and onboarding

- Self-service signup, login, and logout.
- Database-backed sessions stored in secure, HTTP-only cookies.
- Password hashing using Node.js `scrypt`.
- Login and signup throttling by email address and client IP.
- Safe redirect handling after authentication.
- One-time fictional sample data for new, empty accounts.
- A public, read-only product demo at `/demo`.

## MVP boundaries

The current schema and persisted workflows cover authentication, accounts,
categories, transactions, budgets, and dashboard reporting.

CSV import, recurring transactions, and savings goals are reserved for a later
phase. The `/transactions/import` route currently returns a not-found response
instead of exposing an incomplete workflow.

## Technology

| Area | Technology |
| --- | --- |
| Application | Next.js 16 App Router |
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Database | PostgreSQL |
| Data access | Prisma 7 with the PostgreSQL driver adapter |
| Authentication | Database sessions, HTTP-only cookies, `scrypt` password hashing |
| Validation | TypeScript and route-colocated form validation |
| CI/CD | GitHub Actions and Vercel preview deployments |

## Application routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Product overview and entry point |
| `/demo` | Public | Interactive, read-only dashboard with fictional data |
| `/login` | Public | Account login |
| `/signup` | Public | Account registration |
| `/dashboard` | Authenticated | Monthly financial overview |
| `/accounts` | Authenticated | Account and balance management |
| `/categories` | Authenticated | Income and expense category management |
| `/transactions` | Authenticated | Transaction search, filtering, and management |
| `/transactions/new` | Authenticated | Transaction creation |
| `/transactions/[id]/edit` | Authenticated | Transaction editing |
| `/budgets` | Authenticated | Monthly budget overview |
| `/budgets/new` | Authenticated | Budget creation |
| `/budgets/[id]/edit` | Authenticated | Budget editing |
| `/api/health` | Public | Stateless application health check |

Protected URLs are checked by the Next.js proxy before rendering and are also
validated against the database session inside server-rendered routes and
mutations.

## Architecture

Budget Buddy uses route-colocated feature modules. Top-level URLs are direct
children of `src/app`, and route-specific implementation code lives beside
the route in private `_components` and `_lib` directories.

```text
src/
├── app/
│   ├── accounts/
│   │   ├── _components/
│   │   ├── _lib/
│   │   ├── error.tsx
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── budgets/
│   ├── categories/
│   ├── dashboard/
│   ├── demo/
│   ├── login/
│   ├── signup/
│   ├── transactions/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── shared/
│   ├── auth/
│   ├── components/
│   ├── types/
│   └── utils/
└── server/
    ├── auth/
    ├── config/
    ├── db/
    ├── generated/
    └── observability/

prisma/
├── migrations/
└── schema.prisma
```

The main ownership rules are:

- Code used by one route belongs in that route.
- Code shared by unrelated routes belongs in `src/shared`.
- Database clients, sessions, configuration, logging, and generated code
  belong in `src/server`.
- Files that access secrets, cookies, password hashes, or PostgreSQL are
  explicitly marked as server-only.
- Client Component entry points use the `.client.tsx` suffix.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the complete module-boundary
conventions.

## Data and security model

- Every financial record is owned by a user.
- Database queries and mutations are scoped by the authenticated user ID.
- Compound relations prevent transactions and budgets from referencing another
  user's accounts or categories.
- Financial amounts are stored as integer cents to avoid floating-point
  rounding errors.
- Session tokens are random values; only SHA-256 hashes are persisted.
- Authentication rate-limit keys are HMAC-hashed before storage.
- Production cookies are secure, HTTP-only, and use `SameSite=Lax`.
- Open redirects are rejected during post-authentication navigation.
- Application-wide headers restrict framing, content sniffing, browser
  permissions, referrers, and cross-origin opener behavior.
- The health endpoint is uncached and exposes no database or user information.

## Local development

### Requirements

- Node.js 20.19 or newer. Node.js 22 is the repository default in `.nvmrc`.
- npm
- PostgreSQL 17 or a compatible hosted PostgreSQL provider

### 1. Install dependencies

```bash
nvm use
npm ci
```

If `nvm` is not installed, use any supported Node.js installation.

### 2. Configure environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

The included defaults work with the Docker Compose database:

```env
DATABASE_URL="postgresql://budget_buddy:budget_buddy@localhost:5432/budget_buddy"
DIRECT_URL="postgresql://budget_buddy:budget_buddy@localhost:5432/budget_buddy"
APP_URL="http://localhost:3000"
AUTH_RATE_LIMIT_SECRET="replace-with-a-long-random-secret"
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Runtime PostgreSQL connection used by the application |
| `DIRECT_URL` | Direct connection used by Prisma migrations; falls back to `DATABASE_URL` |
| `APP_URL` | Canonical local or production application URL |
| `AUTH_RATE_LIMIT_SECRET` | Secret used to HMAC authentication throttling keys |

Use a long, random `AUTH_RATE_LIMIT_SECRET` outside local development. Never
commit real credentials.

### 3. Start PostgreSQL

To use the included local database:

```bash
docker compose up -d postgres
```

Alternatively, replace `DATABASE_URL` and `DIRECT_URL` with the connection
strings for a hosted PostgreSQL database. For providers with connection
pooling, use the pooled connection for `DATABASE_URL` and a direct or
session-based connection for `DIRECT_URL`.

### 4. Prepare the database

Apply the committed migrations and generate the Prisma client:

```bash
npm run db:deploy
npm run db:generate
```

### 5. Start the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create an account to use persisted workflows, load the optional sample dataset
from an empty dashboard, or open `/demo` to explore the application without
signing in.

To stop the local database:

```bash
docker compose down
```

The named Docker volume preserves PostgreSQL data between restarts.

## Database development

The Prisma schema is stored in `prisma/schema.prisma`, committed migrations
are stored in `prisma/migrations`, and the generated Prisma client is written
to `src/server/generated/prisma`.

After changing the schema, create and apply a development migration:

```bash
npm run db:migrate -- --name describe_the_change
```

Regenerate the client after schema changes:

```bash
npm run db:generate
```

Validate the schema or inspect local data with Prisma Studio:

```bash
npm run db:validate
npm run db:studio
```

Use `db:deploy` to apply existing migrations in CI, preview, and production
environments. Do not use the development migration command during deployment.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run ci` | Run Prisma generation, schema validation, lint, type checking, and build |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:validate` | Validate the Prisma schema |
| `npm run db:migrate -- --name <name>` | Create and apply a development migration |
| `npm run db:deploy` | Apply committed migrations |
| `npm run db:studio` | Open Prisma Studio |

## Continuous integration

Pull requests targeting `main` and pushes to `main` run the quality gates in
`.github/workflows/ci.yml`:

1. Install dependencies with `npm ci`.
2. Generate the Prisma client.
3. Validate the Prisma schema.
4. Run ESLint.
5. Run the TypeScript compiler.
6. Create a production Next.js build.

Run the same sequence locally with:

```bash
npm run ci
```

## Preview deployments

After the quality job succeeds, each non-draft pull request from a branch in
this repository is deployed to a Vercel Preview environment. Pull requests
from forks still run quality checks but skip deployment so secrets are not
exposed.

The GitHub `preview` environment requires:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The Vercel Preview environment requires:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_RATE_LIMIT_SECRET`

Leave `APP_URL` unset for preview deployments so the application uses the
deployment-specific `VERCEL_URL`. Preview deployments should use an isolated,
non-production database because the application can create and modify
financial records.

The workflow applies committed migrations before publishing the preview URL.
If the custom GitHub Actions workflow owns preview deployments, disable
parallel automatic Git deployments in Vercel to prevent duplicate previews.

## Health check

The public health endpoint supports `GET` and `HEAD`:

```bash
curl http://localhost:3000/api/health
```

Successful `GET` response:

```json
{
  "status": "ok"
}
```
