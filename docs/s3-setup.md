# AWS S3 Setup Guide (Hairfluencer)

This guide covers the manual infrastructure steps required before enabling the secure upload flow.

## 1. Buckets

Create two private buckets in the target AWS account (replace `env` with environment name):

- `hairfluencer-uploads-env` – temporary raw selfies.
- `hairfluencer-processed-env` – processed hairstyle results.

Recommended settings:
- **Block Public Access**: Enabled (all four options).
- **Default Encryption**: SSE-S3. Upgrade to SSE-KMS when keys are available.
- **Bucket Versioning**: Off (optional for MVP).
- **Object Ownership**: Bucket owner enforced.

### Lifecycle Rules

Uploads bucket:
- Expire objects after 1 day.
- Optionally abort incomplete multipart uploads after 1 day.

Processed bucket:
- Expire objects after 7 days.
- Keep favorite assets by tagging them and adding an exception rule (future enhancement).

## 2. IAM Role/Policy

Create an IAM role assumed by the API (or ECS/Lambda/etc.) with the following scoped policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObject",
        "s3:GetObjectTagging",
        "s3:PutObjectTagging",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::hairfluencer-uploads-env",
        "arn:aws:s3:::hairfluencer-uploads-env/*",
        "arn:aws:s3:::hairfluencer-processed-env",
        "arn:aws:s3:::hairfluencer-processed-env/*"
      ]
    }
  ]
}
```

If the API runs outside AWS, provision access keys with the same scoped policy and load them via secret manager or environment variables.

## 3. Environment Variables

Populate the new `.env` entries with the buckets/region:

```
AWS_REGION=us-east-1
AWS_S3_UPLOAD_BUCKET=hairfluencer-uploads-env
AWS_S3_PROCESSED_BUCKET=hairfluencer-processed-env
S3_MAX_UPLOAD_BYTES=16777216
S3_UPLOAD_URL_TTL_SECONDS=300
S3_DOWNLOAD_URL_TTL_SECONDS=300
S3_UPLOAD_RETENTION_HOURS=24
S3_RESULT_RETENTION_DAYS=7
S3_MAX_RETRY_ATTEMPTS=3
S3_RETRY_BACKOFF_SECONDS=2
```

Adjust TTLs and sizes only if mobile app requirements change.

## 4. Verification Checklist

- [ ] Buckets created and private access confirmed.
- [ ] Lifecycle rules enabled (1 day for uploads, 7 days for processed results).
- [ ] IAM role/policy deployed and attached to API runtime.
- [ ] Environment variables added to deployment pipeline.
- [ ] Test `HeadObject` against each bucket to confirm permissions.

Once the checklist is complete, proceed with the API implementation tasks (M2+) to issue pre-signed URLs and orchestrate fal.ai calls.
