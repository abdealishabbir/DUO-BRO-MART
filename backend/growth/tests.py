from rest_framework.test import APITestCase
from accounts.models import User
from .models import ReferralAttribution

class ReferralTests(APITestCase):
    def setUp(self):
        self.referrer = User.objects.create_user(email="referrer@example.com", full_name="Referrer", password="SecurePass123!")
        self.customer = User.objects.create_user(email="customer@example.com", full_name="Customer", password="SecurePass123!")
    def test_referral_code_and_attribution(self):
        self.client.force_authenticate(self.referrer)
        response = self.client.get("/api/growth/referral/")
        self.assertEqual(response.status_code, 200)
        code = response.data["code"]
        self.client.force_authenticate(self.customer)
        response = self.client.post("/api/growth/referral/apply/", {"code": code}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(ReferralAttribution.objects.count(), 1)
