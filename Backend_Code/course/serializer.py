from rest_framework import serializers
from course.models import Course, CourseVideo, CourseFeedback,Category
from user.models import User

class CourseCategorySerializer(serializers.ModelSerializer):
    class  Meta:
        model = Category
        fields=["id","name","status"]
        
    def validate(self, attrs):
        name=attrs.get("name")
        if not name:
            raise serializers.ValidationError("name is required")
            
        return attrs

class CourseSerializer(serializers.ModelSerializer):
    course_teacher_username=serializers.CharField(source="course_teacher.username",required=False,
    allow_null=True)
    course_teacher_email=serializers.CharField(source="course_teacher.email",required=False,
    allow_null=True)
    class Meta:
        model = Course
        fields = [
            "id",
            "course_title",
            "course_teacher",
            "course_teacher_username",
            "course_teacher_email",
            "course_description",
            
            "course_category",
            "course_price",
            "course_status",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):
        course_title = data.get("course_title", "").strip()
        if not course_title:
            raise serializers.ValidationError("Course title is required.")
        if len(course_title) < 5:
            raise serializers.ValidationError("Course title must be at least 5 characters long.")

        course_description = data.get("course_description", "").strip()
        if not course_description:
            raise serializers.ValidationError("Course description is required.")
        if len(course_description) < 20:
            raise serializers.ValidationError("Course description must be at least 20 characters long.")

        course_teacher = data.get("course_teacher")
        if not course_teacher:
            raise serializers.ValidationError("Course teacher is required.")
        try:
            user_instance = User.objects.get(id=course_teacher.id)
        except User.DoesNotExist:
            raise serializers.ValidationError("The specified teacher does not exist.")
        if user_instance.type != "Teacher":
            raise serializers.ValidationError("Only users with the role 'Teacher' (or superuser) can create courses.")

        course_category = data.get("course_category")
        if not course_category:
            raise serializers.ValidationError("Course category is required.")
        
        course_price = data.get("course_price")
        if not course_price:
            raise serializers.ValidationError("Course price is required.")
        
        return data
    
    def to_representation(self, instance):
        course_data = super().to_representation(instance)

        course_video_instances = CourseVideo.objects.filter(course=instance)
        course_video_serializer = CourseVideoSerializer(course_video_instances, many=True)
        course_data['videos'] = course_video_serializer.data 

        course_feedback_instances = CourseFeedback.objects.filter(course=instance)
        course_feedback_serializer = CourseFeedbackSerializer(course_feedback_instances, many=True)
        course_data['feedbacks'] = course_feedback_serializer.data 

        return course_data


class CourseVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseVideo
        fields = [
            "id",
            "course_video",
            "course_video_title",
            "course_video_description",
            "course",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):
        course=data.get("course")
        print(course)
        if not course:
            print(course)
            raise serializers.ValidationError("course id is required")
        
        course_video_title = data.get("course_video_title", "").strip()
        if not course_video_title:
            raise serializers.ValidationError("Video title is required.")
        if len(course_video_title) < 5:
            raise serializers.ValidationError("Video title must be at least 5 characters long.")

        course_video = data.get("course_video")
        max_size = 100 * 1024 * 1024  # 100 MB in bytes
        if not course_video:
            raise serializers.ValidationError("A video file is required.")
        if not course_video.name.endswith(('.mp4', '.avi', '.mkv')):
            raise serializers.ValidationError("Only video files with extensions .mp4, .avi, or .mkv are allowed.")        
        if course_video.size > max_size:
            raise serializers.ValidationError("The video file size cannot exceed 100 MB.")


        course_video_description = data.get("course_video_description", "").strip()
        if not course_video_description:
            raise serializers.ValidationError("Video description is required.")

        return data
    
    
class CourseFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseFeedback
        fields = [
            "id",
            "feedback_student",
            "course",
            "feedback_message",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):
        feedback_message = data.get("feedback_message", "").strip()
        if not feedback_message:
            raise serializers.ValidationError("Feedback message is required.")
        if len(feedback_message) < 10:
            raise serializers.ValidationError("Feedback message must be at least 10 characters long.")

        feedback_student = data.get("feedback_student")
        course = data.get("course")
        
        if not feedback_student:
            raise serializers.ValidationError("Student id is required.")

        if not course:
            raise serializers.ValidationError("Course is required.")
        
        return data