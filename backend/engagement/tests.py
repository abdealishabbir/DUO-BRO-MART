from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APITestCase
from accounts.models import User
from catalog.models import Brand, Category, Product
from orders.models import Order, OrderItem
from .models import Banner, Feedback

class EngagementTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(email="buyer@example.com", full_name="Buyer", password="SecurePass123!")
        vendor = User.objects.create_user(email="vendor@example.com", full_name="Vendor", password="SecurePass123!", role="vendor", vendor_approved=True)
        category = Category.objects.create(name="Home"); brand = Brand.objects.create(name="Duo")
        self.product = Product.objects.create(vendor=vendor, category=category, brand=brand, name="Lamp", description="Lamp", price="100", stock=2, status="approved")
        self.order = Order.objects.create(customer=self.customer, full_name="Buyer", phone="03001234567", province="Sindh", city="Karachi", address="Street", delivery_method="standard", payment_method="cod", shipping_fee="250", subtotal="100", total="350", status="delivered")
        OrderItem.objects.create(order=self.order, product=self.product, product_name="Lamp", unit_price="100", quantity=1)
    def test_delivered_feedback_updates_product_rating(self):
        self.client.force_authenticate(self.customer)
        response = self.client.post(f"/api/feedback/{self.order.code}/", {"product": self.product.pk, "quality": 5, "packaging": 4, "service": 5, "overall": 5, "comment": "Great"}, format="json")
        self.assertEqual(response.status_code, 201); self.product.refresh_from_db(); self.assertEqual(str(self.product.average_rating), "5.00")
    def test_approved_active_banner_is_public(self):
        Banner.objects.create(title="Deal", image_url="https://example.com/a.jpg", position="hero", cta_url="/shop", starts_at=timezone.now() - timedelta(hours=1), expires_at=timezone.now() + timedelta(hours=1), approved=True)
        self.assertEqual(len(self.client.get("/api/banners/").data["results"]), 1)
