# AI IT Helpdesk Agent

An internal IT support workspace where employees get guided troubleshooting and IT teams manage the ticket queue.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ai-it-helpdesk` — React/Vite employee and IT workspace UI
- `artifacts/api-server/src/routes/helpdesk.ts` — helpdesk API and troubleshooting engine
- `lib/api-spec/openapi.yaml` — source of truth for helpdesk API contracts
- `lib/db/src/schema/tickets.ts` and `activity.ts` — PostgreSQL persistence models
- `artifacts/ai-it-helpdesk/src/index.css` — application theme and motion tokens

## Architecture decisions

- The frontend uses generated OpenAPI hooks rather than hand-written fetch clients.
- Ticket and activity records use the shared PostgreSQL database through Drizzle.
- The diagnosis endpoint is intentionally safe and deterministic: it recommends first-line steps from issue signals and marks cases that need human escalation.
- Initial helpdesk rows seed on first read so the dashboard is useful immediately without a separate seed command.

## Product

- Employees can describe an issue and receive guided troubleshooting.
- Employees can open tickets with category and priority context.
- IT staff can search, filter, assign, update, and resolve tickets.
- The dashboard shows queue health, category mix, recent activity, and response context.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run API codegen after changing `lib/api-spec/openapi.yaml`.
- The app uses the managed artifact workflow for its Vite port and base path.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
