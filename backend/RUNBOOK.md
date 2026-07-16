# Production runbook

- Health check: `GET /healthz/` must return `{"status":"ok"}`.
- Before release: set `DJANGO_DEBUG=False`, a unique `DJANGO_SECRET_KEY`, HTTPS hostnames, SMTP, PostgreSQL, and production CORS origins.
- Bank/wallet outage: disable the affected provider through Admin payment-gateway settings; COD remains available.
- Backups: take a daily encrypted PostgreSQL backup and test a restore before launch.
- Monitoring: alert on health-check failures, 5xx rate, checkout errors, and WebSocket disconnects.
