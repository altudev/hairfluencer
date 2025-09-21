# Try-On API Reference

## POST `/api/v1/try-ons`

Create a new AI hairstyle try-on job. Jobs are queued via fal.ai and processed asynchronously.

### Request Body

```json
{
  "prompt": "string",
  "imageUrls": ["https://..."],
  "numImages": 1,
  "outputFormat": "jpeg",
  "syncMode": false,
  "priority": "normal",
  "webhookUrl": "https://example.com/callback",
  "hint": "string"
}
```

#### Required Fields
- `prompt`: Text prompt describing the desired hairstyle.
- `imageUrls`: Array of image URLs (minimum 1, maximum 10). URLs must use `http` or `https`, avoid private network addresses, and optional whitelist is controlled via `FAL_ALLOWED_IMAGE_HOSTS`.

#### Optional Fields
- `numImages`: Integer 1–4 (default 1).
- `outputFormat`: One of `jpeg` or `png` (default `jpeg`).
- `syncMode`: Boolean flag for synchronous mode (default `false`).
- `priority`: `low` or `normal` (default `normal`).
- `webhookUrl`: HTTPS endpoint notified on completion; must pass the same URL validation as `imageUrls`.
- `hint`: Optional runner hint forwarded to fal.ai.

### Limits & Validation
- JSON body must be ≤ 32 KB.
- Each URL ≤ 2048 characters.
- Rate limit: 20 requests per client per minute (based on `x-user-id`, IP headers, or anonymous fallback).
- Queue limit: maximum five active jobs per client; complete or cancel jobs before submitting more.
- Circuit breaker: after five consecutive fal.ai failures, the API pauses outbound calls for 30 seconds and surfaces `TRY_ON_SERVICE_THROTTLED`.

### Response
- **202 Accepted** – job queued.

```json
{
  "data": {
    "job": {
      "id": "string",
      "modelId": "fal-ai/nano-banana/edit",
      "status": "queued",
      "queuePosition": 2
    }
  },
  "meta": {
    "modelId": "fal-ai/nano-banana/edit",
    "provider": {
      "requestId": "string",
      "rawStatus": "IN_QUEUE",
      "statusUrl": "https://...",
      "responseUrl": "https://..."
    }
  }
}
```

### Error Codes
- `INVALID_REQUEST` (400) – Validation failure (prompt, URLs, limits).
- `REQUEST_TOO_LARGE` (413) – Body exceeds 32 KB.
- `RATE_LIMITED` (429) – Per-client rate limit reached (includes `Retry-After`).
- `QUEUE_LIMIT_REACHED` (429) – More than five active jobs.
- `TRY_ON_SERVICE_UNAVAILABLE` (503) – fal.ai credentials missing.
- `TRY_ON_SERVICE_THROTTLED` (503) – fal.ai circuit breaker open.
- `TRY_ON_ERROR` (500) – Unexpected server error.

---

## GET `/api/v1/try-ons/:jobId`

Fetch job status and (optionally) completed results.

### Query Parameters
- `includeResult` (default `true`): Set to `false` to skip fetching result payload.
- `logs` (default `false`): When `true`, bypasses status caching and requests fal.ai logs.

### Response
- **200 OK** with current job state; results included when available.

Redis caches status responses for 5 seconds and completed results for 24 hours to reduce fal.ai traffic. Caches are bypassed when `logs=true`.

### Error Codes
- `INVALID_REQUEST` (400) – Missing `jobId`.
- `TRY_ON_NOT_FOUND` (404) – fal.ai request missing (passthrough).
- `FAL_API_ERROR` (>=400) – fal.ai errors.
- `TRY_ON_SERVICE_THROTTLED` (503) – circuit breaker open.
- `TRY_ON_SERVICE_UNAVAILABLE` (503) – fal.ai credentials missing.
- `TRY_ON_ERROR` (500) – unexpected error.

---

## Operational Notes
- fal.ai is accessed via exponential backoff (default 3 attempts, base delay 500 ms, max 5 s) with jitter and a circuit breaker that opens after five consecutive failures for 30 s.
- Redis defaults to `127.0.0.1:6378`; supply `REDIS_URL`, `REDIS_HOST`, or `REDIS_PORT` to customize.
- Set `REDIS_DISABLE=true` to skip caching in environments without Redis (performance will degrade).
- When fal.ai credential (`FAL_API_KEY`) is missing, API returns 503 and instructs operators to configure creds.

## Troubleshooting
- **503 TRY_ON_SERVICE_UNAVAILABLE**: ensure `FAL_API_KEY` is set and the fal.ai account is active.
- **503 TRY_ON_SERVICE_THROTTLED**: circuit breaker is open. Wait 30 seconds (configurable via `FAL_CIRCUIT_OPEN_MS`) before retrying.
- **429 RATE_LIMITED**: caller exceeded 20 requests/minute. Respect `Retry-After` header.
- **Redis connection failures**: verify Redis is reachable on port 6378 or adjust `REDIS_URL`. Set `REDIS_DISABLE=true` for local environments without Redis.
- **Image URL rejected**: confirm URL is HTTP(S), public, ≤ 2048 chars, and (if configured) matches `FAL_ALLOWED_IMAGE_HOSTS`.

## Mobile Integration Notes
- Poll `GET /api/v1/try-ons/:jobId` until `status` becomes `completed`. Honour 5-second cache TTL; avoid polling faster than once per second.
- Handle 202 responses optimistically; show queue position when provided.
- Surface `RATE_LIMITED`, `QUEUE_LIMIT_REACHED`, and 503 errors with user-friendly messaging and retry flows.
- For push-style updates, register a `webhookUrl` that can receive fal.ai callbacks (requires secure public endpoint).
