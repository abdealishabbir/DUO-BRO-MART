from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.shortcuts import redirect
from django.core import signing
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import json
from .models import AuditLog, User
from .serializers import ChangePasswordSerializer, CustomerRegistrationSerializer, EmailSerializer, LoginSerializer, PasswordResetConfirmSerializer, UserSerializer, VendorCredentialSerializer


def audit(action, entity, entity_id="", actor=None, **metadata):
    AuditLog.objects.create(actor=actor, action=action, entity=entity, entity_id=str(entity_id), metadata=metadata)


def issue_auth_response(user, response_status=status.HTTP_200_OK):
    refresh = RefreshToken.for_user(user)
    refresh["role"] = user.role
    response = Response({"user": UserSerializer(user).data, "tokens": {"access": str(refresh.access_token)}}, status=response_status)
    response.set_cookie("duobro_refresh", str(refresh), httponly=True, secure=not settings.DEBUG, samesite="Lax", max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()))
    return response


def send_verification_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    link = f"{settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"
    send_mail("Verify your DUOBRO MART email", f"Welcome to DUOBRO MART. Verify your email by opening this link:\n{link}", settings.DEFAULT_FROM_EMAIL, [user.email])


class AuthThrottle(ScopedRateThrottle):
    scope = "auth"


class CustomerRegistrationView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]

    def post(self, request):
        serializer = CustomerRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        send_verification_email(user)
        audit("customer_registered", "user", user.pk, user, email=user.email)
        return issue_auth_response(user, status.HTTP_201_CREATED)


class PortalLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]

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
        if user.role == User.Role.CUSTOMER and settings.REQUIRE_EMAIL_VERIFICATION and not user.email_verified:
            return Response({"detail": "Verify your email before signing in."}, status=status.HTTP_403_FORBIDDEN)
        audit("portal_login", "user", user.pk, user, portal=portal)
        return issue_auth_response(user)


class EmailVerificationView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]

    def post(self, request, uid, token):
        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(uid)))
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"detail": "Invalid verification link."}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, token):
            return Response({"detail": "This verification link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)
        user.email_verified = True
        user.save(update_fields=["email_verified"])
        audit("email_verified", "user", user.pk, user)
        return Response({"detail": "Email verified successfully."})


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=serializer.validated_data["email"], is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
            send_mail("Reset your DUOBRO MART password", f"Use this one-time link within 30 minutes to reset your password:\n{link}", settings.DEFAULT_FROM_EMAIL, [user.email])
            audit("password_reset_requested", "user", user.pk, user)
        return Response({"detail": "If that email exists, a reset link has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(serializer.validated_data["uid"])))
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"detail": "Invalid reset link."}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, serializer.validated_data["token"]):
            return Response({"detail": "This reset link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        audit("password_reset_completed", "user", user.pk, user)
        return Response({"detail": "Password reset successfully."})


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
        audit("password_changed", "user", request.user.pk, request.user)
        return Response({"detail": "Password changed successfully."})


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.COOKIES.get("duobro_refresh")
        if not token:
            return Response({"detail": "Refresh session missing."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(token)
            user = User.objects.get(pk=refresh["user_id"], is_active=True)
        except Exception:
            return Response({"detail": "Refresh session is invalid."}, status=status.HTTP_401_UNAUTHORIZED)
        return issue_auth_response(user)


class VendorCredentialsView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = VendorCredentialSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vendor = get_object_or_404(User, email__iexact=serializer.validated_data["email"], role=User.Role.VENDOR)
        vendor.set_password(serializer.validated_data["temporary_password"])
        vendor.vendor_approved = True
        vendor.must_change_password = True
        vendor.save(update_fields=["password", "vendor_approved", "must_change_password"])
        send_mail("Your DUOBRO MART vendor account is ready", f"Your vendor account has been approved. Sign in with this temporary password, then change it immediately:\n{serializer.validated_data['temporary_password']}", settings.DEFAULT_FROM_EMAIL, [vendor.email])
        audit("vendor_credentials_issued", "user", vendor.pk, request.user, vendor_email=vendor.email)
        return Response({"detail": "Vendor approved and temporary credentials sent."})


SOCIAL = {
    "google": {"client_id": "GOOGLE_CLIENT_ID", "secret": "GOOGLE_CLIENT_SECRET", "authorize": "https://accounts.google.com/o/oauth2/v2/auth", "token": "https://oauth2.googleapis.com/token", "profile": "https://openidconnect.googleapis.com/v1/userinfo", "scope": "openid email profile"},
    "facebook": {"client_id": "FACEBOOK_CLIENT_ID", "secret": "FACEBOOK_CLIENT_SECRET", "authorize": "https://www.facebook.com/v22.0/dialog/oauth", "token": "https://graph.facebook.com/v22.0/oauth/access_token", "profile": "https://graph.facebook.com/me?fields=id,name,email", "scope": "email public_profile"},
}


class SocialStartView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthThrottle]

    def get(self, request, provider):
        config = SOCIAL.get(provider)
        if not config or not getattr(settings, config["client_id"]):
            return Response({"detail": f"{provider.title()} sign-in is not configured yet."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        callback = request.build_absolute_uri(f"/api/auth/social/{provider}/callback/")
        state = signing.dumps({"provider": provider})
        query = urlencode({"client_id": getattr(settings, config["client_id"]), "redirect_uri": callback, "response_type": "code", "scope": config["scope"], "state": state})
        return redirect(f"{config['authorize']}?{query}")


class SocialCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, provider):
        try:
            config = SOCIAL[provider]
            state = signing.loads(request.GET.get("state", ""), max_age=600)
            if state["provider"] != provider or request.GET.get("error"):
                raise ValueError
            callback = request.build_absolute_uri(f"/api/auth/social/{provider}/callback/")
            payload = urlencode({"code": request.GET["code"], "client_id": getattr(settings, config["client_id"]), "client_secret": getattr(settings, config["secret"]), "redirect_uri": callback, "grant_type": "authorization_code"}).encode()
            token_data = json.loads(urlopen(Request(config["token"], data=payload, headers={"Content-Type": "application/x-www-form-urlencoded"}), timeout=10).read())
            profile_request = Request(config["profile"], headers={"Authorization": f"Bearer {token_data['access_token']}"})
            profile = json.loads(urlopen(profile_request, timeout=10).read())
            email = profile.get("email")
            if not email:
                raise ValueError
            user, _ = User.objects.get_or_create(email=email, defaults={"full_name": profile.get("name", email.split("@")[0]), "role": User.Role.CUSTOMER, "email_verified": True})
            user.email_verified = True
            user.save(update_fields=["email_verified"])
            response = redirect(f"{settings.FRONTEND_URL}/social-callback")
            refresh = RefreshToken.for_user(user)
            response.set_cookie("duobro_refresh", str(refresh), httponly=True, secure=not settings.DEBUG, samesite="Lax", max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()))
            audit("social_login", "user", user.pk, user, provider=provider)
            return response
        except Exception:
            return redirect(f"{settings.FRONTEND_URL}/login?social_error=1")
