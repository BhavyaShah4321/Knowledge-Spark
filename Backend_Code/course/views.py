from reportlab.lib.utils import ImageReader
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from django.http import FileResponse
import os
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import transaction
from course.models import Course, CourseVideo, CourseFeedback, Category,CoursePurchase
from course.serializer import (
    CourseSerializer,
    CourseVideoSerializer,
    CourseFeedbackSerializer,
    CourseCategorySerializer,
    CoursePurchaseSerializer
    
)
from io import BytesIO
from datetime import datetime
from final_year_project import settings
from utils.pagination import mypagination
import json
from user.models import User
from rest_framework.decorators import action
import razorpay

class CourseViewSet(ModelViewSet):
    queryset = Course.objects.all().order_by("-id")
    serializer_class = CourseSerializer
    pagination_class = mypagination
    # permission_classes = [IsAuthenticated]
    # authentication_classes = [JWTAuthentication]
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
    # permission_classes = [IsAuthenticated]
    # authentication_classes = [JWTAuthentication]
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
        
    @action(detail=False, methods=["POST"], url_path="get-course-feedback-according-student")
    def get_course_feedback_according_user(self, request, *args, **kwargs):
        user_id = request.data.get("student_id")

        if not user_id:
            return Response({"success": False, "message": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        course_feedback = CourseFeedback.objects.filter(feedback_student=user_id)
        
        # Apply pagination
        page = self.paginate_queryset(course_feedback)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.serializer_class(course_feedback, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["POST"], url_path="get-course-feedback-according-course")
    def get_course_feedback_according_course(self, request, *args, **kwargs):
        course_id = request.data.get("course_id")

        if not course_id:
            return Response({"success": False, "message": "course_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        course_feedback = CourseFeedback.objects.filter(course=course_id)

        # Apply pagination
        page = self.paginate_queryset(course_feedback)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.serializer_class(course_feedback, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["POST"], url_path="get-course-feedback-according-course-teacher")
    def get_course_feedback_according_teacher(self, request, *args, **kwargs):
        teacher_id = request.data.get("teacher_id")

        if not teacher_id:
            return Response({"success": False, "message": "teacher_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        course_feedback = CourseFeedback.objects.filter(course__course_teacher__id=teacher_id)

        # Apply pagination
        page = self.paginate_queryset(course_feedback)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.serializer_class(course_feedback, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class CourseCategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CourseCategorySerializer
    pagination_class = mypagination
    # permission_classes = [IsAuthenticated]
    # authentication_classes = [JWTAuthentication]
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

class CoursePurchaseViewSet(ModelViewSet):
    queryset = CoursePurchase.objects.all().order_by("-id")
    serializer_class = CoursePurchaseSerializer
    pagination_class = mypagination
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["user__username", "course__course_title", "status"]
    ordering_fields = ["created_at", "updated_at", "amount"]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        no_pagination = request.query_params.get("no_pagination")

        queryset = queryset.filter(status="paid")
        if no_pagination:
            serializer = self.serializer_class(queryset, many=True)
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.serializer_class(queryset, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        data = request.data
        serializer = self.serializer_class(data=data, context={"request": request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                {"success": True, "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"success": False, "message": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.serializer_class(instance)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        print(data)
        data["updated_at"] = datetime.now()
        serializer = self.serializer_class(instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": True, "data": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response(
            {"success": False, "message": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(
            {"success": True, "message": "Course purchase deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=False, methods=["GET"], url_path="filter-by-status")
    def filter_by_status(self, request, *args, **kwargs):
        status_filter = request.query_params.get("status")
        if not status_filter:
            return Response({"success": False, "message": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)

        purchases = CoursePurchase.objects.filter(status=status_filter)
        page = self.paginate_queryset(purchases)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.serializer_class(purchases, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["POST"], url_path="purchases-by-user")
    def purchases_by_user(self, request, *args, **kwargs):
        user_id = request.data.get("user_id")
        no_pagination=request.query_params.get("no_pagination")
            
        if not user_id:
            return Response({"success": False, "message": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)


        purchases = CoursePurchase.objects.filter(user__id=user_id).order_by("-id")
        
        if no_pagination:
            serializer=self.serializer_class(purchases,many=True)
            return Response({"success":True,"data":serializer.data},status=status.HTTP_200_OK)
        
        
        page = self.paginate_queryset(purchases)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.serializer_class(purchases, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
    
    
    
    @action(detail=False, methods=["POST"], url_path="course-purchase-according-teacher")
    def course_purchase_according_teacher(self, request, *args, **kwargs):
        teacher_id = request.data.get("teacher_id")
        if not teacher_id:
            return Response({"success": False, "message": "teacher_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        course_purchases = CoursePurchase.objects.filter(course__course_teacher__id=teacher_id,status="paid")

        page = self.paginate_queryset(course_purchases)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.serializer_class(course_purchases, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
    
    
    @action(detail=False, methods=["POST"], url_path="purchase-course")
    def purchase_course(self, request, *args, **kwargs):
        """Initiates a purchase by creating a Razorpay order."""
        user = request.user
        course_id = request.data.get("course_id")
        amount = request.data.get("amount")

        if not course_id or not amount:
            return Response(
                {"success": False, "message": "Course ID and amount are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            course_instance = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {"success": False, "message": "Course with this ID does not exist."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            amount_in_paise = float(amount)

            teacher_amount = float(amount) * 80 / 100  # 80% for the teacher
            platform_fee = float(amount) * 20 / 100  
            
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

            order_data = {
                "amount": amount_in_paise*100,
                "currency": "INR",
                "payment_capture": 1,
            }
            razorpay_order = client.order.create(order_data)

            purchase = CoursePurchase.objects.create(
                user=user,
                course=course_instance,
                amount=amount,
                teacher_amount=teacher_amount,
                platform_fee=platform_fee,
                razorpay_order_id=razorpay_order["id"],
                status="pending",
            )

            course_thumbnail_url = request.build_absolute_uri(course_instance.course_thumbnail.url) if course_instance.course_thumbnail else None

            return Response(
                {
                    "success": True,
                    "data": {
                        "id": purchase.id,
                        "order_id": razorpay_order["id"],  # Added order_id in response
                        "amount": amount,
                        "currency": "INR",
                        "teacher_name": course_instance.course_teacher.username,
                        "course_thumbnail": course_thumbnail_url,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response({"success": False, "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
    @action(detail=False, methods=["POST"], url_path="verify-payment")
    def verify_payment(self, request, *args, **kwargs):
        """Verifies payment and transfers demo amount to the teacher"""
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_signature = request.data.get("razorpay_signature")

        if not (razorpay_payment_id and razorpay_order_id and razorpay_signature):
            return Response({"success": False, "message": "Payment details are required"}, status=status.HTTP_400_BAD_REQUEST)

        client = razorpay.Client(auth=("rzp_test_demoKey", "rzp_test_demoSecret"))  # Demo Keys

        try:
            # Verify Razorpay Payment Signature
            # client.utility.verify_payment_signature({
                # "razorpay_order_id": razorpay_order_id,
                # "razorpay_payment_id": razorpay_payment_id,
                # "razorpay_signature": razorpay_signature
            # })

            purchase = CoursePurchase.objects.get(razorpay_order_id=razorpay_order_id)
            purchase.status = "paid"
            purchase.razorpay_payment_id = razorpay_payment_id
            purchase.razorpay_signature = razorpay_signature
            purchase.save()

            # Fetch teacher details
            teacher = purchase.course.course_teacher
            teacher_amount = 100  # Demo amount (₹1.00 in paise)

            # Ensure teacher has a Razorpay Contact (Demo Contact ID)
            teacher.razorpay_contact_id = "cont_demo12345"
            teacher.save()

            # Ensure teacher has a Fund Account (Demo Fund Account ID)
            teacher.razorpay_fund_account_id = "fa_demo12345"
            teacher.save()

            # Process Demo Payout to Teacher
            # payout_data = {
                # "account_number": "2323230076543210",  # Demo Razorpay Account Number
                # "amount": teacher_amount,  # Demo Amount (₹1.00 in paise)
                # "currency": "INR",
                # "mode": "UPI",
                # "purpose": "payout",
                # "fund_account_id": teacher.razorpay_fund_account_id,
                # "queue_if_low_balance": True,
                # "reference_id": f"payout_demo_{purchase.id}",
                # "narration": "Demo Course Earnings",
            # }
            # payout_response = client.payout.create(payout_data)

            # if payout_response.get("status") == "processed":
                # purchase.teacher_payment_status = "paid"
                # purchase.save()

            return Response({"success": True, "message": "Demo Payment verified and teacher paid"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"success": False, "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        
        
    @action(detail=True, methods=['get'], url_path="download-receipt")
    def download_receipt(self, request, pk=None):
        try:
            purchase = self.get_object()

            if purchase.status != "paid":
                return Response(
                    {"success": False, "message": "Receipt is only available for completed purchases."}, 
                    status=400
                )

            buffer = BytesIO()
            pdf = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4

            # Logo Placement (Centered)
            logo_path = os.path.join("static", "images", "logo.png")
            if os.path.exists(logo_path):
                logo = ImageReader(logo_path)
                pdf.drawImage(logo, width / 2 - 60, height - 100, width=120, height=50)

            # Website Name (Centered, Below Logo)
            pdf.setFont("Helvetica-Bold", 18)
            pdf.drawCentredString(width / 2, height - 130, "Knowledge Spark")
            pdf.setFont("Helvetica-Bold", 14)
            pdf.drawString(50, height - 170, f"Receipt for Order {purchase.id}")

            # Order Details
            pdf.setFont("Helvetica", 12)
            y_position = height - 210
            details = [
                f"Order Date: {purchase.created_at.strftime('%Y-%m-%d %H:%M:%S')}",
                # f"Payment Method: {purchase.payment_method}",
                f"Payment ID: {purchase.razorpay_payment_id}",
                f"User: {purchase.user.username}",
                f"Email: {purchase.user.email}",
            ]

            for detail in details:
                pdf.drawString(50, y_position, detail)
                y_position -= 20

            # Course Details Table
            pdf.setFont("Helvetica-Bold", 12)
            pdf.drawString(50, y_position - 10, "Product")
            pdf.drawString(300, y_position - 10, "Amount")
            pdf.line(50, y_position - 15, 550, y_position - 15)
            y_position -= 35

            pdf.setFont("Helvetica", 12)
            pdf.drawString(50, y_position, purchase.course.course_title)
            pdf.drawString(300, y_position, f"INR {purchase.amount:.2f}")
            y_position -= 30

            # Pricing Breakdown
            pdf.drawString(50, y_position, "Subtotal:")
            pdf.drawString(300, y_position, f"INR {purchase.amount:.2f}")
            y_position -= 20

            # pdf.drawString(50, y_position, "Platform Fee:")
            # pdf.drawString(300, y_position, f"INR {purchase.platform_fee:.2f}")
            # y_position -= 20

            # pdf.drawString(50, y_position, "Teacher's Share:")
            # pdf.drawString(300, y_position, f"INR {purchase.teacher_amount:.2f}")
            # y_position -= 30

            # Total Amount
            pdf.setFont("Helvetica-Bold", 12)
            pdf.drawString(50, y_position, "Total Paid:")
            pdf.drawString(300, y_position, f"INR {purchase.amount:.2f}")
            pdf.line(50, y_position - 5, 550, y_position - 5)

            pdf.showPage()
            pdf.save()
            buffer.seek(0)

            return FileResponse(
                buffer, as_attachment=True, filename=f"receipt_{purchase.id}.pdf"
            )

        except CoursePurchase.DoesNotExist:
            return Response({"error": "Purchase not found"}, status=404)