# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed by Turborepo. Primary apps live under `apps/`:
  - `apps/mobile`: Expo Router client; screens in `app/`, shared UI in `components/`, feature hooks in `hooks/`.
  - `apps/api`: Bun + Hono service; routes in `src/routes/`, business logic in `src/services/`, database artifacts in `src/db/`.
  - `apps/web`: Next.js admin panel (currently scaffolding) with routes in `app/`.
- Reusable config packages are in `packages/eslint-config/` and `packages/typescript-config/`.
- Tasks, docs, and PR collateral live in `docs/`, `tasks/`, `todos/`, and `pr-reviews/`.

## Build, Test, and Development Commands
- `bun install` — install dependencies for all workspaces.
- `bun run dev` — launch all apps concurrently (disable caching per `turbo.json`).
- `bunx turbo run dev --filter=apps/api` — scoped dev server for the API on port 3001.
- `bun run build` — run build pipeline for every workspace.
- `bun run lint` / `bun run check-types` — required linting and type checks.
- `cd apps/api && bun run db:generate` / `db:migrate` — manage Drizzle migrations.
- `cd apps/mobile && bun start` — start Expo development server.

## Coding Style & Naming Conventions
- TypeScript everywhere; adhere to the shared configs in `packages/*`.
- Prettier enforces two-space indentation and semicolons (`bun run format`).
- React components/screens use PascalCase; hooks and helpers use camelCase; environment variables use UPPER_SNAKE_CASE.
- Tailwind-like class lists in Expo components should remain short and readable; colocate feature-specific logic with its screen.

## Testing Guidelines
- No monorepo-wide runner yet. Add package-level scripts (`"test": "bun test"`, `"test": "vitest"`) alongside new coverage and register them in `turbo.json`.
- Place tests next to code (`apps/api/src/**/__tests__`, `apps/web/app/**/__tests__`).
- Integration tests should focus on API routes (auth, try-ons) and Expo navigation flows; document manual QA steps when automation is absent.

## Commit & Pull Request Guidelines
- Commits: imperative mood, ≤72-character subject lines (`feat(api): add try-on polling`).
- PRs: describe scope, link to product context or issue, call out schema/env updates, attach screenshots for UI, and list verification steps (e.g., `bun run lint`, `bun run build`). Tag owners of affected apps.

## Security & Configuration Tips
- Never commit secrets; update `.env.example` files instead. Required env keys are listed in `README.md`.
- fal.ai endpoints return 503 if `FAL_API_KEY` is absent—verify before demos.
- Redis-backed caching powers try-on polling; set `REDIS_URL` or disable via `REDIS_DISABLE=true` when running locally without Redis.
