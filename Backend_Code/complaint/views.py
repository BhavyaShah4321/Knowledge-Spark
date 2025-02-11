from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from complaint.models import Complaint
from complaint.serilaizer import ComplaintSerializer

class ComplaintViewSet(ModelViewSet):
    queryset = Complaint.objects.all().order_by("-created_at")
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = ["user__username", "type_of_issue", "message", "status"]
    ordering_fields = ["created_at", "updated_at", "status"]

    # LIST
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        no_pagination = request.query_params.get("no_pagination")

        if no_pagination:
            serializer = self.serializer_class(queryset, many=True)
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.serializer_class(queryset, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

    # CREATE
    def create(self, request, *args, **kwargs):
        data = request.data
        serializer = self.serializer_class(data=data, context={"request": request})
        if serializer.is_valid():
            serializer.save(user=request.user)  # Automatically assign the logged-in user
            return Response(
                {"success": True, "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {"success": False, "message": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

    # RETRIEVE
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.serializer_class(instance)
        return Response(
            {"success": True, "data": serializer.data},
            status=status.HTTP_200_OK,
        )

    # UPDATE
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        serializer = self.serializer_class(instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": True, "data": serializer.data},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"success": False, "message": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

    # DESTROY
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(
            {"success": True, "message": "Complaint deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )

    # FILTER COMPLAINTS BY STATUS
    @action(detail=False, methods=["GET"], url_path="filter-by-status")
    def filter_by_status(self, request, *args, **kwargs):
        status_filter = request.query_params.get("status")

        if not status_filter:
            return Response({"success": False, "message": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)

        complaints = Complaint.objects.filter(status=status_filter)
        serializer = self.get_serializer(complaints, many=True)

        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


    @action(detail=False, methods=["POST"], url_path="complaint-according-user")
    def complaint_according_user(self, request, *args, **kwargs):
        user_id = request.data.get("user_id")

        if not user_id:
            return Response({"success": False, "message": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        complaints = Complaint.objects.filter(user__id=user_id)
        serializer = self.serializer_class(complaints, many=True)

        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


