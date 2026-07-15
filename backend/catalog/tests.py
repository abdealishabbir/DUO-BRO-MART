from rest_framework.test import APITestCase
from accounts.models import User
from .models import Brand, Category, Product


class CatalogWorkflowTests(APITestCase):
    def setUp(self):
        self.vendor = User.objects.create_user(email="vendor@example.com", full_name="Vendor", password="SecurePass123!", role=User.Role.VENDOR, vendor_approved=True)
        self.category = Category.objects.create(name="Fashion")
        self.brand = Brand.objects.create(name="Duo Brand")

    def test_vendor_submission_is_hidden_until_staff_approval(self):
        self.client.force_authenticate(self.vendor)
        response = self.client.post("/api/vendor/products/", {"name": "Approved Bag", "description": "A quality bag", "price": "1200.00", "stock": 5, "category": self.category.pk, "brand": self.brand.pk}, format="json")
        self.assertEqual(response.status_code, 201)
        product = Product.objects.get()
        self.assertEqual(product.status, Product.Status.PENDING)
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get("/api/products/").data["results"], [])
        admin = User.objects.create_superuser(email="admin@example.com", full_name="Admin", password="SecurePass123!")
        self.client.force_authenticate(admin)
        self.assertEqual(self.client.post(f"/api/admin/products/{product.pk}/approve/").status_code, 200)
        self.client.force_authenticate(user=None)
        self.assertEqual(len(self.client.get("/api/products/").data["results"]), 1)

    def test_public_filters_and_pagination_only_return_matching_approved_products(self):
        Product.objects.create(vendor=self.vendor, category=self.category, brand=self.brand, name="Premium Bag", description="Rated bag", price="2500.00", stock=3, status=Product.Status.APPROVED, average_rating="4.50")
        Product.objects.create(vendor=self.vendor, category=self.category, brand=self.brand, name="Budget Bag", description="Basic bag", price="500.00", stock=3, status=Product.Status.APPROVED, average_rating="2.00")
        response = self.client.get("/api/products/?min_price=1000&min_rating=4&category=fashion&brand=duo-brand")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Premium Bag")
