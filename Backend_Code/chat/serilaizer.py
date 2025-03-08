from rest_framework import serializers
from .models import ChatID, ChatMessage

class ChatIDSerializer(serializers.ModelSerializer):
    user_1_username = serializers.CharField(source="user_1.username", read_only=True)
    user_2_username = serializers.CharField(source="user_2.username", read_only=True)

    class Meta:
        model = ChatID
        fields = ["id", "uuid", "user_1", "user_1_username", "user_2", "user_2_username","deleted"]
        read_only_fields = ["id", "uuid"]

    def validate(self, data):
        """Ensure user_1 and user_2 are not the same person"""
        if data["user_1"] == data["user_2"]:
            raise serializers.ValidationError("A user cannot chat with themselves.")
        return data

    def create(self, validated_data):
        """Check if a chat already exists before creating a new one"""
        user_1 = validated_data["user_1"]
        user_2 = validated_data["user_2"]

        if user_1.id > user_2.id:
            user_1, user_2 = user_2, user_1

        chat = ChatID.objects.filter(user_1=user_1, user_2=user_2).first()

        if chat:
            print(chat)
            if chat.deleted==1:
                chat.deleted = 0
                chat.save()
            return chat

        return ChatID.objects.create(user_1=user_1, user_2=user_2)

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    chatid_uuid = serializers.UUIDField(source="chatid.uuid", read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "chatid",
            "chatid_uuid",
            "sender",
            "sender_username",
            "message",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_message(self, value):
        """Ensure message is not empty"""
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty.")
        return value

    def validate(self, data):
        """Ensure sender is part of the chat"""
        chat = data["chatid"]
        sender = data["sender"]

        if sender != chat.user_1 and sender != chat.user_2:
            raise serializers.ValidationError("Sender is not a participant in this chat.")

        return data
