from rest_framework import serializers
from .models import ChangeRequest, PlatformSettings, VendorApplication

class VendorApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorApplication
        fields = "__all__"
        read_only_fields = ("status", "created_at")

class ChangeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChangeRequest
        fields = ("id", "product", "kind", "value", "status", "created_at")
        read_only_fields = ("status", "created_at")

class PlatformSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSettings
        fields = "__all__"
