# Secure Upload & fal.ai Hand-off Design

## Purpose
Translate the requirements for secure selfie uploads and fal.ai invocation into a concrete architecture that the API, mobile client, and infrastructure teams can implement consistently during the hackathon timeline.

## High-Level Architecture
```
[Mobile App]
    | 1. Request upload URL
    v
[API Auth Gateway] -- issues --> [Pre-signed PUT URL]
    | 2. Confirm upload
    v
[Upload Validation Service] -- stores metadata --> [DB]
    | 3. Trigger try-on
    v
[Transformation Orchestrator] -- generates signed GET --> [AWS S3]
    | 4. Call fal.ai with signed URL
    v
[fal.ai nano-banana/edit]
    | 5. Result -> S3 (processed) + DB metadata
    v
[Mobile App fetches via API]
```

## Components
- **Auth Gateway / API Route Layer**: Exposes `/uploads/presign` and `/try-ons` endpoints, enforces Better Auth sessions, rate limits, and audit logging.
- **Upload Validation Service**: Validates object metadata, optional face detection hook, writes upload records, schedules deletion jobs.
- **Transformation Orchestrator**: Wraps fal.ai client, handles pre-signed GET generation, retry logic, and result persistence.
- **Storage Layer**: Private S3 bucket for raw uploads (`uploads/{userId}/{uuid}.jpg`) and a separate private bucket for processed outputs (`results/{userId}/{jobId}.jpg`) each with tailored lifecycle rules.
- **Background Jobs**: Cleanup (delete expired uploads), fal.ai retry queue, optional face detection tasks.

## Data Contracts
- **UploadRequest** (client → API): `{ contentType: string, checksum?: string, locale?: string }`
- **UploadResponse** (API → client): `{ uploadUrl: string, key: string, expiresAt: ISODate, maxBytes: number }`
- **UploadConfirmRequest**: `{ key: string, eTag?: string, metadata: { width?: number, height?: number } }`
- **TryOnRequest**: `{ key: string, hairstyleId: string, prompt: string, locale: "en" | "es" }`
- **TryOnResponse**: `{ jobId: string, status: "queued" | "processing" | "succeeded" | "failed", resultUrl?: string }`

## Storage & IAM Design
- Bucket policy denies all public access; only the API IAM role receives `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on `uploads/*` and `results/*`.
- Pre-signed URLs include conditions for `Content-Type`, `Content-Length` (≤16 MB), and checksum (if provided).
- Lifecycle policies: uploads bucket objects auto-delete after 24h; processed bucket objects auto-delete after 7 days unless favorited.
- Server-side encryption: SSE-S3 by default; upgrade to SSE-KMS when keys are available.

## fal.ai Invocation Flow
1. API loads upload metadata from DB and ensures ownership.
2. Generate `getObject` URL with 5-minute TTL against the uploads bucket; optionally apply `ResponseCacheControl: no-store`.
3. Call `fal.subscribe("fal-ai/nano-banana/edit", { input: { prompt, image_urls: [signedUrl] } })` using cached fal client.
4. Listen for queue updates; map `requestId` to internal job record.
5. On completion, store result URL (from fal) or download and copy to the processed bucket (`results/{userId}/{jobId}.jpg`) if we need first-party hosting.
6. Mark job status and notify mobile client via polling or push subscription.

## Error Handling & Retries
- **Upload issuance**: Return 429 when user exceeds daily quota; 403 for unauthorized requests.
- **Upload confirmation**: If S3 headObject fails, respond 404; on metadata mismatch, delete object and return 422.
- **fal.ai errors**: Implement exponential backoff (e.g., 3 retries with 2^n seconds) for 5xx; classify non-retriable errors (400) and surface localized message to client.
- **Timeouts**: Abort fal.ai call after configurable timeout (e.g., 60s) and mark job as `failed` with remediation instructions.

## Observability
- Attach correlation IDs to upload issuance, confirmation, and fal.ai request; log to structured logger.
- Emit metrics: `upload_issued_total`, `upload_confirmed_total`, `fal_request_success_total`, `fal_request_duration_seconds`.
- Capture S3 access logs to CloudWatch / S3 analytics for anomaly detection.

## Performance Considerations
- Pre-signed URL generation is lightweight; cache IAM credentials with STS if needed.
- Limit synchronous fal.ai processing to keep API responsive; offload to background worker if queue times increase.
- Apply image size constraints (≤16 MB per selfie) to reduce fal.ai latency and bandwidth costs.

## Localization & Accessibility
- Error messages returned by API must include locale key so the mobile app can render localized strings.
- Document optional thumbnail generation for low-bandwidth fallback.

## Security Controls Checklist
- ✅ Secrets stored in environment variables (`FAL_API_KEY`, AWS credentials via IAM roles).
- ✅ Validate all S3 keys against whitelist regex to avoid directory traversal.
- ✅ Ensure pre-signed URLs are single-use in practice by recording issuance and rejecting duplicates.
- ✅ Implement content scanning (antivirus, NSFW) via asynchronous hook when feasible.

## Future Extensions
- Replace direct fal.ai polling with webhook callbacks once available.
- Introduce CDN fronting for processed results with token-based access.
- Support resumable multipart uploads (S3 multipart + app-level coordination) for large assets.
