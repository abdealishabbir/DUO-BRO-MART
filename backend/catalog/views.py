from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import User
from .models import Brand, Category, Product
from .serializers import BrandSerializer, CategorySerializer, ProductSerializer

class PublicProductsView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        qs = Product.objects.filter(status=Product.Status.APPROVED, stock__gt=0).select_related("category", "brand")
        if category := self.request.query_params.get("category"): qs = qs.filter(category__slug=category)
        if brand := self.request.query_params.get("brand"): qs = qs.filter(brand__slug=brand)
        if self.request.query_params.get("deals") == "true": qs = qs.filter(is_flash_deal=True)
        if q := self.request.query_params.get("q"): qs = qs.filter(name__icontains=q)
        if minimum := self.request.query_params.get("min_price"): qs = qs.filter(price__gte=minimum)
        if maximum := self.request.query_params.get("max_price"): qs = qs.filter(price__lte=maximum)
        if rating := self.request.query_params.get("min_rating"): qs = qs.filter(average_rating__gte=rating)
        return qs

class PublicProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"
    queryset = Product.objects.filter(status=Product.Status.APPROVED, stock__gt=0).select_related("category", "brand")

class PublicProductByIdView(PublicProductDetailView):
    lookup_field = "pk"

class CategoryListView(generics.ListAPIView): serializer_class = CategorySerializer; permission_classes = [permissions.AllowAny]; queryset = Category.objects.all()
class BrandListView(generics.ListAPIView): serializer_class = BrandSerializer; permission_classes = [permissions.AllowAny]; queryset = Brand.objects.all()

class VendorProductsView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    def get_queryset(self): return Product.objects.filter(vendor=self.request.user).select_related("category", "brand")
    def perform_create(self, serializer):
        if self.request.user.role != User.Role.VENDOR or not self.request.user.vendor_approved: raise permissions.PermissionDenied("Approved vendor access required.")
        serializer.save(vendor=self.request.user, status=Product.Status.PENDING)

class VendorProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    def get_queryset(self): return Product.objects.filter(vendor=self.request.user)
    def perform_update(self, serializer): serializer.save(status=Product.Status.PENDING)

class AdminProductsView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Product.objects.select_related("category", "brand", "vendor")

class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Product.objects.all()

class ApproveProductView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        product.status = Product.Status.APPROVED
        product.save(update_fields=["status", "updated_at"])
        return Response(ProductSerializer(product).data)

class HomeCatalogView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        base = Product.objects.filter(status=Product.Status.APPROVED, stock__gt=0).select_related("category", "brand")
        return Response({"categories": CategorySerializer(Category.objects.all(), many=True).data, "flash_deals": ProductSerializer(base.filter(is_flash_deal=True)[:8], many=True).data, "featured": ProductSerializer(base.filter(is_featured=True)[:8], many=True).data, "new_arrivals": ProductSerializer(base.order_by("-created_at")[:8], many=True).data})
