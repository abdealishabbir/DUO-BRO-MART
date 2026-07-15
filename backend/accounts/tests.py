from django.urls import reverse
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
