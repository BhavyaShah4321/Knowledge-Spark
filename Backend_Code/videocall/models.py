from django.db import models
from django.conf import settings
from django.utils.timezone import now
# Create your models here.
from user.models import User

class VideoRoom(models.Model):
    uuid=models.CharField(max_length=255,null=True)
    teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="video_room_teacher",
    )
    student = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="video_room_student",
    )
    start=models.DateTimeField(null=True,blank=True)
    end=models.DateTimeField(null=True,blank=True)
    
    duration = models.CharField(max_length=100,null=True,blank=True)  # Duration in seconds
    STATUS_CHOICES = [
        ("Ongoing", "Ongoing"),
        ("Completed", "Completed"),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="Ongoing")

    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="video_room_created",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="video_room_updated",
    )
    deleted = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=now)
    updated_at = models.DateTimeField(default=now)

    def __str__(self):
        return self.uuid
    
    