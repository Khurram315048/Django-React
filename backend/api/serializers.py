from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode,urlsafe_base64_decode
from django.utils.encoding import force_bytes,force_str


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=["id","username","email","password"]
        extra_kwargs={
            "password":{"write_only": True},
            "email":{"required": True},
        }

    def create(self,validated_data):
        user=User.objects.create_user(**validated_data)
        return user    
    


    
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model=Note
        fields=["id","title","content","created_at","updated_at","is_archived","author"]
        extra_kwargs={
            "author":{
                "read_only":True
            }
        }


class PasswordResetRequestSerializer(serializers.Serializer):
    email=serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid=serializers.CharField()
    token=serializers.CharField()
    new_password=serializers.CharField(write_only=True,min_length=8)