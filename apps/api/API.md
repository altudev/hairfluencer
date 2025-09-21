# API Documentation - Hairfluencer

## Base URL
- Development: `http://localhost:3000`
- Production: Configure via `BETTER_AUTH_URL` environment variable

## Authentication Endpoints

All authentication endpoints are prefixed with `/api/auth/`

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
| `BETTER_AUTH_SECRET` | Secret key for auth (min 32 chars) | `your-super-secret-key-minimum-32-characters` |
| `BETTER_AUTH_URL` | Base URL for auth callbacks | `http://localhost:3000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

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

## CORS Configuration

The API is configured to accept requests from the frontend URL specified in the `FRONTEND_URL` environment variable.

Default CORS settings:
- Origin: `FRONTEND_URL` or `http://localhost:3000`
- Credentials: Enabled
- Allowed Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Allowed Headers: `Content-Type`, `Authorization`

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

## Development

Start the development server:
```bash
cd apps/api
bun dev
```

The server will start on port 3000 with hot reload enabled.