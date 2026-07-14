# Budget Buddy Architecture

Budget Buddy uses a feature-based Next.js App Router structure. Routes compose
pages, features own product-specific behavior, and shared backend
infrastructure is isolated from browser code.

## Directory responsibilities

```text
src/
├── app/       Route files, layouts, loading states, and error boundaries
├── features/  Product features and their interactive boundaries
├── shared/    Shared components, types, and utilities
├── server/    Server-only infrastructure, data access, and generated clients
└── mocks/     Temporary mock data

prisma/
├── schema.prisma
└── migrations/
```

## Route boundary

Files under `src/app` should remain small. A route should authenticate, load
the data needed by the page, and compose feature components. Business logic,
database queries, and large interactive components should live outside the
route tree.

## Feature boundary

Each directory under `src/features` owns one product capability:

```text
features/transactions/
├── components/
│   ├── transaction-form.client.tsx
│   ├── transactions-manager.client.tsx
│   └── csv-import-wizard.client.tsx
└── transaction.store.ts
```

The `.client.tsx` suffix is a project convention that makes interactive React
boundaries visible. These files use the `"use client"` directive because they
need state, event handlers, browser APIs, or client-side hooks.

Future feature modules can add files such as:

```text
account.actions.ts      Thin Next.js Server Actions
account.queries.ts      Server-only read operations
account.validation.ts   Input schemas and validation
account.types.ts        Types local to the accounts feature
```

## Server boundary

`src/server` contains modules that must never enter a browser bundle:

```text
server/
├── auth/
│   ├── constants.ts
│   └── session.ts
├── db/
│   └── client.ts
└── generated/
    └── prisma/
```

Modules that use secrets, cookies, password hashes, or the database import
`server-only`. This turns an accidental import from a Client Component into a
build error.

Database reads and writes should eventually go through server-only feature
queries or a data access layer. Every financial operation must obtain the
authenticated user on the server and scope database access by that user's ID.

## Shared code

Use `src/shared/components` for visual building blocks that are shared by
unrelated features. Use `src/shared/utils` for small framework-independent
helpers such as currency formatting, CSV parsing, and class-name composition.

Avoid turning `shared` into a catch-all directory. Code that only makes sense
for one product feature belongs with that feature.

## Temporary compatibility directories

`src/mocks` and `src/shared/types/view-models.ts` preserve the existing frontend
while the real backend is implemented. As each feature moves to persisted data,
its mock records can be removed and its types can move closer to the feature
when they are no longer shared.
