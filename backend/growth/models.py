import secrets
from django.conf import settings
from django.db import models

class Referral(models.Model):
    referrer = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="referral_code")
    code = models.CharField(max_length=12, unique=True, editable=False)
    uses = models.PositiveIntegerField(default=0)
    def save(self, *args, **kwargs):
        if not self.code: self.code = secrets.token_urlsafe(7).upper()[:12]
        super().save(*args, **kwargs)

class ReferralAttribution(models.Model):
    referral = models.ForeignKey(Referral, on_delete=models.CASCADE, related_name="attributions")
    customer = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    converted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
