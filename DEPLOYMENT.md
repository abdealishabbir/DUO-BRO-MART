# Deployment handoff

## Required external setup

1. Choose a host for the React build and a host for the Docker Django/PostgreSQL/Redis stack.
2. Point `duobromart.com` and `www.duobromart.com` to the frontend host; point the API hostname to the backend host.
3. Set production environment variables from `backend/.env.example`, including a unique secret, PostgreSQL, Redis, SMTP, CORS, allowed hosts, OAuth, CAPTCHA, and payment credentials.
4. Run `docker compose up -d --build`, then `docker compose exec backend python manage.py migrate`.
5. Configure TLS, monitoring against `/healthz/`, object storage/CDN, and daily encrypted PostgreSQL backups.

## Release commands

```powershell
npm run typecheck
npm run lint
npm run build
py backend/manage.py test accounts catalog orders operations engagement growth
```

Never commit `backend/.env` or merchant/OAuth/SMTP secrets.
