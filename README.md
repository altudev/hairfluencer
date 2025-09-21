# Hairfluencer - AI Hairstyle Try On

Hairfluencer is an AI-powered mobile application that enables users to instantly visualize new haircuts and colors using advanced AI transformation technology. Built as a hackathon MVP using Turborepo, Expo, and FAL.ai.

## Features

- **AI Hairstyle Transformation**: Upload a selfie and try on different hairstyles using FAL.ai's nano-banana/edit model
- **Dual Language Support**: Full support for English and Spanish interfaces
- **Authentication**: Secure login with email/password or Google OAuth
- **Favorites System**: Save and manage your favorite hairstyle transformations
- **Admin Panel**: Web-based management interface for hairstyle gallery and analytics

## Project Structure

This is a Turborepo monorepo containing:

### Apps
- `apps/mobile`: Expo React Native app (primary client) for iOS/Android
- `apps/api`: Bun + Hono backend API with Better Auth and Drizzle ORM
- `apps/web`: Next.js 15 admin panel with Turbopack

### Packages
- `packages/eslint-config`: Shared ESLint configurations
- `packages/typescript-config`: Shared TypeScript configurations

## Quick Start

### Prerequisites
- Node.js 18+
- Bun 1.2.22+
- PostgreSQL database
- FAL.ai API key
- Google OAuth credentials (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/hairfluencer.git
cd hairfluencer

# Install dependencies
bun install
```

### Environment Setup

Create `.env` files in the respective app directories:

**apps/api/.env:**
```bash
DATABASE_URL=postgres://user:password@localhost:5432/hairfluencer
DRIZZLE_DATABASE_URL=postgres://user:password@localhost:5432/hairfluencer
BETTER_AUTH_SECRET=your-32-character-minimum-secret-key
BETTER_AUTH_URL=http://localhost:3001
FRONTEND_URL=http://localhost:8081
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FAL_API_KEY=your-fal-api-key
FAL_MODEL_ID=nano-banana/edit
```

**apps/mobile/.env:**
```bash
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_ADAPTY_PUBLIC_KEY=your-adapty-public-key
```

**apps/web/.env:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Database Setup

```bash
# Navigate to API directory
cd apps/api

# Generate database migrations
bun run db:generate

# Apply migrations
bun run db:migrate

# (Optional) Open Drizzle Studio for database management
bun run db:studio
```

## Development

### Run all apps simultaneously
```bash
bun dev
```

### Run individual apps

**Mobile App (Expo):**
```bash
cd apps/mobile
bunx expo install [package]  # Install packages with Expo compatibility
bun start                     # Start Expo development server
bun ios                       # Run on iOS simulator
bun android                   # Run on Android emulator
bun web                       # Run in web browser
```

**API Server:**
```bash
cd apps/api
bun dev  # Runs on http://localhost:3001
```

**Admin Panel:**
```bash
cd apps/web
bun dev  # Runs on http://localhost:3000
```

## Building for Production

```bash
# Build all apps
bun build

# Build specific app
bun build --filter=mobile
bun build --filter=api
bun build --filter=web
```

## Code Quality

```bash
# Run linting for all apps
bun lint

# Format all TypeScript and Markdown files
bun format

# Type check all apps
bun check-types
```

## Tech Stack

- **Mobile**: Expo SDK 53, React Native 0.79, React Navigation, Expo Router
- **Backend**: Bun, Hono, Better Auth, Drizzle ORM, PostgreSQL
- **Admin**: Next.js 15, React 19, Tailwind CSS v4, Turbopack
- **AI**: FAL.ai platform (nano-banana/edit model)
- **Payments**: Adapty SDK for in-app purchases
- **Monorepo**: Turborepo with Bun workspaces

## Project Goals (Hackathon MVP)

- Launch working MVP within 14 days
- Achieve 200+ user sign-ups in the first week
- Complete 100+ AI hairstyle try-ons
- Maintain <8 second transformation time (90th percentile)
- Collect 50+ user feedback responses

## Contributing

Please read [AGENTS.md](AGENTS.md) for development guidelines and [CLAUDE.md](CLAUDE.md) for AI assistant integration instructions.

## License

This project is proprietary and confidential.