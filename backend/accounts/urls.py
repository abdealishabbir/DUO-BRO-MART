from django.urls import path
from .views import ChangePasswordView, CustomerRegistrationView, MeView, PortalLoginView

urlpatterns = [
    path("signup/", CustomerRegistrationView.as_view(), name="signup"),
    path("login/", PortalLoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]
