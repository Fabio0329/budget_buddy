# Budget Buddy Architecture

Budget Buddy uses route-colocated features with the Next.js App Router. The
filesystem mirrors the URL: every top-level route is a direct child of
`src/app`, and nesting is reserved for nested URLs.

## Directory responsibilities

```text
src/
├── app/       Routes and the product code owned by each route
├── shared/    Components, types, auth flows, and utilities used across routes
└── server/    Server-only infrastructure and generated clients

prisma/
├── schema.prisma
└── migrations/
```

## Route ownership

Route-specific components, actions, queries, validation, state, and types live
beside the route that owns them:

```text
app/transactions/
├── _components/
│   ├── transaction-form.client.tsx
│   ├── transactions-manager.client.tsx
│   └── csv-import-wizard.client.tsx
├── _lib/
│   ├── transaction.actions.ts
│   ├── transaction-form-state.ts
│   ├── transaction.queries.ts
│   └── transaction.validation.ts
├── [id]/edit/page.tsx
├── import/page.tsx
├── new/page.tsx
├── layout.tsx
└── page.tsx
```

Private folders prefixed with `_` are implementation details and are excluded
from routing. Page and layout files should focus on authentication, data
loading, and composition while their route-owned modules hold the detailed
behavior.

The `.client.tsx` suffix is a project convention that makes interactive React
boundaries visible. These files use the `"use client"` directive because they
need state, event handlers, browser APIs, or client-side hooks.

## Shared boundary

Move code to `src/shared` only when multiple routes own or consume it. Shared
visual building blocks live in `src/shared/components`, common types in
`src/shared/types`, and framework-independent helpers in `src/shared/utils`.
Authentication actions and state shared by login, signup, and signout live in
`src/shared/auth`.

Avoid turning `shared` into a catch-all directory. Code used by one route
belongs in that route's `_components` or `_lib` folder.

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

Database reads and writes go through server-only route queries or server
infrastructure. Every financial operation must obtain the authenticated user
on the server and scope database access by that user's ID.

## View models

`src/shared/types/view-models.ts` contains presentation contracts shared across
multiple routes. Route-specific query result types remain colocated in the
owning route's `_lib` folder.
