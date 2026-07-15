from rest_framework import serializers
from .models import Brand, Category, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta: model = Category; fields = ("id", "name", "slug")
class BrandSerializer(serializers.ModelSerializer):
    class Meta: model = Brand; fields = ("id", "name", "slug")
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True)
    class Meta:
        model = Product
        fields = ("id", "name", "slug", "description", "price", "stock", "image_url", "status", "category", "category_name", "brand", "brand_name", "created_at")
        read_only_fields = ("status",)
