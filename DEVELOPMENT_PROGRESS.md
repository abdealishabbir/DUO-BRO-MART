# DUOBRO MART — Development Progress

This checklist follows the phase roadmap in `DUOBROMART.md`. A checked item means it has been implemented and verified in this repository; it does not mean an external service is merely planned.

## Phase 0 — Foundation & Setup

- [x] React + TypeScript + Vite storefront scaffold
- [x] Tailwind styling and shared storefront components
- [x] Django + Django REST Framework project
- [x] PostgreSQL database configuration and local Docker Compose service
- [ ] Docker Compose, CI pipeline, and deployed staging API

## Phase 1 — Authentication & Roles

- [x] Customer signup/sign-in interface, including password-strength and Pakistani phone-number fields
- [x] Customer, vendor, and admin portal routes: `/login`, `/vendor/login`, `/admin/login`
- [x] Client-side role redirects and protected prototype routes for `/vendor` and `/admin`
- [x] Django-backed customer signup/login and password hashing with JWT API endpoints
- [ ] Email verification and password reset delivery
- [ ] Google and Facebook OAuth
- [x] Vendor/admin/customer API login separation; unapproved vendors are rejected by the backend
- [ ] Admin-issued vendor credentials and forced first-password change workflow
- [ ] Server-enforced RBAC, JWT/refresh sessions, rate limiting, CAPTCHA, and audit logs

## Next implementation target

Implement verification and recovery emails, then move browser-held JWTs to secure HttpOnly refresh-token cookies before production deployment.
