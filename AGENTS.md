# Repository Guidelines

## Project Overview (Hackathon MVP)
Hairfluencer is an AI-powered hairstyle try-on mobile application built for a 14-day hackathon. Users upload selfies to instantly visualize new hairstyles using FAL.ai's "nano-banana/edit" model, with dual-language support (English/Spanish). The MVP targets 200+ sign-ups and 100+ try-ons in the first week. Monetization is handled through Adapty for premium features and subscription management.

## Project Structure & Module Organization
Hairfluencer is a Bun-driven Turborepo with three main applications:
- `apps/mobile`: Expo Router client (PRIMARY) - User-facing mobile app for AI hairstyle try-ons (`app/` screens with Expo Router navigation, `components/` shared UI, `assets/` media, `hooks/` custom React hooks, `constants/` app configuration)
- `apps/api`: Bun + Hono + Better Auth service - Backend API handling auth, photo uploads, AI orchestration (`src/` routes, `src/db` database, `src/db/migrations`)
- `apps/web`: Next.js 15 admin panel - Gallery management and analytics dashboard (`app/` routes, `public/` assets)
- Shared API services live in `apps/api/src/services` — e.g. `hairstyle-generation.ts` wraps all fal.ai queue interactions so routes stay thin.

Shared configurations live in `packages/eslint-config` and `packages/typescript-config`. Place reusable modules in `packages/` rather than duplicating inside apps.

## Build, Test, and Development Commands
- `bun install` (root) boots all workspaces.
- `bun run dev` runs all apps; limit scope with `bunx turbo run dev --filter=apps/api` for backend only.
- `bun run build` executes every build pipeline and emits `.next/`, Expo, and API artifacts.
- `bun run lint`, `bun run check-types`, and `bun run format` must succeed before a PR.
- **API specific**:
  - `cd apps/api && bun run db:generate` - Generate Drizzle migrations
  - `cd apps/api && bun run db:migrate` - Apply migrations to database
  - `cd apps/api && bun run db:studio` - Open Drizzle Studio for database management
- **Mobile specific**:
  - `cd apps/mobile && bunx expo install [package]` - Install packages with Expo compatibility layer
  - `cd apps/mobile && bun ios` - Run on iOS simulator
  - `cd apps/mobile && bun android` - Run on Android emulator
  - `cd apps/mobile && bun start` - Start Expo development server
  - `cd apps/mobile && bun web` - Run in web browser

## Coding Style & Naming Conventions
TypeScript is mandatory. Run `bun run format`; Prettier enforces two-space indentation and semicolons. Use PascalCase for React components/screens, camelCase for hooks and helpers, and UPPER_SNAKE_CASE for environment keys. Keep Tailwind class lists readable and colocate feature logic with the folder it supports. ESLint flat configs from `@repo/eslint-config` are required; if you disable a rule, leave a short reason. Resolve `turbo/no-undeclared-env-vars` warnings before merging.

## Testing Guidelines
A shared test runner is not configured yet. Add package-level scripts (`"test": "bun test"`, `"test": "vitest"`) and register them in `turbo.json` when adding automated coverage. Store unit tests beside the code (`apps/api/src/**/__tests__`, `apps/web/app/**/__tests__`). Capture critical flows—API routes, Expo navigation—in integration tests or document the manual QA steps in the PR checklist.

## Commit & Pull Request Guidelines
Write imperative, present-tense commit titles (`Add Drizzle migrations cache`, `feat(api): expose booking endpoint`) and wrap bodies near 72 characters. Reference issues in the footer when available. Pull requests should link to the business context, summarize scope, call out schema or env updates, attach UI screenshots when relevant, and list the checks you ran (`bun run lint`, `bun run build`). Tag the owners of each affected app.

## Environment & Security Notes
Develop with Node 18+ and Bun 1.2.x. Each app requires specific environment variables:

### API Environment (`apps/api/.env`):
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Min 32 chars for session encryption
- `BETTER_AUTH_URL` - API base URL for auth callbacks
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `FAL_API_KEY` - FAL.ai authentication key for AI transformations
- `FAL_MODEL_ID` - Set to "nano-banana/edit" for hairstyle editing
- `FRONTEND_URL` - Mobile app URL for CORS

### Mobile Environment (`apps/mobile/.env`):
- `EXPO_PUBLIC_API_URL` - Backend API URL
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID for mobile
- `EXPO_PUBLIC_ADAPTY_PUBLIC_KEY` - Adapty SDK public key for payments

- Never commit secrets; update `.env.example` instead. For deployment, use secure environment variable management.
- If `FAL_API_KEY` is missing, fal.ai-powered endpoints now return a 503 rather than crashing the API process.

## PRD Success Metrics (Hackathon Goals)
- **User Metrics**: 200+ sign-ups, 100+ completed try-ons in week 1
- **Conversion**: 20%+ rate from first visit to try-on
- **Feedback**: Minimum 50 survey responses
- **Technical**: <8 second AI transformation (90th percentile), <5% error rate
- **Availability**: 99% uptime during hackathon showcase

## Key Features to Implement
1. **Authentication**: Email/password + Google OAuth (✅ Completed - Better Auth configured)
2. **Photo Upload**: Selfie validation with face detection (Pending)
3. **Hairstyle Gallery**: Admin-managed style options with bilingual tags (Pending)
4. **AI Transformation**: FAL.ai "nano-banana/edit" model integration (Pending)
5. **Favorites System**: Save and manage favorite results (Pending)
6. **Localization**: English/Spanish toggle throughout app (Pending)
7. **Analytics**: Track funnel events and collect feedback (Pending)
8. **Monetization**: Adapty paywall for premium features & subscriptions (Pending)
9. **Navigation**: Expo Router with bottom tabs (✅ Completed - Basic structure set up)
