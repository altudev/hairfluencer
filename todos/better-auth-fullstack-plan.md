# Better Auth Fullstack TODO

## References
- `docs/hairfluencer-PRD.md` — Product scope, auth requirements, and success metrics for the MVP.
- `docs/better-auth/installation.md` — Core Better Auth setup, environment, database, and handler guidance.
- `docs/better-auth/hono.md` — Hono server integration details, CORS, middleware patterns, and cookie considerations.
- `docs/better-auth/expo.md` — Expo client/plugin setup, deep linking, secure storage, and session usage.

## Implementation Plan

### 1. Environment & Secrets Alignment
- [x] Ensure `BETTER_AUTH_SECRET` (>=32 chars) and `BETTER_AUTH_URL` are present in `apps/api/.env` and mirrored in `.env.example` without secrets. *(Placeholders documented; local `.env` still needs secure values.)*
- [x] Mirror Expo/mobile Better Auth env placeholders (`EXPO_PUBLIC_*`, deep link scheme) in `apps/mobile/.env.example` to align with backend trusted origins.
- [ ] Confirm Google OAuth env variables for Better Auth match existing Expo credentials (`EXPO_PUBLIC_GOOGLE_CLIENT_ID`), adding server-side client/secret.
- [ ] Review PRD privacy notes; document retention policy messaging in onboarding copy once auth flows go live.

### 2. Backend (Hono) Better Auth Instance
- [x] Create `apps/api/src/auth.ts` instantiating `betterAuth` with the Drizzle adapter, pointing at existing `db` instance. *(Located at `apps/api/src/auth.ts`; refined to include Expo plugin support.)*
- [x] Enable `emailAndPassword` and configure Google social provider using `process.env` keys; add additional plugins (e.g., `expo()`) for native deep link handling. *(`apps/api/src/auth.ts` mounts `expo()` plugin and reads Google creds from env.)*
- [x] Configure `trustedOrigins` to include Expo scheme(s), web admin origin, and staging domains as defined in product rollout. *(Reads `BETTER_AUTH_TRUSTED_ORIGINS`, Expo dev URL, and deep link scheme from env.)*
- [x] Expose helper exports (`auth`, `auth.api`, `auth.$Infer`) for use across routes, middleware, and background jobs. *(`apps/api/src/auth.ts` now exports `authHandler`, `authApi`, and `authInfer` along with `AUTH_TRUSTED_ORIGINS`.)*

### 3. API Routing & Middleware Integration
- [x] Mount Better Auth handler inside main Hono app (`app.on(["POST","GET"], "/api/auth/*", ...)`) before other auth-sensitive routes. *(Mounted once in `apps/api/src/index.ts` with shared CORS middleware.)*
- [x] Register `cors` middleware ahead of the handler using `FRONTEND_URL` (mobile web) and dev Expo URLs; set `credentials: true` and allowed headers. *(`apps/api/src/index.ts` derives HTTP origins from `AUTH_TRUSTED_ORIGINS`.)*
- [x] Add session enrichment middleware storing `user`/`session` on `Context` for downstream routes (e.g., hairstyle gallery, favorites). *(`apps/api/src/index.ts` now hydrates `c.get('user')`/`c.get('session')` through `authApi.getSession`.)*
- [x] Update existing protected routes to read `c.get("user")` and enforce auth where PRD requires gated access. *(Favorites and try-on routes return 401 when no authenticated user is present.)*

### 4. Database Schema & Migrations
- [ ] Use `@better-auth/cli generate` to scaffold Drizzle tables, then copy models into `apps/api/src/db/schema`.
- [ ] Add migration via `bun run db:generate` ensuring Better Auth tables coexist with existing ones; run `bun run db:migrate` locally.
- [ ] Seed localization-friendly default user preferences (language) aligned with PRD user settings once tables exist.

### 5. Expo Client Integration
- [x] Create `apps/mobile/lib/auth-client.ts` using `createAuthClient` with `expoClient`, `SecureStore`, and `EXPO_PUBLIC_API_URL`.
- [x] Ensure `app.json` (or `app.config.ts`) declares deep link scheme (e.g., `hairfluencer`) consistent with server `trustedOrigins`.
- [ ] Configure `metro.config.js` (`unstable_enablePackageExports`) and adjust `babel.config.js` aliases only if Metro config fails.
- [x] Implement shared auth hooks/provider exposing `authClient.useSession()` to screens and guard navigation flows. *(`apps/mobile/hooks/useAuth.ts` powers gated upload flow and header state.)*
- [ ] Update sign-in/up UI to call `authClient.signIn.email`, `authClient.signUp.email`, and social helpers; handle error messaging per PRD UX guidelines. *(`app/sign-in.tsx` now uses Better Auth; dedicated sign-up screen remains TODO.)*
- [x] Extend environment validation to cover `EXPO_PUBLIC_*` auth keys and deep link settings so mobile builds surface misconfiguration early.

### 6. Cross-App Coordination & QA
- [ ] Verify mobile → API handshake (cookies stored via SecureStore, `credentials:"omit"` on fetch) and server CORS accepts Expo dev origins.
- [ ] Document manual QA steps for email/password, Google sign-in, logout, session persistence, and localization preference updates.
- [ ] Align admin web app (`apps/web`) to reuse Better Auth session middleware or provide separate login using same handler.
- [ ] Track analytics events (sign-up/login) per PRD once auth emits success/failure states.
