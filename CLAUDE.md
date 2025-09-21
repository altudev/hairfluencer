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
bun dev              # Start Hono server with hot reload (port 3000)
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
BETTER_AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

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
