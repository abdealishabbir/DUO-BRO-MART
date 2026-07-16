from django.conf import settings
from django.db import models
from catalog.models import Product
from orders.models import Order

class Banner(models.Model):
    vendor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    title = models.CharField(max_length=140); subtitle = models.CharField(max_length=240, blank=True); image_url = models.URLField(); position = models.CharField(max_length=20); cta_url = models.CharField(max_length=255); starts_at = models.DateTimeField(); expires_at = models.DateTimeField(); approved = models.BooleanField(default=False)

class Feedback(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    quality = models.PositiveSmallIntegerField(); packaging = models.PositiveSmallIntegerField(); service = models.PositiveSmallIntegerField(); overall = models.PositiveSmallIntegerField(); comment = models.TextField(blank=True)

class Complaint(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reason = models.CharField(max_length=40); description = models.TextField(); photo_url = models.URLField(blank=True); created_at = models.DateTimeField(auto_now_add=True)
