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
- [x] Email verification and password reset API + frontend flows (console email locally; SMTP configurable)
- [ ] Google and Facebook OAuth
- [x] Vendor/admin/customer API login separation; unapproved vendors are rejected by the backend
- [x] Admin-issued vendor credentials and forced first-password change workflow
- [x] JWT refresh-token HTTP-only cookie, login throttling, and audit-log plumbing
- [x] Google/Facebook OAuth backend callbacks and frontend sign-in entry points (provider credentials required to activate)
- [ ] CAPTCHA activation — an hCaptcha/Turnstile site key and secret are required

## Next implementation target

Implement verification and recovery emails, then move browser-held JWTs to secure HttpOnly refresh-token cookies before production deployment.

## Phase 2 — Catalog & Storefront Core

- [x] PostgreSQL category, brand, and product models
- [x] Vendor submission → admin approval workflow API
- [x] Public approved-product list API, including category/brand/search filters
- [x] Live public catalog connected to the shop page with static fallback
- [x] Vendor product-submission form connected to the catalog API
- [x] Connect live catalog data to home featured products, product detail, and admin approval queue
- [ ] Complete shop filters (price, brand, rating), deals, pagination, and home carousel sections
