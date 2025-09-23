# Anonymous Auth Integration

## Findings
- Better Auth Anonymous plugin (`better-auth/plugins`) enables PII-free sessions, later upgradeable to email/social accounts.
- Requires server plugin registration alongside existing Expo plugin; optional `onLinkAccount` callback lets us migrate anonymous state before the SDK deletes the anonymous user.
- Client must install `anonymousClient` from `better-auth/client/plugins` (compatible with `better-auth/react`) so mobile users can call `authClient.signIn.anonymous()`.
- Database schema needs a nullable/optional `isAnonymous` boolean column on the `user` table; migrations must reflect this addition.
- Linking flows automatically delete the anonymous user unless `disableDeleteAnonymousUser` is set; we should move favorites/try-on history before linking completes.
- Our current schema enforces non-null `name`/`email`; confirm the plugin supplies synthetic values or configure `generateName`/`emailDomainName` to satisfy constraints.
- Mobile auth bootstrap should initiate anonymous sign-in to avoid blocking on credentials while preserving session cookies via SecureStore.

## Implementation Plan
1. Update `apps/api/src/auth.ts` to import `anonymous` plugin, register it in the `plugins` array, and define an `onLinkAccount` handler stub for future data migration.
2. Extend Drizzle schema (`apps/api/src/db/schemas/auth-schema.ts`) with an `isAnonymous` column (default `false`), generate & run a migration, and ensure downstream types include the new field.
3. Audit Better Auth migrations to confirm anonymous plugin requirements; rerun `bun run db:generate`/`db:migrate` after updating schema.
4. Enhance `apps/mobile/lib/auth-client.ts` by importing `anonymousClient()` and appending it to the `plugins` array; verify compatibility with Expo plugin ordering.
5. Add an anonymous sign-in bootstrap path in the mobile app (e.g., app entry hook) that calls `authClient.signIn.anonymous()` when no session exists, capturing errors and retry logic.
6. Design linking upgrade flow: prompt anonymous users to upgrade for payments, call `signIn`/`signUp`, and handle `onLinkAccount` server callback to transfer favorites/transactions before deletion.
7. Review backend middleware and feature gates to treat anonymous users as authenticated while flagging restricted endpoints (payments, admin) to require non-anonymous sessions.
8. Update documentation (`docs/better-auth/expo.md` or internal README) outlining anonymous auth behavior, environment tweaks (optional `emailDomainName`), and QA checklist.
