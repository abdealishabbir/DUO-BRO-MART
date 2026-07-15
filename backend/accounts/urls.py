from django.urls import path
from .views import ChangePasswordView, CustomerRegistrationView, EmailVerificationView, MeView, PasswordResetConfirmView, PasswordResetRequestView, PortalLoginView, RefreshView, SocialCallbackView, SocialStartView, VendorCredentialsView

urlpatterns = [
    path("signup/", CustomerRegistrationView.as_view(), name="signup"),
    path("login/", PortalLoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("verify-email/<uid>/<token>/", EmailVerificationView.as_view(), name="verify-email"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("refresh/", RefreshView.as_view(), name="refresh"),
    path("admin/vendor-credentials/", VendorCredentialsView.as_view(), name="vendor-credentials"),
    path("social/<str:provider>/", SocialStartView.as_view(), name="social-start"),
    path("social/<str:provider>/callback/", SocialCallbackView.as_view(), name="social-callback"),
]
