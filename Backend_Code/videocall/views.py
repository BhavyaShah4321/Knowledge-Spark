from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework_simplejwt.authentication import JWTAuthentication

from videocall.models import VideoRoom
from videocall.serilaizer import VideoRoomSerializer
import uuid

class VideoRoomViewSet(ModelViewSet):
    queryset = VideoRoom.objects.all()
    serializer_class = VideoRoomSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = ["uuid", "created_by__username"]
    ordering_fields = ["uuid", "created_at", "updated_at"]

    def list(self, request, *args, **kwargs):
        """Get a list of all video rooms"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {"success": True, "data": serializer.data}, 
            status=status.HTTP_200_OK
        )

    def retrieve(self, request, *args, **kwargs):
        """Retrieve details of a single video room"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            {"success": True, "data": serializer.data}, 
            status=status.HTTP_200_OK
        )

    def create(self, request, *args, **kwargs):
        """Create a new video room"""
        data = request.data.copy()
        data["created_by"] = request.user.id  # Assign current user
        data["uuid"] = str(uuid.uuid4())  # Generate unique UUID
        print(data)
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": True, "data": serializer.data}, 
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"success": False, "message": serializer.errors}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        """Update a video room (partial update allowed)"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": True, "data": serializer.data}, 
                status=status.HTTP_200_OK
            )
        return Response(
            {"success": False, "message": serializer.errors}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    def destroy(self, request, *args, **kwargs):
        """Delete a video room"""
        instance = self.get_object()
        instance.delete()
        return Response(
            {"success": True, "message": "Video room deleted successfully."}, 
            status=status.HTTP_204_NO_CONTENT
        )
