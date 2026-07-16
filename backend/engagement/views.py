from django.db.models import Avg
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from orders.models import Order
from .models import Banner, Complaint, Feedback
from .serializers import BannerSerializer, ComplaintSerializer, FeedbackSerializer

class PublicBannersView(generics.ListAPIView):
    serializer_class = BannerSerializer; permission_classes = [permissions.AllowAny]
    def get_queryset(self): return Banner.objects.filter(approved=True, starts_at__lte=timezone.now(), expires_at__gt=timezone.now())
class VendorBannersView(generics.ListCreateAPIView):
    serializer_class = BannerSerializer
    def get_queryset(self): return Banner.objects.filter(vendor=self.request.user)
    def perform_create(self, serializer): serializer.save(vendor=self.request.user)
class AdminBannerDecisionView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request, pk):
        banner = Banner.objects.get(pk=pk); banner.approved = bool(request.data.get("approved")); banner.save(update_fields=["approved"]); return Response(BannerSerializer(banner).data)
class FeedbackView(APIView):
    def post(self, request, code):
        order = Order.objects.get(code=code, customer=request.user, status="delivered")
        serializer = FeedbackSerializer(data=request.data); serializer.is_valid(raise_exception=True)
        product = order.items.first().product
        item = Feedback.objects.create(order=order, product=product, customer=request.user, **serializer.validated_data)
        product.average_rating = Feedback.objects.filter(product=product).aggregate(value=Avg("overall"))["value"] or 0; product.save(update_fields=["average_rating"])
        return Response({"id": item.pk}, status=201)
class ComplaintView(APIView):
    def post(self, request, code):
        order = Order.objects.get(code=code, customer=request.user, status="delivered")
        serializer = ComplaintSerializer(data=request.data); serializer.is_valid(raise_exception=True)
        item = Complaint.objects.create(order=order, customer=request.user, **serializer.validated_data)
        return Response({"id": item.pk}, status=201)
