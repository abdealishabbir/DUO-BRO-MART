# DUOBRO MART — Development Progress

This checklist follows the phase roadmap in `DUOBROMART.md`. A checked item means it has been implemented and verified in this repository; it does not mean an external service is merely planned.

## Phase 0 — Foundation & Setup

- [x] React + TypeScript + Vite storefront scaffold
- [x] Tailwind styling and shared storefront components
- [ ] Django + Django REST Framework project
- [ ] PostgreSQL schema and migrations
- [ ] Docker Compose, CI pipeline, and deployed staging API

## Phase 1 — Authentication & Roles

- [x] Customer signup/sign-in interface, including password-strength and Pakistani phone-number fields
- [x] Customer, vendor, and admin portal routes: `/login`, `/vendor/login`, `/admin/login`
- [x] Client-side role redirects and protected prototype routes for `/vendor` and `/admin`
- [ ] Django-backed customer signup/login, password hashing, verification, and password reset
- [ ] Google and Facebook OAuth
- [ ] Approved-vendor credential issue, forced password change, and real vendor authorization
- [ ] Server-enforced RBAC, JWT/refresh sessions, rate limiting, CAPTCHA, and audit logs

## Next implementation target

Create the Django + PostgreSQL API foundation so the remaining Phase 1 authentication and security requirements can be implemented safely. Browser `localStorage` is used only by the current prototype and must not be used as production authentication.
