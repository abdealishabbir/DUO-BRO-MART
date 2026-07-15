from django.urls import path
from .views import ApproveProductView, BrandListView, CategoryListView, PublicProductsView, VendorProductsView
urlpatterns = [path("products/", PublicProductsView.as_view()), path("categories/", CategoryListView.as_view()), path("brands/", BrandListView.as_view()), path("vendor/products/", VendorProductsView.as_view()), path("admin/products/<int:pk>/approve/", ApproveProductView.as_view())]
