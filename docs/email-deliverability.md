# Email Deliverability Baseline

This project now uses production-oriented SMTP templates for transactional mail.  
To keep inbox placement healthy, complete the DNS and sender checks below before go-live.

## DNS records

1. SPF
- Publish SPF for the domain and include your SMTP sender host.
- Keep a single SPF TXT record to avoid `permerror`.

2. DKIM
- Enable DKIM signing in your SMTP provider/cPanel.
- Publish the provider DKIM TXT record(s) exactly as supplied.

3. DMARC
- Publish a DMARC TXT record (start with monitoring mode):
  - `v=DMARC1; p=none; rua=mailto:dmarc@rentpropertyuae.com; fo=1`
- Move to `p=quarantine`/`p=reject` after validating alignment.

## Envelope and identity

1. Use a consistent sender:
- `SMTP_FROM=RentPropertyUAE <booking@rentpropertyuae.com>`
- optional `SMTP_REPLY_TO=info@rentpropertyuae.com`

2. Keep `BRAND_LOGO_URL` HTTPS to avoid blocked mixed content in clients.

## Operational checks

1. Verify bounce and complaint handling mailbox is active.
2. Monitor failed notification events (`GET /api/health/email/failures`).
3. Keep template content concise, with clear intent-specific subjects.
4. Avoid test-only SMTP routes in production.
