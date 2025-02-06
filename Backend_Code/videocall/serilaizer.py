
from videocall.models import VideoRoom
from rest_framework import serializers

from rest_framework import serializers
from .models import VideoRoom

class VideoRoomSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = VideoRoom
        fields = [
            "id",
            "uuid",
            "created_by",
            "created_by_username",
            "created_at",
            "updated_at",
        ]
        # read_only_fields = ["id", "uuid", "created_at", "updated_at"]

    def create(self, validated_data):
        return super().create(validated_data)
