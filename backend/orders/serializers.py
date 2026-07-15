from rest_framework import serializers
class CartItemInputSerializer(serializers.Serializer): product_id = serializers.IntegerField(); quantity = serializers.IntegerField(min_value=1)
class CheckoutSerializer(serializers.Serializer):
    items = CartItemInputSerializer(many=True); full_name = serializers.CharField(max_length=150); phone = serializers.CharField(max_length=20); province = serializers.CharField(max_length=80); city = serializers.CharField(max_length=80); address = serializers.CharField(); rural_pickup = serializers.BooleanField(default=False); landmark = serializers.CharField(required=False, allow_blank=True); delivery_method = serializers.ChoiceField(choices=["standard", "express", "urgent"]); payment_method = serializers.ChoiceField(choices=["cod", "card", "easypaisa", "jazzcash", "nayapay"]); payment_token = serializers.CharField(required=False, allow_blank=True)
    def validate(self, attrs):
        if attrs["rural_pickup"] and not attrs.get("landmark"): raise serializers.ValidationError({"landmark": "A landmark or courier branch is required for rural pickup."})
        return attrs
