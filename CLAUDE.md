# Tasheen Enterprise E-Commerce

Modular monolith. DDD + CQRS. TypeScript + Fastify + Prisma.

## Architecture

4-layer per module under `modules/<name>/`:
- `domain/` — entities, value objects, errors, repository interfaces, events
- `application/` — commands, queries, services (CQRS, one handler per file)
- `infra/` — http (routes, controllers, validation), persistence (Prisma repos)
- Shared cross-cutting in `packages/core/`

Wiring: `apps/api/src/container.ts` (DI), `apps/api/src/index.ts` (entry).

## Modules

admin, analytics, cart, customer-care, engagement, fulfillment, inventory-management, loyalty, order-management, payment, product-catalog, shared, user-management

## Key Conventions

- **Auth (Fastify)**: every protected route has `preHandler: [authenticate, RolePermissions.X]` — auth FIRST, role check SECOND. `RolePermissions.*` only checks `request.user`; without `authenticate` upstream, every request 401s.
- **Validation**: Zod schemas in `infra/http/validation/`, converted to JSON schemas via `toJsonSchema()`. Single source of truth.
- **VOs**: validation in private constructor (runs on every construction path). `static create()` for new instances, `static fromPersistence()` for reconstitution from DB.
- **Repos**: extend `PrismaRepository` from `apps/api/src/shared/infrastructure/persistence/`.
- **Currency**: canonical VO is `packages/core/src/domain/value-objects/currency.vo.ts` (ISO 4217). Other modules' local `currency.vo.ts` are duplicates pending migration.
- Full details in user-memory `canonical-patterns.md` — do not duplicate here.

## TS Baseline

22 pre-existing errors (mostly Prisma schema drift in cart, engagement, inventory, order-management repos). New code must not increase this count.

```bash
npx tsc --noEmit --ignoreDeprecations 5.0
```

## Token Hygiene — Don't Read Whole

- `package-lock.json` (~113 KB) — use Grep
- `prisma/schema.prisma` — read sliced sections via `offset`/`limit`
- `DATABASE_INDEX_STRATEGY.md`, `project_domain_patterns.md` (~19 KB each) — Grep first
- Any `*.tsbuildinfo`, `dist/`, `build/` — gitignored
