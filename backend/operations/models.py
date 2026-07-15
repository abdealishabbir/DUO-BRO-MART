from django.conf import settings
from django.db import models
from catalog.models import Product

class VendorApplication(models.Model):
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    business_name = models.CharField(max_length=160)
    province = models.CharField(max_length=80)
    city = models.CharField(max_length=80)
    product_description = models.TextField()
    cnic_reference = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=10, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

class ChangeRequest(models.Model):
    vendor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    kind = models.CharField(max_length=10)
    value = models.CharField(max_length=100)
    status = models.CharField(max_length=10, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

class PlatformSettings(models.Model):
    free_shipping_threshold = models.DecimalField(max_digits=12, decimal_places=2, default=5000)
    standard_shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=250)
    express_shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=400)
    urgent_shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=650)
