# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hairfluencer is an AI-powered hairstyle try-on application built as a hackathon MVP. Users can upload selfies and instantly visualize new haircuts and colors using AI transformation, with support for English and Spanish languages.

### Architecture
- **Turborepo Monorepo**: Three main applications sharing configurations
- **Mobile App**: Expo React Native app (primary client) - AI hairstyle visualization
- **API Server**: Bun + Hono with Better Auth & Drizzle ORM - handles auth, photo uploads, AI orchestration
  - Shared service layer in `apps/api/src/services/`; `hairstyle-generation.ts` centralizes fal.ai queue calls so routes just validate/serialize.
- **Web Admin**: Next.js 15 with Turbopack - admin panel for managing hairstyle gallery

## Development Commands

### Root-level commands (from project root):
```bash
bun dev              # Start all apps in development mode
bun build            # Build all apps
bun lint             # Run linting for all apps
bun format           # Format all TypeScript and Markdown files
bun check-types      # Type check all apps
```

### Web app (apps/web):
```bash
cd apps/web
bun dev              # Start Next.js dev server with Turbopack (port 3000)
bun build            # Build for production
bun lint             # Run ESLint
```

### API app (apps/api):
```bash
cd apps/api
bun dev              # Start Hono server with hot reload (port 3001)
# Note: Default port changed from 3000 to 3001 to avoid conflicts
```

### Mobile app (apps/mobile):
```bash
cd apps/mobile
bunx expo install [package]  # Install packages with Expo compatibility layer
bun start            # Start Expo development server
bun android          # Run on Android emulator/device
bun ios              # Run on iOS simulator/device
bun web              # Run in web browser
bun lint             # Run Expo lint
bun reset-project    # Reset to blank project template
```

## Tech Stack

