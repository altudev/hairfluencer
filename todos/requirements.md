# Secure Upload & fal.ai Hand-off Requirements

## Overview
Implement a secure, privacy-aware image upload pipeline that stores user selfies in AWS S3 via pre-signed URLs and enables the backend to invoke fal.ai's `nano-banana/edit` model using time-bound URLs. The solution must minimize exposure of secrets, enforce validation, and support the try-on flow defined in the Hairfluencer PRD.

## User Stories

### US1 – Secure Direct Upload
As an authenticated mobile user, I want to upload my selfie directly to secure cloud storage so that I can generate AI hairstyles without my photo being publicly exposed.

**Acceptance Criteria**
- GIVEN the user is authenticated
  - WHEN the client requests an upload URL
  - THEN the API issues a single-use, 5-minute pre-signed S3 URL scoped to that user and limited to `image/*` content types.
- GIVEN the pre-signed URL is used within its TTL
  - WHEN the client PUTs an image <= 16 MB
  - THEN S3 accepts the upload and stores it under the user's prefix.
- GIVEN an invalid or expired URL
  - WHEN an upload is attempted
  - THEN the request is rejected and the client receives a retriable error.

### US2 – Server-Side Verification & Ownership
As the backend service, I want to confirm uploads belong to the requesting user so that untrusted clients cannot submit arbitrary S3 keys or reuse other users' images.

**Acceptance Criteria**
- GIVEN the client reports an uploaded object key
  - WHEN the API receives the key
  - THEN it verifies the key prefix matches the authenticated user/session and the object metadata (size, content-type) is within limits.
- GIVEN the object fails validation or face detection
  - WHEN the API inspects it
  - THEN it rejects the request, logs the reason, and deletes the object.
- GIVEN validation succeeds
  - WHEN the API persists the upload record
  - THEN it stores metadata (userId, key, checksum, createdAt, TTL) for follow-up processing and cleanup.

### US3 – fal.ai Invocation with Ephemeral URLs
As the hairstyle generation service, I want to provide fal.ai with a short-lived URL so that the transformation can occur without exposing S3 objects publicly.

**Acceptance Criteria**
- GIVEN a validated upload record
  - WHEN the client submits a try-on request with the desired style prompt
  - THEN the backend generates a new pre-signed GET URL with ≤5 minute TTL against the private uploads bucket and invokes fal.ai using `image_urls` that contain only those signed links.
- GIVEN a successful fal.ai response
  - WHEN the backend persists the result asset
  - THEN it stores the output in the dedicated processed bucket under the user's namespace with the configured lifecycle policy.
- GIVEN the fal.ai call succeeds
  - WHEN the job completes
  - THEN the backend stores the result metadata, associates it with the user, and schedules expiration for the source image per retention policy.
- GIVEN the fal.ai call fails or times out
  - WHEN the backend processes the response
  - THEN it retries within configured limits and surfaces actionable errors to the client without leaking the signed URL.

## Non-Goals
- Serving uploads directly from S3 to clients without auth mediation.
- Persisting pre-signed URLs beyond their TTL or exposing S3 bucket names to end users.
- Implementing long-term archival of source images (handled by retention policies outside MVP scope).

## Dependencies
- AWS account with private S3 bucket and IAM roles (API, background workers, cleanup jobs).
- fal.ai credentials already provisioned via `FAL_API_KEY`.
- Mobile client capable of uploading via pre-signed URLs and reporting results.
- Better Auth configured end-to-end (API + mobile) so that upload endpoints receive authenticated requests.

## Compliance & Privacy Requirements
- All personal data (selfies) must be encrypted at rest (SSE-S3 or SSE-KMS) and in transit (HTTPS).
- Retain selfies only for the minimum duration required for processing unless the user favorites a result.
- Provide audit logs for upload issuance, validation, fal.ai invocation, and deletion events.

## Resolved Decisions
- Maximum selfie size for uploads is capped at **16 MB**.
- Resumable uploads are **not required** for the MVP.
- fal.ai result assets will be stored in a dedicated **processed bucket** with its own lifecycle policy.
