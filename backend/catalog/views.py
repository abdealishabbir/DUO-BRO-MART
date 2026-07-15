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
        for key, field in (("category", "category__slug"), ("brand", "brand__slug")):
            if value := self.request.query_params.get(key): qs = qs.filter(**{field: value})
        if q := self.request.query_params.get("q"): qs = qs.filter(name__icontains=q)
        return qs
class CategoryListView(generics.ListAPIView): serializer_class = CategorySerializer; permission_classes = [permissions.AllowAny]; queryset = Category.objects.all()
class BrandListView(generics.ListAPIView): serializer_class = BrandSerializer; permission_classes = [permissions.AllowAny]; queryset = Brand.objects.all()
class VendorProductsView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    def get_queryset(self): return Product.objects.filter(vendor=self.request.user).select_related("category", "brand")
    def perform_create(self, serializer):
        if self.request.user.role != User.Role.VENDOR or not self.request.user.vendor_approved: raise permissions.PermissionDenied("Approved vendor access required.")
        serializer.save(vendor=self.request.user, status=Product.Status.PENDING)
class ApproveProductView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request, pk):
        product = generics.get_object_or_404(Product, pk=pk)
        product.status = Product.Status.APPROVED
        product.save(update_fields=["status", "updated_at"])
        return Response(ProductSerializer(product).data)
