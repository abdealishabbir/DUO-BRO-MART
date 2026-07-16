from rest_framework import serializers
from .models import Banner, Complaint, Feedback
class BannerSerializer(serializers.ModelSerializer):
    class Meta: model = Banner; fields = "__all__"; read_only_fields = ("approved", "vendor")
class FeedbackSerializer(serializers.ModelSerializer):
    class Meta: model = Feedback; fields = ("product", "quality", "packaging", "service", "overall", "comment")
class ComplaintSerializer(serializers.ModelSerializer):
    class Meta: model = Complaint; fields = ("reason", "description", "photo_url")
