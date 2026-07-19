from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.response import Response
from .serializers import UserSerializer,NoteSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from .models import Note
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.utils.encoding import force_bytes,force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework import status
from .serializers import PasswordResetRequestSerializer,PasswordResetConfirmSerializer

token_generator=PasswordResetTokenGenerator()




class NoteListCreate(generics.ListCreateAPIView):
    serializer_class=NoteSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        user=self.request.user
        return Note.objects.filter(author=user, is_archived=False)

    def perform_create(self,serializer):
        serializer.save(author=self.request.user)



class NoteDelete(generics.RetrieveUpdateDestroyAPIView):
    serializer_class=NoteSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        user=self.request.user
        return Note.objects.filter(author=user)

    def perform_destroy(self, instance):
        instance.is_archived = True
        instance.save()



class NoteRestore(generics.UpdateAPIView):
    serializer_class=NoteSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        user=self.request.user
        return Note.objects.filter(author=user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_archived = False
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)



class TrashList(generics.ListAPIView):
    serializer_class=NoteSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        user=self.request.user
        return Note.objects.filter(author=user, is_archived=True)



class NotePermanentDelete(generics.DestroyAPIView):
    serializer_class=NoteSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        user=self.request.user
        return Note.objects.filter(author=user, is_archived=True)



class CreateUserView(generics.CreateAPIView):
    queryset=User.objects.all()
    serializer_class=UserSerializer
    permission_classes=[AllowAny]



class PasswordResetRequestView(APIView):
    permission_classes=[AllowAny]

    def post(self,request):
        serializer=PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email=serializer.validated_data["email"]

        user=User.objects.filter(email=email).first()
        if user:
            uid=urlsafe_base64_encode(force_bytes(user.pk))
            token=token_generator.make_token(user)
            reset_link=f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            send_mail(
                subject="Reset your password",
                message=f"Click to reset your password: {reset_link}",
                from_email=None,
                recipient_list=[email],
            )
        return Response({"detail":"If that email exists, a reset link was sent."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes=[AllowAny]

    def post(self,request):
        serializer=PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data=serializer.validated_data

        try:
            uid=force_str(urlsafe_base64_decode(data["uid"]))
            user=User.objects.get(pk=uid)
        except (TypeError,ValueError,OverflowError,User.DoesNotExist):
            return Response({"detail": "Invalid link."}, status=status.HTTP_400_BAD_REQUEST)

        if not token_generator.check_token(user,data["token"]):
            return Response({"detail": "Invalid or expired token."},status=status.HTTP_400_BAD_REQUEST)

        user.set_password(data["new_password"])
        user.save()
        return Response({"detail": "Password updated."},status=status.HTTP_200_OK)