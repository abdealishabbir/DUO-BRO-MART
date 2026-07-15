import re
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import User

PAKISTANI_PHONE = re.compile(r"^(?:\+92|0)3\d{9}$")


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="full_name", read_only=True)

    class Meta:
        model = User
        fields = ("id", "name", "email", "phone", "role", "email_verified", "must_change_password")


class CustomerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ("full_name", "email", "phone", "password")

    def validate_phone(self, value):
        normalized = value.replace("-", "").replace(" ", "")
        if not PAKISTANI_PHONE.fullmatch(normalized):
            raise serializers.ValidationError("Use a Pakistani mobile number, e.g. 03001234567 or +923001234567.")
        return normalized

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(role=User.Role.CUSTOMER, **validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    portal = serializers.ChoiceField(choices=[User.Role.CUSTOMER, User.Role.VENDOR, User.Role.ADMIN])
    captcha_token = serializers.CharField(required=False, allow_blank=True, write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])


class VendorCredentialSerializer(serializers.Serializer):
    email = serializers.EmailField()
    temporary_password = serializers.CharField(write_only=True, validators=[validate_password])
