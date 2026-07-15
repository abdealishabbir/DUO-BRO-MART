from django.urls import reverse
from django.core import mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from rest_framework.test import APITestCase
from .models import User


class AuthenticationApiTests(APITestCase):
    def test_customer_can_register_and_receive_tokens(self):
        response = self.client.post(reverse("signup"), {"full_name": "Ayesha Khan", "email": "ayesha@example.com", "phone": "03001234567", "password": "SecurePass123!"}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["user"]["role"], "customer")
        self.assertIn("access", response.data["tokens"])
        self.assertTrue(User.objects.get(email="ayesha@example.com").check_password("SecurePass123!"))

    def test_vendor_must_be_approved_before_login(self):
        vendor = User(email="seller@example.com", full_name="Seller", role=User.Role.VENDOR)
        vendor.set_password("SecurePass123!")
        vendor.save()
        response = self.client.post(reverse("login"), {"email": vendor.email, "password": "SecurePass123!", "portal": "vendor"}, format="json")
        self.assertEqual(response.status_code, 403)
        vendor.vendor_approved = True
        vendor.save(update_fields=["vendor_approved"])
        response = self.client.post(reverse("login"), {"email": vendor.email, "password": "SecurePass123!", "portal": "vendor"}, format="json")
        self.assertEqual(response.status_code, 200)

    def test_portal_role_cannot_be_crossed(self):
        user = User(email="customer@example.com", full_name="Customer")
        user.set_password("SecurePass123!")
        user.save()
        response = self.client.post(reverse("login"), {"email": user.email, "password": "SecurePass123!", "portal": "admin"}, format="json")
        self.assertEqual(response.status_code, 403)

    def test_email_verification_allows_verified_customer_login(self):
        user = User(email="verify@example.com", full_name="Verify", email_verified=False)
        user.set_password("SecurePass123!")
        user.save()
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        response = self.client.post(reverse("verify-email", args=[uid, token]))
        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.email_verified)

    def test_password_reset_sends_a_generic_response_and_changes_password(self):
        user = User(email="reset@example.com", full_name="Reset")
        user.set_password("SecurePass123!")
        user.save()
        response = self.client.post(reverse("password-reset"), {"email": user.email}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        response = self.client.post(reverse("password-reset-confirm"), {"uid": uid, "token": token, "password": "NewSecurePass123!"}, format="json")
        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewSecurePass123!"))

    def test_social_login_reports_missing_provider_configuration(self):
        response = self.client.get(reverse("social-start", args=["google"]))
        self.assertEqual(response.status_code, 503)
