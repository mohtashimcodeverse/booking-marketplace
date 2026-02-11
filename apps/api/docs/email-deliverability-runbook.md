# Email Deliverability + SMTP Runbook

## cPanel deliverability setup (rentpropertyuae.com)

1. Open cPanel for `rentpropertyuae.com`.
2. Go to `Email` -> `Email Deliverability`.
3. Verify SPF is `Valid`.
4. Verify DKIM is `Valid`.
5. If either is invalid, use cPanel's `Repair` action and wait for DNS propagation.

## DMARC recommendation (DNS, optional but strongly recommended)

Start with monitoring mode first:

- Host/Name: `_dmarc.rentpropertyuae.com`
- Type: `TXT`
- Value:
  `"v=DMARC1; p=none; rua=mailto:dmarc@rentpropertyuae.com; adkim=s; aspf=s; fo=1"`

After monitoring and cleanup, tighten policy:

1. Move to `p=quarantine`
2. Move to `p=reject`

## Platform notes (outbound SMTP blocking)

Some hosting platforms block outbound SMTP ports `25/465/587` on lower/free plans.

If SMTP delivery fails with connection/network errors despite correct credentials:

1. Confirm provider allows outbound SMTP on your plan.
2. Upgrade instance/network tier if blocked.
3. If blocking cannot be removed, switch delivery to API-based providers (Postmark/SendGrid/etc.).

## SMTP env vars (production)

Set in production runtime:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_REPLY_TO`
- `BRAND_LOGO_URL` (must be HTTPS)

Optional transport tuning:

- `SMTP_MAX_CONNECTIONS` (default `2`)
- `SMTP_MAX_MESSAGES` (default `50`)
- `SMTP_RATE_DELTA` (default `1000`)
- `SMTP_RATE_LIMIT` (default `5`)
- `SMTP_CONNECTION_TIMEOUT_MS` (default `15000`)
- `SMTP_GREETING_TIMEOUT_MS` (default `15000`)
- `SMTP_SOCKET_TIMEOUT_MS` (default `20000`)

## Production verification checklist

1. Apply migrations:
   `pnpm --filter api prisma migrate deploy`
2. Confirm env vars are set correctly.
3. Trigger admin test:
   `POST /api/health/email` with body `{ "to": "<your email>" }`
4. Confirm outbox event transitions:
   `PENDING -> SENT` (or `FAILED` with `lastError`)
5. Confirm message delivery:
   check Inbox and Spam folders.
6. Confirm cPanel `Email Deliverability` shows SPF and DKIM as `Valid`.
