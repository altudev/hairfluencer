# API Documentation - Hairfluencer

AI-powered hairstyle try-on application backend API for mobile and web clients.

## Base URL
- Development: `http://localhost:3000`
- Production: Configure via `BETTER_AUTH_URL` environment variable
- Mobile Expo Dev: `exp://localhost:8081`

## Authentication Endpoints

All authentication endpoints are prefixed with `/api/auth/`. The API supports both email/password and Google OAuth authentication optimized for mobile app usage.

### Register User
**POST** `/api/auth/sign-up`

Create a new user account with email and password.

```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe" // Optional
}

// Response - Success (201)
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2025-09-21T10:00:00Z"
  },
  "session": {
    "id": "session-uuid",
    "userId": "user-uuid",
    "token": "session-token",
    "expiresAt": "2025-09-28T10:00:00Z"
  }
}

// Response - Error (400)
{
  "error": "Email already exists"
}
```

### Login
**POST** `/api/auth/sign-in`

Authenticate user with email and password.

```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response - Success (200)
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  },
  "session": {
    "id": "session-uuid",
    "token": "session-token",
    "expiresAt": "2025-09-28T10:00:00Z"
  }
}

// Response - Error (401)
{
  "error": "Invalid credentials"
}
```

### Logout
**POST** `/api/auth/sign-out`

End current user session.

```json
// Request
Headers: {
  "Authorization": "Bearer <session-token>"
}

// Response - Success (200)
{
  "success": true
}
```

### Get Session
**GET** `/api/auth/session`

Get current user session information.

```json
// Request
Headers: {
  "Authorization": "Bearer <session-token>"
}

// Response - Success (200)
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  },
  "session": {
    "id": "session-uuid",
    "expiresAt": "2025-09-28T10:00:00Z"
  }
}

// Response - Error (401)
{
  "error": "Not authenticated"
}
```

### Google OAuth Login
**GET** `/api/auth/google`

Initiate Google OAuth flow for mobile app login.

```json
// Request
// Redirect user to this endpoint in mobile WebView or browser

// Response
// Redirects to Google OAuth consent page
// After consent, redirects to: /api/auth/callback/google
```

### Google OAuth Callback
**GET** `/api/auth/callback/google`

Handle Google OAuth callback (automatically processed).

```json
// Response - Success
// Redirects to mobile app with deep link:
// hairfluencer://auth?token=<session-token>&user=<user-data>

// Response - Error
// Redirects to mobile app with error:
// hairfluencer://auth?error=<error-message>
```

## Health Check Endpoint

### System Health
**GET** `/api/health`

Check API and database connectivity status.

```json
// Response - Success (200)
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "auth": "operational"
  },
  "timestamp": "2025-09-21T10:00:00.000Z"
}

// Response - Error (503)
{
  "status": "unhealthy",
  "error": "Database connection failed",
  "timestamp": "2025-09-21T10:00:00.000Z"
}
```

## Environment Variables

Required environment variables for the API:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@localhost:5432/hairfluencer` |
| `DRIZZLE_DATABASE_URL` | Alternative DB URL for migrations | `postgres://user:pass@localhost:5432/hairfluencer` |
| `BETTER_AUTH_SECRET` | Secret key for auth (min 32 chars) | `your-super-secret-key-minimum-32-characters` |
| `BETTER_AUTH_URL` | Base URL for auth callbacks | `http://localhost:3000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-xxxxxxxxxxxxx` |
| `FAL_API_KEY` | FAL.ai API key for AI transformations | `your-fal-api-key` |
| `FAL_MODEL_ID` | FAL.ai model identifier | `nano-banana/edit` |
| `ADAPTY_PUBLIC_KEY` | Adapty public SDK key | `public.adapty.xxxxx` |
| `ADAPTY_SECRET_KEY` | Adapty server-side secret key | `secret.adapty.xxxxx` |

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE", // Optional error code
  "details": {} // Optional additional details
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (database issues)

## CORS & Mobile App Configuration

The API is configured to accept requests from mobile apps and web clients.

### CORS Settings:
- Origins:
  - `FRONTEND_URL` (web admin)
  - `exp://localhost:8081` (Expo development)
  - `hairfluencer://` (mobile app deep links)
- Credentials: Enabled
- Allowed Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Allowed Headers: `Content-Type`, `Authorization`

### Mobile-Specific Settings:
- Session duration: 7 days (optimized for mobile usage)
- Deep link support for OAuth callbacks
- Token-based authentication for API calls

## Rate Limiting

Currently not implemented. Consider adding rate limiting for production:
- Sign-up: 5 requests per hour per IP
- Sign-in: 10 requests per 15 minutes per IP
- API calls: 100 requests per minute per user

## Security Notes

1. **Password Requirements**:
   - Minimum length: 8 characters
   - Maximum length: 128 characters

2. **Session Management**:
   - Sessions expire after 7 days
   - Sessions are updated every 24 hours of activity

3. **Database Security**:
   - Connection pooling with max 10 clients
   - 30-second idle timeout
   - 10-second connection timeout

## Database Schema

The API uses the following tables:
- `user` - User accounts
- `session` - Active user sessions
- `account` - OAuth and password accounts
- `verification` - Email verification tokens

Run migrations with:
```bash
cd apps/api
bun run db:migrate
```

## Third-Party Integrations

### FAL.ai Integration
The API uses FAL.ai's "nano-banana/edit" model for AI-powered hairstyle transformations:
- Model: `nano-banana/edit`
- Documentation: https://fal.ai/models/nano-banana/edit
- Features: Image editing with style transfer for hairstyle modifications
- Response time: Target <8 seconds for 90th percentile

### Adapty Integration
Payment processing and subscription management through Adapty:
- SDK: Mobile SDK for iOS/Android
- Features: Paywall management, subscription handling, analytics
- Documentation: https://docs.adapty.io/
- Webhook endpoint: `/api/webhooks/adapty` (to be implemented)

## Development

Start the development server:
```bash
cd apps/api
bun dev
```

The server will start on port 3000 with hot reload enabled.