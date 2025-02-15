from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import transaction
from course.models import Course, CourseVideo, CourseFeedback, Category
from course.serializer import (
    CourseSerializer,
    CourseVideoSerializer,
    CourseFeedbackSerializer,
    CourseCategorySerializer,
)
from utils.pagination import mypagination
import json
from user.models import User
from rest_framework.decorators import action

class CourseViewSet(ModelViewSet):
    queryset = Course.objects.all().order_by("-id")
    serializer_class = CourseSerializer
    pagination_class = mypagination
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        "course_title",
            "course_teacher_username",
            "course_teacher_email",
            "course_description",
            "course_thumbnail",
            "course_price",
            "course_status",
            "course_category_name",
            "created_at",
            "updated_at",
    ]
    ordering_fields = [
        "course_title",
            "course_teacher_username",
            "course_teacher_email",
            "course_description",
            "course_category_name",
            "course_thumbnail",
            
            "course_price",
            "course_status",
            "created_at",
            "updated_at",
    ]

    def list(self, request, *args, **kwargs):
        """List all courses."""
        queryset = self.filter_queryset(self.get_queryset())
        no_pagination = request.query_params.get("no_pagination")

        if no_pagination:
            serializer = self.serializer_class(queryset, many=True)
            return Response(
                {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(
                {"success": True, "data": serializer.data}
            )

        serializer = self.serializer_class(queryset, many=True)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )

    def create(self, request, *args, **kwargs):
        """Create a new course."""
        data = json.loads(request.data.get("form_data"))

        course_thumbnail = request.FILES.get('course_thumbnail')
        data["course_thumbnail"] = course_thumbnail

        serializer = self.serializer_class(data=data, context={"request": request})
        if serializer.is_valid():
            with transaction.atomic():
                instance = serializer.save()
                return Response(
                    {"success": True, "data": serializer.data},
                    status=status.HTTP_201_CREATED,
                )
        else:

            errors_message = " ".join(
                [", ".join(value) for value in serializer.errors.values()]
            )
            return Response(
                {"success": False, "message": errors_message},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a specific course."""
        instance = self.get_object()
        serializer = self.serializer_class(instance)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )

    def update(self, request, *args, **kwargs):
        """Update an existing course."""
        instance = self.get_object()
        data = json.loads(request.data.get("form_data"))

        course_thumbnail = request.FILES.get('course_thumbnail')
        data["course_thumbnail"] = course_thumbnail
        serializer = self.serializer_class(instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
            )

        else:

            errors_message = " ".join(
                [", ".join(value) for value in serializer.errors.values()]
            )
            return Response(
                {"success": False, "message": errors_message},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def destroy(self, request, *args, **kwargs):
        """Delete a course."""
        instance = self.get_object()
        instance.delete()
        return Response(
            {"success": True, "message": "Course deleted successfully."},
            status=status.HTTP_200_OK,
        )
        
        
    @action(detail=False, methods=["POST"], url_path="get-course-according-teacher")
    def get_course_according_to_teacher(self, request, *args, **kwargs):
        user_id = request.data.get("user_id")
        user_instance = User.objects.filter(id=user_id).first()
        if not user_instance or user_instance.type != "Teacher":
            return Response({"success": False, "message": "Oops! You are not a Teacher"}, status=status.HTTP_400_BAD_REQUEST)
        course_instances = Course.objects.filter(course_teacher=user_instance.id)
        serializer = CourseSerializer(course_instances, many=True)  # `many=True` to handle queryset properly

        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class CourseVideoViewSet(ModelViewSet):
    queryset = CourseVideo.objects.all()
    serializer_class = CourseVideoSerializer
    pagination_class = mypagination
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["course_video_title", "created_at", "updated_at","status","course_video_thumbnail"]
    ordering_fields = ["course_video_title", "created_at", "updated_at","status""course_video_thumbnail"]

    def list(self, request, *args, **kwargs):
        """List all course videos."""
        queryset = self.filter_queryset(self.get_queryset())
        no_pagination = request.query_params.get("no_pagination")

        if no_pagination:
            serializer = self.serializer_class(queryset, many=True)
            return Response(
                {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(
                {"success": True, "data": serializer.data}
            )

        serializer = self.serializer_class(queryset, many=True)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )

    def create(self, request, *args, **kwargs):
        """Create a new course video."""
        data = json.loads(request.data.get("form_data"))

        course_video_thumbnail = request.FILES.get('course_video_thumbnail')
        course_video = request.FILES.get('course_video')
        
        data["course_video_thumbnail"] = course_video_thumbnail
        data["course_video"] = course_video


        serializer = self.serializer_class(data=data, context={"request": request})
        if serializer.is_valid():
            with transaction.atomic():
                instance = serializer.save()
                return Response(
                    {"success": True, "data": serializer.data},
                    status=status.HTTP_201_CREATED,
                )
        else:

            errors_message = " ".join(
                [", ".join(value) for value in serializer.errors.values()]
            )
            return Response(
                {"success": False, "message": errors_message},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a specific course video."""
        instance = self.get_object()
        serializer = self.serializer_class(instance)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )

    def update(self, request, *args, **kwargs):
        """Update an existing course video."""
        instance = self.get_object()
        data = json.loads(request.data.get("form_data"))

        course_video_thumbnail = request.FILES.get('course_video_thumbnail')
        course_video = request.FILES.get('course_video')
        
        data["course_video_thumbnail"] = course_video_thumbnail
        data["course_video"] = course_video

        serializer = self.serializer_class(instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
            )
        else:

            errors_message = " ".join(
                [", ".join(value) for value in serializer.errors.values()]
            )
            return Response(
                {"success": False, "message": errors_message},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def destroy(self, request, *args, **kwargs):
        """Delete a course video."""
        instance = self.get_object()
        instance.delete()
        return Response(
            {"success": True, "message": "Course video deleted successfully."},
            status=status.HTTP_200_OK,
        )
        
    @action(detail=False, methods=["POST"], url_path="get-course-video-according-course")
    def get_course_video_according_course(self, request, *args, **kwargs):
        course_id = request.data.get("course_id")
        
        if not course_id:
            return Response({"success": False, "message": "Course_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        
        course_instances = CourseVideo.objects.filter(course=course_id)
        serializer = self.serializer_class(course_instances, many=True)  

        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class CourseFeedbackViewSet(ModelViewSet):
    queryset = CourseFeedback.objects.all()
    serializer_class = CourseFeedbackSerializer
    pagination_class = mypagination
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        "feedback_student__username",
        "status",
        "course__course_title",
        "feedback_student__username",
        
            "feedback_student__profile_picture",
            "feedback_student__email",
    ]
    ordering_fields = ["created_at", "updated_at","status", "feedback_student__username",
            "feedback_student_profile__picture",
            "course__course_title",
            "feedback_student__email",]

    def list(self, request, *args, **kwargs):
        """List all feedback."""
        queryset = self.filter_queryset(self.get_queryset())
        no_pagination = request.query_params.get("no_pagination")

        if no_pagination:
            serializer = self.serializer_class(queryset, many=True)
            return Response(
                {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(
                {"success": True, "data": serializer.data}
            )

        serializer = self.serializer_class(queryset, many=True)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )

    def create(self, request, *args, **kwargs):
        """Create new feedback."""
        data = request.data
        serializer = self.serializer_class(data=data, context={"request": request})
        if serializer.is_valid():
            with transaction.atomic():
                instance = serializer.save()

                return Response(
                    {"success": True, "data": serializer.data},
                    status=status.HTTP_201_CREATED,
                )
        else:

            errors_message = " ".join(
                [", ".join(value) for value in serializer.errors.values()]
            )
            return Response(
                {"success": False, "message": errors_message},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a specific feedback."""
        instance = self.get_object()
        serializer = self.serializer_class(instance)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )

    def update(self, request, *args, **kwargs):
        """Update an existing feedback."""
        instance = self.get_object()
        data = request.data
        serializer = self.serializer_class(instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
            )
        else:

            errors_message = " ".join(
                [", ".join(value) for value in serializer.errors.values()]
            )
            return Response(
                {"success": False, "message": errors_message},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def destroy(self, request, *args, **kwargs):
        """Delete a feedback."""
        instance = self.get_object()
        instance.delete()
        return Response(
            {"success": True, "message": "Feedback deleted successfully."},
            status=status.HTTP_200_OK,
        )
        
    @action(detail=False,methods=["POST"],url_path="get-course-feedback-according-student")
    def get_course_feedback_according_user(self,request,*args,**kwargs):
        user_id = request.data.get("student_id")
        
        if not user_id:
            return Response({"success": False, "message": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        course_feedback = CourseFeedback.objects.filter(feedback_student=user_id)
        serializer = self.serializer_class(course_feedback, many=True)  

        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
    
    @action(detail=False,methods=["POST"],url_path="get-course-feedback-according-course")
    def get_course_feedback_according_course(self,request,*args,**kwargs):
        course_id = request.data.get("course_id")
        
        if not course_id:
            return Response({"success": False, "message": "course_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        course_feedback = CourseFeedback.objects.filter(course=course_id)
        serializer = self.serializer_class(course_feedback, many=True)  

        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


    
    @action(detail=False,methods=["POST"],url_path="get-course-feedback-according-course-teacher")
    def get_course_feedback_according_course(self,request,*args,**kwargs):
        teacher_id = request.data.get("teacher_id")
        
        if not teacher_id:
            return Response({"success": False, "message": "teacher_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        course_feedback = CourseFeedback.objects.filter(course__course_teacher__id=teacher_id)
        serializer = self.serializer_class(course_feedback, many=True)  

        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)




class CourseCategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CourseCategorySerializer
    pagination_class = mypagination
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name","status"]
    ordering_fields = ["id"]

    def list(self, request, *args, **kwargs):
        """List all categories."""
        queryset = self.filter_queryset(self.get_queryset())
        no_pagination = request.query_params.get("no_pagination")

        if no_pagination:
            serializer = self.serializer_class(queryset, many=True)
            return Response(
                {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(
                {"success": True, "data": serializer.data}
            )

        serializer = self.serializer_class(queryset, many=True)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )

    def create(self, request, *args, **kwargs):
        """Create a new category."""
        data = request.data
        serializer = self.serializer_class(data=data, context={"request": request})
        if serializer.is_valid():
            with transaction.atomic():
                instance = serializer.save()
                return Response(
                    {"success": True,"message":"course category successfully created", "data": serializer.data},
                    status=status.HTTP_201_CREATED,
                )
        else:

            errors_message = " ".join(
                [", ".join(value) for value in serializer.errors.values()]
            )
            return Response(
                {"success": False, "message": errors_message},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a specific category."""
        instance = self.get_object()
        serializer = self.serializer_class(instance)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )

    def update(self, request, *args, **kwargs):
        """Update an existing category."""
        instance = self.get_object()
        data = request.data
        serializer = self.serializer_class(instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": True,"message":"course category successfully updated","data": serializer.data}, status=status.HTTP_200_OK
            )
        else:

            errors_message = " ".join(
                [", ".join(value) for value in serializer.errors.values()]
            )
            return Response(
                {"success": False, "message": errors_message},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def destroy(self, request, *args, **kwargs):
        """Delete a category."""
        instance = self.get_object()
        instance.delete()
        return Response(
            {"success": True, "message": "Category deleted successfully."},
            status=status.HTTP_200_OK,
        )
