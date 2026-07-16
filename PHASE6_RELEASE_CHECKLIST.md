# Phase 6 release checklist

- [ ] Set production secrets, PostgreSQL, Redis, SMTP, CORS, and HTTPS hostnames.
- [ ] Run `python backend/load_test.py https://staging.example.com 100` and record p95 latency.
- [ ] Configure object-storage/CDN delivery for product and banner images.
- [ ] Configure uptime/error monitoring against `/healthz/`.
- [ ] Run `backend/scripts/backup_postgres.ps1`, restore it in staging, and record the result.
- [ ] Complete keyboard, screen-reader, 320px mobile, and major-browser QA.
- [ ] Run `DJANGO_DEBUG=False python backend/manage.py check --deploy` with production environment variables.
- [ ] Obtain an independent OWASP/pentest report before public launch.
- [ ] Pilot with 5–10 vendors, monitor checkout and error rates, then launch.
