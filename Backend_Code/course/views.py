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
            "course_category",
            "course_price",
            "course_status",
            "created_at",
            "updated_at",
    ]
    ordering_fields = [
        "course_title",
            "course_teacher_username",
            "course_teacher_email",
            "course_description",
            "course_category",
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
        """Retrieve a specific course."""
        instance = self.get_object()
        serializer = self.serializer_class(instance)
        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )

    def update(self, request, *args, **kwargs):
        """Update an existing course."""
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
        """Delete a course."""
        instance = self.get_object()
        instance.delete()
        return Response(
            {"success": True, "message": "Course deleted successfully."},
            status=status.HTTP_200_OK,
        )


class CourseVideoViewSet(ModelViewSet):
    queryset = CourseVideo.objects.all()
    serializer_class = CourseVideoSerializer
    pagination_class = mypagination
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["course_video_title", "created_at", "updated_at","status",]
    ordering_fields = ["course_video_title", "created_at", "updated_at","status"]

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
        course_video = request.FILES.get("course_video")
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
        course_video = request.FILES.get("course_video")
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


class CourseFeedbackViewSet(ModelViewSet):
    queryset = CourseFeedback.objects.all()
    serializer_class = CourseFeedbackSerializer
    pagination_class = mypagination
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        "feedback_message",
        "feedback_student__username",
        "course__course_title",
        "status",
    ]
    ordering_fields = ["created_at", "updated_at","status"]

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
