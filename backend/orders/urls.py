from django.urls import path
from .views import CartView, CheckoutView, GatewaySettingsView, OrderStatusView, TrackOrderView
urlpatterns = [path("cart/", CartView.as_view()), path("orders/checkout/", CheckoutView.as_view()), path("orders/track/<str:code>/", TrackOrderView.as_view()), path("admin/orders/<int:pk>/status/", OrderStatusView.as_view()), path("admin/payment-gateways/", GatewaySettingsView.as_view())]
