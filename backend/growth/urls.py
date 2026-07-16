from django.urls import path
from .views import ApplyReferralView, MyReferralView
urlpatterns = [path("growth/referral/", MyReferralView.as_view()), path("growth/referral/apply/", ApplyReferralView.as_view())]
