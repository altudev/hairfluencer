# Repository Guidelines

## Project Structure & Module Organization
Hairfluencer is a Bun-driven Turborepo. `apps/web` hosts the Next.js 15 site (`app/` routes, `public/` assets). `apps/mobile` contains the Expo Router client (`app/` screens, `components/` shared UI, `assets/` media). `apps/api` is a Bun + Hono service; route handlers sit in `src/`, database logic in `src/db`, and migrations in `src/db/migrations`. Shared lint and TypeScript presets live in `packages/eslint-config` and `packages/typescript-config`. Place reusable modules in `packages/` rather than duplicating inside apps.

## Build, Test, and Development Commands
- `bun install` (root) boots all workspaces.
- `bun run dev` runs `turbo run dev`; limit scope with `bunx turbo run dev --filter=apps/web`, `apps/mobile`, or `apps/api`.
- `bun run build` executes every build pipeline and emits `.next/`, Expo, and API artifacts.
- `bun run lint`, `bun run check-types`, and `bun run format` must succeed before a PR.
- API migrations: `bunx drizzle-kit generate --config apps/api/drizzle.config.ts`, then commit the generated files.

## Coding Style & Naming Conventions
TypeScript is mandatory. Run `bun run format`; Prettier enforces two-space indentation and semicolons. Use PascalCase for React components/screens, camelCase for hooks and helpers, and UPPER_SNAKE_CASE for environment keys. Keep Tailwind class lists readable and colocate feature logic with the folder it supports. ESLint flat configs from `@repo/eslint-config` are required; if you disable a rule, leave a short reason. Resolve `turbo/no-undeclared-env-vars` warnings before merging.

## Testing Guidelines
A shared test runner is not configured yet. Add package-level scripts (`"test": "bun test"`, `"test": "vitest"`) and register them in `turbo.json` when adding automated coverage. Store unit tests beside the code (`apps/api/src/**/__tests__`, `apps/web/app/**/__tests__`). Capture critical flows—API routes, Expo navigation—in integration tests or document the manual QA steps in the PR checklist.

## Commit & Pull Request Guidelines
Write imperative, present-tense commit titles (`Add Drizzle migrations cache`, `feat(api): expose booking endpoint`) and wrap bodies near 72 characters. Reference issues in the footer when available. Pull requests should link to the business context, summarize scope, call out schema or env updates, attach UI screenshots when relevant, and list the checks you ran (`bun run lint`, `bun run build`). Tag the owners of each affected app.

## Environment & Security Notes
Develop with Node 18+ and Bun 1.2.x. Provide per-app `.env` files—`apps/api` needs `DRIZZLE_DATABASE_URL` or `DATABASE_URL` before migrations. Never commit secrets; update `.env.example` instead. For caching or deployment, authenticate Turbo (`bunx turbo login`) and platform CLIs with your own tokens.
