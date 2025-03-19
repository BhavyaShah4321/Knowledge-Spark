from django.db import models
from user.models import User

# Create your models here.
class Category(models.Model):
    status_fields=[
        ("active","active"),
        ("inactive","inactive")
    ]
    name=models.CharField(max_length=255,null=True,blank=True)
    status=models.CharField(choices=status_fields,default="active")
    
    def __str__(self):
        return self.name

class Course(models.Model): 
    course_status_fields=[
        ("active","active"),
        ("inactive","inactive")
    ]
    course_title = models.CharField(max_length=255, null=True,blank=True)
    course_teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="course_teacher",blank=True,null=True)
    course_description = models.TextField(null=True,blank=True)
    course_status=models.CharField(choices=course_status_fields,default="active")
    course_thumbnail=models.FileField(upload_to="course-thumbnail",default="",null=True,blank=True)
    
    course_category=models.ForeignKey(Category,on_delete=models.CASCADE,related_name="course_category",default="",null=True,blank=True)
    course_price=models.CharField(max_length=255,null=True,blank=True,default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    deleted=models.IntegerField(default=0)
    
    def __str__(self):
        return self.course_title


class CourseVideo(models.Model):
    status_fields=[
        ("active","active"),
        ("inactive","inactive")
    ]
    
    course=models.ForeignKey(Course,on_delete=models.CASCADE,related_name="course_video_course",null=True,blank=True)
    course_video = models.FileField(upload_to="course_video/",blank=True,null=True)
    course_video_title = models.CharField(max_length=255, null=True,blank=True)
    course_video_description = models.TextField(null=True,blank=True)
    course_video_thumbnail=models.FileField(upload_to="course-video-thumbnail",default="",null=True,blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status=models.CharField(choices=status_fields,default="active")
    
    deleted=models.IntegerField(default=0)
    
    def __str__(self):
        return self.course_video_title


class CourseFeedback(models.Model):
    status_fields=[
        ("active","active"),
        ("inactive","inactive")
    ]
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="feedback_course",blank=True,null=True)
    feedback_student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="feedback_student",blank=True,null=True)
    feedback_message = models.CharField(max_length=100, null=True,blank=True)
    teacher_response = models.TextField(blank=True, null=True)
    
    status=models.CharField(choices=status_fields,default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    deleted=models.IntegerField(default=0)
    
    
    def __str__(self):
        return f"{self.feedback_student.username} - {self.feedback_message[:20]}"




class CoursePurchase(models.Model):
    PAYMENT_STATUS = [
        ("pending", "pending"),
        ("paid", "paid"),
        ("failed", "failed"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="orders")
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2,null=True,blank=True)
    platform_fee=models.DecimalField(max_digits=10, decimal_places=2,null=True,blank=True)
    teacher_amount=models.DecimalField(max_digits=10, decimal_places=2,null=True,blank=True)
    
    status = models.CharField(choices=PAYMENT_STATUS, default="pending", max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.user.username}"


    