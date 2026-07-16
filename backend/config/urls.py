from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse

def health(_request): return JsonResponse({"status": "ok"})
urlpatterns = [path("healthz/", health), path("django-admin/", admin.site.urls), path("api/auth/", include("accounts.urls")), path("api/", include("catalog.urls")), path("api/", include("orders.urls")), path("api/", include("operations.urls")), path("api/", include("engagement.urls")), path("api/", include("growth.urls"))]
