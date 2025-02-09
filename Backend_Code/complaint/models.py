from django.db import models
from user.models import User

class Complaint(models.Model):
    ISSUE_CHOICES = [
        ("Payment", "Payment"),
        ("Website Design", "Website Design"),
        ("User Interface Issue", "User Interface Issue"),
        ("Slow Performance", "Slow Performance"),
        ("Broken Links", "Broken Links"),
        ("Login/Registration Issue", "Login/Registration Issue"),
        ("Bug/Error", "Bug/Error"),
        ("Feature Request", "Feature Request"),
        ("Security Concern", "Security Concern"),
        ("Other", "Other"),
    ]

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("In Progress", "In Progress"),
        ("Resolved", "Resolved"),
        ("Closed", "Closed"),
    ]

    type_of_issue = models.CharField(choices=ISSUE_CHOICES, max_length=255, default="Other")
    message = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="complaint_user")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(choices=STATUS_CHOICES, max_length=50, default="Pending")
    admin_response = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.type_of_issue} - {self.status}"
