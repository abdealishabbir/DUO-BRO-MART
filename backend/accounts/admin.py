from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class DuoBroUserAdmin(UserAdmin):
    model = User
    list_display = ("email", "full_name", "role", "vendor_approved", "is_active")
    list_filter = ("role", "vendor_approved", "is_active")
    ordering = ("email",)
    search_fields = ("email", "full_name", "phone")
    fieldsets = UserAdmin.fieldsets + (("Duo Bro Mart access", {"fields": ("full_name", "phone", "role", "email_verified", "vendor_approved", "must_change_password")} ),)
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "full_name", "phone", "role", "password1", "password2")}),)
