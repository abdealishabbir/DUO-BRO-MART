from rest_framework.test import APITestCase
from accounts.models import User
from catalog.models import Brand, Category, Product
from .models import Order
from .models import PaymentGateway
from django.core import mail

class CheckoutTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(email="buyer@example.com", full_name="Buyer", password="SecurePass123!")
        vendor = User.objects.create_user(email="vendor@example.com", full_name="Vendor", password="SecurePass123!", role="vendor", vendor_approved=True)
        category = Category.objects.create(name="Home")
        brand = Brand.objects.create(name="Duo")
        self.product = Product.objects.create(vendor=vendor, category=category, brand=brand, name="Lamp", description="Desk lamp", price="2000", stock=3, status="approved")
        self.client.force_authenticate(self.customer)
    def payload(self, **overrides):
        data = {"items": [{"product_id": self.product.pk, "quantity": 2}], "full_name": "Buyer", "phone": "03001234567", "province": "Sindh", "city": "Karachi", "address": "Street 1", "rural_pickup": False, "delivery_method": "standard", "payment_method": "cod"}; data.update(overrides); return data
    def test_checkout_decrements_stock_and_generates_tracking_code(self):
        response = self.client.post("/api/orders/checkout/", self.payload(), format="json")
        self.assertEqual(response.status_code, 201); self.assertTrue(response.data["code"].startswith("DBM-")); self.product.refresh_from_db(); self.assertEqual(self.product.stock, 1); self.assertEqual(Order.objects.count(), 1)
    def test_rural_pickup_requires_landmark(self):
        response = self.client.post("/api/orders/checkout/", self.payload(rural_pickup=True), format="json")
        self.assertEqual(response.status_code, 400)
    def test_stock_is_not_oversold(self):
        response = self.client.post("/api/orders/checkout/", self.payload(items=[{"product_id": self.product.pk, "quantity": 4}]), format="json")
        self.assertEqual(response.status_code, 409); self.product.refresh_from_db(); self.assertEqual(self.product.stock, 3)
    def test_disabled_gateway_and_token_requirement_are_enforced(self):
        PaymentGateway.objects.create(provider="card", enabled=False)
        response = self.client.post("/api/orders/checkout/", self.payload(payment_method="card"), format="json")
        self.assertEqual(response.status_code, 503)
        PaymentGateway.objects.update(enabled=True)
        response = self.client.post("/api/orders/checkout/", self.payload(payment_method="card"), format="json")
        self.assertEqual(response.status_code, 400)
    def test_admin_status_update_sends_delivery_email(self):
        order = Order.objects.create(customer=self.customer, full_name="Buyer", phone="03001234567", province="Sindh", city="Karachi", address="Street", delivery_method="standard", payment_method="cod", shipping_fee="250", subtotal="100", total="350")
        admin = User.objects.create_superuser(email="admin@example.com", full_name="Admin", password="SecurePass123!")
        self.client.force_authenticate(admin)
        response = self.client.post(f"/api/admin/orders/{order.pk}/status/", {"status": "shipped"}, format="json")
        self.assertEqual(response.status_code, 200); self.assertEqual(len(mail.outbox), 1)
