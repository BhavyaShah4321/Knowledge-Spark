from rest_framework import serializers
from course.models import Course, CourseVideo, CourseFeedback
from user.models import User

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id",
            "course_title",
            "course_teacher",
            "course_description",
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
            if user_instance.type != "Teacher":
                raise serializers.ValidationError("Only 'Teacher' can create course.")
        except User.DoesNotExist:
            raise serializers.ValidationError("The specified teacher does not exist.")

        return data

class CourseVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseVideo
        fields = [
            "id",
            "course_video",
            "course_video_title",
            "course_video_description",
            "course",
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

        # request = self.context.get("request")
        # if request and request.user.id != course.course_teacher.id:  
            # raise serializers.ValidationError("You are not allowed to add or update  this video.")

        return data
    
    
class CourseFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseFeedback
        fields = [
            "id",
            "feedback_student",
            "feedback_course",
            "feedback_message",
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
        feedback_course = data.get("feedback_course")
        
        if not feedback_student:
            raise serializers.ValidationError("Student id is required.")

        if not feedback_course:
            raise serializers.ValidationError("Course is required.")
        
        return data