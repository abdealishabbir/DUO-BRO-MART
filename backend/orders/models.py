import uuid
from django.conf import settings
from django.db import models
from catalog.models import Product

class Cart(models.Model):
    customer = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart")
    updated_at = models.DateTimeField(auto_now=True)
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    class Meta: unique_together = (("cart", "product"),)

class Order(models.Model):
    class Status(models.TextChoices): PENDING = "pending", "Pending"; CONFIRMED = "confirmed", "Confirmed"; SHIPPED = "shipped", "Shipped"; DELIVERED = "delivered", "Delivered"; CANCELLED = "cancelled", "Cancelled"
    class PaymentMethod(models.TextChoices): COD = "cod", "Cash on Delivery"; CARD = "card", "Card"; EASYPaisa = "easypaisa", "Easypaisa"; JAZZCASH = "jazzcash", "JazzCash"; NAYAPAY = "nayapay", "NayaPay"
    code = models.CharField(max_length=20, unique=True, editable=False)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders")
    full_name = models.CharField(max_length=150); phone = models.CharField(max_length=20)
    province = models.CharField(max_length=80); city = models.CharField(max_length=80); address = models.TextField()
    rural_pickup = models.BooleanField(default=False); landmark = models.CharField(max_length=200, blank=True)
    delivery_method = models.CharField(max_length=20); shipping_fee = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=12, choices=PaymentMethod.choices)
    payment_token = models.CharField(max_length=255, blank=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2); total = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    def save(self, *args, **kwargs):
        if not self.code: self.code = f"DBM-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=180); unit_price = models.DecimalField(max_digits=12, decimal_places=2); quantity = models.PositiveIntegerField()

class PaymentGateway(models.Model):
    provider = models.CharField(max_length=20, unique=True)
    enabled = models.BooleanField(default=True)
    public_key = models.CharField(max_length=255, blank=True)
    secret_key = models.CharField(max_length=255, blank=True)
