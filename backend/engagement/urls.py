from django.urls import path
from .views import AdminBannerDecisionView, ComplaintView, FeedbackView, PublicBannersView, VendorBannersView
urlpatterns = [path("banners/", PublicBannersView.as_view()), path("vendor/banners/", VendorBannersView.as_view()), path("admin/banners/<int:pk>/decision/", AdminBannerDecisionView.as_view()), path("feedback/<str:code>/", FeedbackView.as_view()), path("complaints/<str:code>/", ComplaintView.as_view())]