### Core Technologies
- **Package Manager**: Bun (v1.2.22)
- **Monorepo Tool**: Turborepo with workspaces (apps/*, packages/*)
- **Mobile Framework**: Expo with React Native, expo-router for navigation
- **API Framework**: Hono on Bun runtime with Better Auth
- **Database**: PostgreSQL with Drizzle ORM
- **Admin Panel**: Next.js 15 with Turbopack, React 19, Tailwind CSS v4
- **Authentication**: Better Auth with email/password and Google OAuth
- **AI Integration**: FAL.ai platform using "nano-banana/edit" model for hairstyle transformation
- **Payments & Monetization**: Adapty for paywall management and in-app purchases

### Database & Authentication
- **Drizzle ORM** configuration in `apps/api/drizzle.config.ts`
- **Better Auth** configuration in `apps/api/src/auth.ts`
- Schema definitions in `apps/api/src/db/schemas/`
- Migrations stored in `apps/api/src/db/migrations/`
- Authentication tables: `user`, `session`, `account`, `verification`
- Google OAuth support for mobile app login

### Environment Variables Required
```bash
# Database
DATABASE_URL=postgres://user:password@localhost:5432/hairfluencer
DRIZZLE_DATABASE_URL=postgres://user:password@localhost:5432/hairfluencer

# Authentication
BETTER_AUTH_SECRET=minimum-32-character-secret-key
BETTER_AUTH_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
# Note: API runs on port 3001, frontend on port 3000

# Google OAuth (for mobile app)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# FAL.ai Integration (AI hairstyle transformation)
FAL_API_KEY=your-fal-api-key # when missing, try-on routes respond 503 instead of crashing
FAL_MODEL_ID=nano-banana/edit
FAL_ALLOWED_IMAGE_HOSTS=cdn.example.com,images.example.com # optional: restrict allowed upload hosts
REDIS_URL=redis://127.0.0.1:6378 # optional, otherwise REDIS_HOST/REDIS_PORT (default 6378)
FAL_RETRY_MAX_ATTEMPTS=3 # optional tuning knobs for retry/backoff/circuit breaker
FAL_RETRY_BASE_DELAY_MS=500
FAL_RETRY_MAX_DELAY_MS=5000
FAL_CIRCUIT_FAILURE_THRESHOLD=5
FAL_CIRCUIT_OPEN_MS=30000

# Adapty Integration (mobile payments)
ADAPTY_PUBLIC_KEY=your-adapty-public-key
ADAPTY_SECRET_KEY=your-adapty-secret-key
```

### Shared Packages
- `packages/eslint-config`: Shared ESLint configurations
- `packages/typescript-config`: Shared TypeScript configurations

### Build Configuration
- Turborepo pipeline defined in `turbo.json`
- Build outputs: `.next/**` for Next.js
- Environment variables loaded from `.env*` files
- Caching enabled for build and lint tasks

## Key Features (PRD Requirements)

### Core Functionality
1. **AI Hairstyle Try-On**: Upload selfie → Select style → AI transformation
2. **Dual Language Support**: English and Spanish UI localization
3. **Authentication**: Email/password and Google OAuth (mobile optimized)
4. **Favorites System**: Save and manage favorite hairstyle results
5. **Admin Panel**: Manage hairstyle gallery and view usage statistics

### API Endpoints
- **Auth**: `/api/auth/*` (sign-up, sign-in, sign-out, google, session)
- **Health**: `/api/health` - System health check
- **Upload**: `/api/upload` (to be implemented) - Photo upload
- **Styles**: `/api/styles` (to be implemented) - Hairstyle gallery
- **Transform**: `/api/transform` (to be implemented) - AI processing
- **Favorites**: `/api/favorites` (to be implemented) - User favorites

### Mobile App Considerations
- Session duration: 7 days (optimized for mobile usage)
- Trusted origins configured for Expo development
- Deep linking support: `hairfluencer://`
- CORS configured for mobile app requests
- Google OAuth redirect handling for mobile
- Try-on API enforces URL validation, 32KB payload limit, 10 image URL cap, per-client rate/queue limits, Redis status/result caching, and fal.ai retry + circuit breaker handling

## High-Level Architecture

### Request Flow Pattern
1. **Mobile App** → Makes API request with auth token (stored in Expo SecureStore)
2. **API Server** → Validates session via Better Auth middleware
3. **Service Layer** → `apps/api/src/services/*` handles business logic
4. **External Services** → FAL.ai for AI, Redis for caching, PostgreSQL for persistence
5. **Response** → JSON with standardized format: `{ data: {...}, meta: {...} }` or `{ error: string, message: string }`

### AI Transformation Pipeline
1. **Submit**: Mobile uploads image URLs → API validates → Queue job with FAL.ai
2. **Poll**: Mobile polls `/api/v1/try-ons/:jobId` → API checks Redis cache → Query FAL.ai if miss
3. **Complete**: Result cached 24h → Mobile displays transformation

### Authentication Architecture
- **Anonymous Sessions**: Auto-created on app launch, 7-day duration
- **Session Flow**: JWT stored in SecureStore → Sent as Bearer token → Better Auth validates
- **Cleanup Job**: `bun run cleanup:anonymous` removes 30-day old anonymous accounts

### Database Schema Patterns
- **Drizzle ORM**: Type-safe schema in `apps/api/src/db/schemas/`
- **Migrations**: Generate with `db:generate`, apply with `db:migrate`
- **Multilingual**: Hairstyle names/descriptions in `nameEn`/`nameEs` columns
- **Timestamps**: All tables have `createdAt`/`updatedAt` with automatic updates

### Rate Limiting & Resilience
- **API Rate Limits**: 20 requests/minute per client, max 5 concurrent AI jobs
- **Request Validation**: 32KB body limit, max 10 image URLs, URL host whitelisting
- **Circuit Breaker**: 5 consecutive failures → 30s cooldown for FAL.ai
- **Retry Logic**: Exponential backoff 500ms → 5000ms, max 3 attempts
- **Caching**: Redis caches status (5s TTL) and results (24h TTL)

### Mobile App Navigation (Expo Router)
- **File-based routing**: `apps/mobile/app/` directory structure defines routes
- **Tab Navigation**: `(tabs)/_layout.tsx` defines bottom tabs (Home, Explore)
- **Modal Screens**: Sign-in/up presented as modals via `presentation: 'modal'`
- **Deep Linking**: `hairfluencer://` scheme configured for OAuth callbacks

### Error Handling Patterns
- **API Errors**: Standardized format with error codes (e.g., `INVALID_REQUEST`, `RATE_LIMITED`)
- **Mobile Errors**: `showErrorAlert()` utility displays user-friendly messages
- **FAL.ai Errors**: Circuit breaker prevents cascade failures, returns 503 when unavailable
- **Database Errors**: Connection pool with auto-retry, graceful degradation

## Key Implementation Notes

### Testing Locally
1. Start PostgreSQL and Redis (optional)
2. Run `bun install` at root
3. Set up `.env` files in each app directory
4. Run migrations: `cd apps/api && bun run db:migrate`
5. Start all apps: `bun dev` (from root)
6. Mobile app connects to API at `http://localhost:3001`

### Common Development Patterns
- **Adding new API endpoint**: Create route in `apps/api/src/routes/v1/`, add service logic in `apps/api/src/services/`
- **Database changes**: Modify schema in `apps/api/src/db/schemas/`, run `db:generate` then `db:migrate`
- **Mobile screen**: Add file in `apps/mobile/app/`, navigation handled automatically by Expo Router
- **State management**: Use Zustand store in `apps/mobile/stores/useStore.ts`
- **API calls from mobile**: Use auth client from `apps/mobile/lib/auth-client.ts`
