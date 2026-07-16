from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver
from catalog.models import Product

@receiver(post_save, sender=Product)
def publish_stock(sender, instance, **kwargs):
    layer = get_channel_layer()
    if layer:
        async_to_sync(layer.group_send)("stock", {"type": "stock.update", "payload": {"product_id": instance.pk, "stock": instance.stock, "status": instance.status}})
