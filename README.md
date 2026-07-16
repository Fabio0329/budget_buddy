# Budget Buddy

A full-stack personal finance dashboard built with Next.js, PostgreSQL, and
Prisma.

## Local development

Requirements:

- Node.js 20.19 or newer
- A PostgreSQL database, such as a Supabase project

Create `.env.local` with the application and migration connection strings:

```env
DATABASE_URL="postgresql://...transaction-pooler..."
DIRECT_URL="postgresql://...session-pooler..."
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
