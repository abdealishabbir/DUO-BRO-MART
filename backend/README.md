# DUOBRO MART API

The API uses Django, Django REST Framework, JWT authentication, and PostgreSQL.

## Run locally

1. Copy `.env.example` to `.env` and set a real `DJANGO_SECRET_KEY`.
2. Start PostgreSQL and the API with `docker compose up --build`.
3. Apply migrations with `docker compose exec backend python manage.py migrate`.
4. Create the first staff account with `docker compose exec backend python manage.py createsuperuser`.

The React app calls `http://localhost:8000/api` by default. Set `VITE_API_URL` if the API is hosted elsewhere.

## Authentication endpoints

- `POST /api/auth/signup/` — customer account creation
- `POST /api/auth/login/` — customer/vendor/admin login; requires `portal`
- `GET /api/auth/me/` — current authenticated user
- `POST /api/auth/change-password/` — authenticated password change

Vendor accounts can only log in when an admin sets `vendor_approved=True`. Create staff/admin users using `createsuperuser`; the custom user model assigns them the `admin` role.
