from rest_framework import serializers
from .models import Complaint

class ComplaintSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Complaint
        fields = [
            "id",
            "type_of_issue",
            "message",
            "user",
            "user_username",
            "created_at",
            "updated_at",
            "status",
            "admin_response",
        ]

    def validate_message(self, value):
        """Ensure the complaint message is not empty"""
        if not value.strip():
            raise serializers.ValidationError("Complaint message cannot be empty.")
        return value
