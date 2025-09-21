# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hairfluencer is a Turborepo monorepo project with three main applications:
- **Web**: Next.js 15 application with Turbopack
- **API**: Bun-based Hono server with Drizzle ORM for database access
- **Mobile**: Expo React Native application

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
bun start            # Start Expo development server
bun android          # Run on Android emulator/device
bun ios              # Run on iOS simulator/device
bun web              # Run in web browser
bun lint             # Run Expo lint
bun reset-project    # Reset to blank project template
```

## Architecture

### Tech Stack
- **Package Manager**: Bun (v1.2.22)
- **Monorepo Tool**: Turborepo with workspaces (apps/*, packages/*)
- **Web Framework**: Next.js 15 with Turbopack, React 19, Tailwind CSS v4
- **API Framework**: Hono on Bun runtime
- **Database**: PostgreSQL with Drizzle ORM
- **Mobile Framework**: Expo with React Native, expo-router for navigation

### Database Setup
- Drizzle ORM configuration in `apps/api/drizzle.config.ts`
- Schema definitions in `apps/api/src/db/schemas/`
- Migrations stored in `apps/api/src/db/migrations/`
- Requires `DATABASE_URL` or `DRIZZLE_DATABASE_URL` environment variable

### Shared Packages
- `packages/eslint-config`: Shared ESLint configurations
- `packages/typescript-config`: Shared TypeScript configurations

### Build Configuration
- Turborepo pipeline defined in `turbo.json`
- Build outputs: `.next/**` for Next.js
- Environment variables loaded from `.env*` files
- Caching enabled for build and lint tasks