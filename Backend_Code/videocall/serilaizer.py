
from videocall.models import VideoRoom
from rest_framework import serializers

from rest_framework import serializers
from .models import VideoRoom

class VideoRoomSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    teacher_username = serializers.CharField(source="teacher.username", read_only=True)
    student_username = serializers.CharField(source="student.username", read_only=True)
    start = serializers.DateTimeField(format="%d/%m/%Y %H:%M", 
    input_formats=["%d/%m/%Y %H:%M", "%Y-%m-%dT%H:%M:%S.%fZ"], 
    required=False)
    end = serializers.DateTimeField(format="%d/%m/%Y %H:%M", 
    input_formats=["%d/%m/%Y %H:%M", "%Y-%m-%dT%H:%M:%S.%fZ"], 
    required=False)

    class Meta:
        model = VideoRoom
        fields = [
            "id",
            "uuid",
            "teacher",
            "teacher_username",
            "student",
            "student_username",
            "start",
            "end",
            "duration",
            "status",
            "created_by",
            "created_by_username",
            "created_at",
            "updated_at",
        ]
        # read_only_fields = ["id", "uuid", "created_at", "updated_at"]

    def create(self, validated_data):
        return super().create(validated_data)
