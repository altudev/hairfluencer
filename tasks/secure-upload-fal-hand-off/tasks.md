# Implementation Plan – Secure Upload & fal.ai Hand-off

## Objective
Deliver the secure S3 upload workflow and fal.ai invocation flow described in `todos/requirements.md` and `todos/design.md`, enabling private selfie storage and AI hairstyle generation without exposing secrets or public URLs.

**Prerequisite:** Better Auth must be configured in the API and mobile app so that all upload-related routes receive authenticated requests.

## Milestones & Tasks
- [ ] **M1: Infrastructure & Configuration**
  - [ ] Create private S3 bucket (or reuse existing) with uploads/results prefixes and lifecycle rules.
  - [ ] Provision IAM role/policy scoped to required S3 actions; wire into API deployment.
  - [ ] Expose bucket/key env vars via Secret Manager or `.env` placeholders.
  - [ ] Add configuration entries for 16 MB max upload size, TTL, and retry counts (`US1`).

- [ ] **M2: API Upload Issuance (`US1`)**
  - [ ] Add authenticated POST `/api/uploads/presign` handler that validates quotas and generates pre-signed PUT URLs.
  - [ ] Implement request/response schemas and integration tests with mocked S3 signer.
  - [ ] Log issuance events with correlation IDs and audit trail.

- [ ] **M3: Upload Confirmation & Validation (`US2`)**
  - [ ] Implement POST `/api/uploads/confirm` to verify S3 object (HeadObject), check metadata, run face-detection stub, and persist record.
  - [ ] Add cleanup logic to delete invalid uploads and emit structured errors.
  - [ ] Document expected client contract (key reporting, retries).

- [ ] **M4: fal.ai Orchestration (`US3`)**
  - [ ] Extend try-on route/service to fetch upload record, mint GET pre-signed URL, and call fal.ai via `@fal-ai/client`.
  - [ ] Implement retry/backoff strategy and status tracking fields in DB.
  - [ ] Persist result metadata, store processed assets in dedicated bucket, and clean up source image per retention rules.

- [ ] **M5: Observability & Hardening**
  - [ ] Emit metrics/logs for each flow step; hook into existing monitoring if available.
  - [ ] Add rate limiting, request size validation, and S3 key whitelist checks.
  - [ ] Introduce scheduled job (or placeholder) for deleting expired uploads/results.

- [ ] **M6: QA & Documentation**
  - [ ] Run manual flow test (mobile client or curl) covering happy path and failure scenarios.
  - [ ] Update `docs/hairfluencer-PRD.md` or relevant runbooks with new flow overview.
  - [ ] Capture follow-up tasks (e.g., antivirus scanning) in backlog if deferred.

## Dependencies & Assumptions
- fal.ai credentials present and working (`FAL_API_KEY`).
- Mobile client can handle pre-signed uploads and localized error codes.
- Face detection service is either available or stubbed with clear TODO.

## Exit Criteria
- All milestones above checked off in repo with code/tests.
- Acceptance tests mapped to `US1`, `US2`, `US3` pass.
- Security review sign-off on S3 policies and fal.ai request flow.
