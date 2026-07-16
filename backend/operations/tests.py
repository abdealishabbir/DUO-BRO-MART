from django.core import mail
from rest_framework.test import APITestCase
from accounts.models import User
from catalog.models import Brand, Category, Product
from .models import ChangeRequest, VendorApplication


class OperationsTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(email="admin@example.com", full_name="Admin", password="SecurePass123!")
        self.vendor = User.objects.create_user(email="vendor@example.com", full_name="Vendor", password="SecurePass123!", role="vendor", vendor_approved=True)
        category = Category.objects.create(name="Fashion")
        brand = Brand.objects.create(name="Duo")
        self.product = Product.objects.create(vendor=self.vendor, category=category, brand=brand, name="Bag", description="Bag", price="1000", stock=2, status="approved")

    def test_admin_approval_issues_vendor_credentials_email(self):
        application = VendorApplication.objects.create(full_name="New Seller", email="new@example.com", phone="03001234567", business_name="New Store", province="Sindh", city="Karachi", product_description="Bags")
        self.client.force_authenticate(self.admin)
        response = self.client.post(f"/api/admin/vendor-applications/{application.pk}/decision/", {"status": "approved"}, format="json")
        self.assertEqual(response.status_code, 200)
        user = User.objects.get(email="new@example.com")
        self.assertTrue(user.vendor_approved)
        self.assertTrue(user.must_change_password)
        self.assertEqual(len(mail.outbox), 1)

    def test_admin_settings_and_restock_request(self):
        self.client.force_authenticate(self.vendor)
        response = self.client.post("/api/vendor/requests/", {"product": self.product.pk, "kind": "restock", "value": "5"}, format="json")
        self.assertEqual(response.status_code, 201)
        request = ChangeRequest.objects.get()
        self.client.force_authenticate(self.admin)
        response = self.client.post(f"/api/admin/requests/{request.pk}/decision/", {"status": "approved"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 7)
        response = self.client.put("/api/admin/settings/", {"free_shipping_threshold": "6000", "standard_shipping_fee": "300", "express_shipping_fee": "450", "urgent_shipping_fee": "700"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["standard_shipping_fee"], "300.00")
