from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import ChangePasswordSerializer, CustomerRegistrationSerializer, LoginSerializer, UserSerializer


def tokens_for(user):
    refresh = RefreshToken.for_user(user)
    refresh["role"] = user.role
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class CustomerRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomerRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"user": UserSerializer(user).data, "tokens": tokens_for(user)}, status=status.HTTP_201_CREATED)


class PortalLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(request, email=serializer.validated_data["email"], password=serializer.validated_data["password"])
        if not user or not user.is_active:
            return Response({"detail": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)
        portal = serializer.validated_data["portal"]
        if user.role != portal:
            return Response({"detail": "This account is not allowed in this portal."}, status=status.HTTP_403_FORBIDDEN)
        if user.role == User.Role.VENDOR and not user.vendor_approved:
            return Response({"detail": "Your vendor account has not been approved."}, status=status.HTTP_403_FORBIDDEN)
        return Response({"user": UserSerializer(user).data, "tokens": tokens_for(user)})


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.validated_data["current_password"]):
            return Response({"current_password": ["Incorrect password."]}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.must_change_password = False
        request.user.save(update_fields=["password", "must_change_password"])
        return Response({"detail": "Password changed successfully."})
