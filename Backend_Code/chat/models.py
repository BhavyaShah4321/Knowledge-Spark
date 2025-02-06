import uuid
from django.db import models
from user.models import User

class ChatID(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    user_1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_user_1")
    user_2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_user_2")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True,null=True,blank=True)  # Index for performance
    deleted = models.IntegerField(default=0)  # Soft delete for messages


    def save(self, *args, **kwargs):
        """Ensure consistent ordering of users to avoid duplicate chat creation"""
        if self.user_1.id > self.user_2.id:
            self.user_1, self.user_2 = self.user_2, self.user_1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Chat between {self.user_1.username} and {self.user_2.username}"


class ChatMessage(models.Model):
    chatid = models.ForeignKey(ChatID, on_delete=models.CASCADE, related_name="messages", db_index=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    message = models.TextField()
    deleted = models.IntegerField(default=0)  # Soft delete for messages
    created_at = models.DateTimeField(auto_now_add=True, db_index=True , null=True,blank=True)  # Index for faster sorting
    updated_at = models.DateTimeField(auto_now_add=True, null=True,blank=True)

    def __str__(self):
        return f"From {self.sender.username}: {self.message[:30]}"

    def delete_message(self):
        """Soft delete a message instead of removing it from the database"""
        self.is_deleted = True
        self.save()

    class Meta:
        ordering = ['-created_at']  # Show latest messages first
