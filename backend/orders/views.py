from decimal import Decimal
from django.core.mail import send_mail
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from catalog.models import Product
from .models import Cart, CartItem, Order, OrderItem, PaymentGateway
from .serializers import CartItemInputSerializer, CheckoutSerializer

DELIVERY_FEES = {"standard": Decimal("250"), "express": Decimal("400"), "urgent": Decimal("650")}

class CartView(APIView):
    def get(self, request):
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        return Response({"items": [{"product_id": item.product_id, "name": item.product.name, "price": str(item.product.price), "quantity": item.quantity, "stock": item.product.stock} for item in cart.items.select_related("product")]})
    def post(self, request):
        serializer = CartItemInputSerializer(data=request.data); serializer.is_valid(raise_exception=True)
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        product = get_object_or_404(Product, pk=serializer.validated_data["product_id"], status=Product.Status.APPROVED)
        item, _ = CartItem.objects.update_or_create(cart=cart, product=product, defaults={"quantity": serializer.validated_data["quantity"]})
        return Response({"product_id": item.product_id, "quantity": item.quantity})
    def put(self, request):
        serializer = CartItemInputSerializer(data=request.data, many=True); serializer.is_valid(raise_exception=True)
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        cart.items.all().delete()
        products = {product.pk: product for product in Product.objects.filter(pk__in=[item["product_id"] for item in serializer.validated_data], status=Product.Status.APPROVED)}
        CartItem.objects.bulk_create([CartItem(cart=cart, product=products[item["product_id"]], quantity=item["quantity"]) for item in serializer.validated_data if item["product_id"] in products])
        return self.get(request)

class CheckoutView(APIView):
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data); serializer.is_valid(raise_exception=True); data = serializer.validated_data
        gateway = PaymentGateway.objects.filter(provider=data["payment_method"]).first()
        if gateway and not gateway.enabled: return Response({"detail": "This payment method is temporarily unavailable."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        if data["payment_method"] != "cod" and not data.get("payment_token"):
            return Response({"detail": "A gateway-issued payment token is required; card details are never accepted by this API."}, status=status.HTTP_400_BAD_REQUEST)
        with transaction.atomic():
            product_ids = [item["product_id"] for item in data["items"]]
            products = {product.pk: product for product in Product.objects.select_for_update().filter(pk__in=product_ids, status=Product.Status.APPROVED)}
            subtotal = Decimal("0"); order_items = []
            for item in data["items"]:
                product = products.get(item["product_id"])
                if not product or product.stock < item["quantity"]: return Response({"detail": "One or more products are unavailable."}, status=status.HTTP_409_CONFLICT)
                product.stock -= item["quantity"]; product.save(update_fields=["stock"])
                subtotal += product.price * item["quantity"]; order_items.append((product, item["quantity"]))
            fee = DELIVERY_FEES[data["delivery_method"]]
            if subtotal >= Decimal("5000"): fee = Decimal("0")
            order_data = {key: data[key] for key in ("full_name", "phone", "province", "city", "address", "rural_pickup", "delivery_method", "payment_method")}
            order_data["landmark"] = data.get("landmark", ""); order_data["payment_token"] = data.get("payment_token", "")
            order = Order.objects.create(customer=request.user, subtotal=subtotal, total=subtotal + fee, shipping_fee=fee, **order_data)
            OrderItem.objects.bulk_create([OrderItem(order=order, product=product, product_name=product.name, unit_price=product.price, quantity=quantity) for product, quantity in order_items])
        send_mail(f"Order {order.code} confirmed", f"Thank you {order.full_name}. Your order total is PKR {order.total}.", "no-reply@duobromart.pk", [request.user.email])
        return Response({"code": order.code, "total": str(order.total), "status": order.status}, status=status.HTTP_201_CREATED)

class TrackOrderView(APIView):
    permission_classes = []
    authentication_classes = []
    def get(self, request, code):
        order = get_object_or_404(Order, code=code)
        return Response({"code": order.code, "status": order.status, "delivery_method": order.delivery_method, "created_at": order.created_at})

class OrderStatusView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        value = request.data.get("status")
        if value not in Order.Status.values: return Response({"detail": "Invalid order status."}, status=status.HTTP_400_BAD_REQUEST)
        order.status = value; order.save(update_fields=["status"])
        if value in (Order.Status.SHIPPED, Order.Status.DELIVERED): send_mail(f"Order {order.code} {value}", f"Your DUOBRO MART order is now {value}.", "no-reply@duobromart.pk", [order.customer.email])
        return Response({"code": order.code, "status": order.status})

class GatewaySettingsView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request): return Response([{"provider": item.provider, "enabled": item.enabled, "public_key": item.public_key} for item in PaymentGateway.objects.all()])
    def post(self, request):
        provider = request.data.get("provider"); enabled = request.data.get("enabled")
        if provider not in Order.PaymentMethod.values: return Response({"detail": "Invalid provider."}, status=status.HTTP_400_BAD_REQUEST)
        gateway, _ = PaymentGateway.objects.get_or_create(provider=provider)
        gateway.enabled = bool(enabled); gateway.save(update_fields=["enabled"])
        return Response({"provider": gateway.provider, "enabled": gateway.enabled})
