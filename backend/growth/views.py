from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Referral, ReferralAttribution

class MyReferralView(APIView):
    def get(self, request):
        referral, _ = Referral.objects.get_or_create(referrer=request.user)
        return Response({"code": referral.code, "uses": referral.uses, "share_url": f"/signup?ref={referral.code}"})
class ApplyReferralView(APIView):
    def post(self, request):
        referral = Referral.objects.filter(code=request.data.get("code", "").upper()).first()
        if not referral or referral.referrer == request.user: return Response({"detail": "Invalid referral code."}, status=400)
        ReferralAttribution.objects.get_or_create(referral=referral, customer=request.user)
        referral.uses = referral.attributions.count(); referral.save(update_fields=["uses"])
        return Response({"detail": "Referral applied."})
