import secrets
from django.core.mail import send_mail
from django.db.models import Sum
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import User
from catalog.models import Product
from orders.models import Order
from .models import ChangeRequest, PlatformSettings, VendorApplication
from .serializers import ChangeRequestSerializer, PlatformSettingsSerializer, VendorApplicationSerializer

class VendorApplicationView(generics.CreateAPIView):
    serializer_class = VendorApplicationSerializer
    permission_classes = [permissions.AllowAny]

class VendorRequestsView(generics.ListCreateAPIView):
    serializer_class = ChangeRequestSerializer
    def get_queryset(self): return ChangeRequest.objects.filter(vendor=self.request.user)
    def perform_create(self, serializer): serializer.save(vendor=self.request.user)

class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def get(self, request):
        return Response({"orders": Order.objects.count(), "revenue": Order.objects.filter(status="delivered").aggregate(total=Sum("total"))["total"] or 0, "pending_products": Product.objects.filter(status="pending").count(), "pending_vendors": VendorApplication.objects.filter(status="pending").count(), "active_vendors": User.objects.filter(role="vendor", vendor_approved=True).count()})

class AdminVendorApplicationsView(generics.ListAPIView):
    serializer_class = VendorApplicationSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = VendorApplication.objects.all()

class AdminVendorDecisionView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request, pk):
        application = VendorApplication.objects.get(pk=pk); decision = request.data.get("status")
        if decision not in ("approved", "rejected"): return Response({"detail": "Invalid decision."}, status=400)
        application.status = decision; application.save(update_fields=["status"])
        if decision == "approved":
            temporary_password = secrets.token_urlsafe(12)
            vendor, _ = User.objects.get_or_create(email=application.email, defaults={"full_name": application.full_name, "phone": application.phone, "role": "vendor", "vendor_approved": True, "must_change_password": True})
            vendor.role = "vendor"; vendor.vendor_approved = True; vendor.must_change_password = True; vendor.set_password(temporary_password); vendor.save()
            send_mail("DUOBRO MART vendor account approved", f"Your account is approved. Temporary password: {temporary_password}", "no-reply@duobromart.pk", [vendor.email])
        return Response(VendorApplicationSerializer(application).data)

class PlatformSettingsView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def get(self, request):
        settings, _ = PlatformSettings.objects.get_or_create(pk=1)
        return Response(PlatformSettingsSerializer(settings).data)
    def put(self, request):
        settings, _ = PlatformSettings.objects.get_or_create(pk=1)
        serializer = PlatformSettingsSerializer(settings, data=request.data); serializer.is_valid(raise_exception=True); serializer.save()
        return Response(serializer.data)

class AdminRequestDecisionView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request, pk):
        item = ChangeRequest.objects.get(pk=pk); decision = request.data.get("status")
        if decision not in ("approved", "rejected"): return Response({"detail": "Invalid decision."}, status=400)
        item.status = decision; item.save(update_fields=["status"])
        if decision == "approved":
            if item.kind == "restock": item.product.stock += int(item.value); item.product.save(update_fields=["stock"])
            if item.kind == "price": item.product.price = item.value; item.product.save(update_fields=["price"])
        return Response(ChangeRequestSerializer(item).data)

class AdminRequestsView(generics.ListAPIView):
    serializer_class = ChangeRequestSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = ChangeRequest.objects.all()
