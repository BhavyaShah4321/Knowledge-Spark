from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action
from videocall.models import VideoRoom,VideoChatRoom,VideoChatMessage
from videocall.serilaizer import VideoRoomSerializer,VideoChatMessageSerializer,VideoChatRoomSerializer
import uuid
from django.utils import timezone  
from utils.pagination import mypagination


class VideoRoomViewSet(ModelViewSet):
    queryset = VideoRoom.objects.all().order_by("-id")
    serializer_class = VideoRoomSerializer
    pagination_class=mypagination
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = ["uuid", "created_by__username","teacher_username","student_username","start","end","duration"]
    ordering_fields = ["uuid", "created_at", "updated_at","teacher_username","student_username","start","end","duration"]

    def list(self, request, *args, **kwargs):
        """List all feedback with optional pagination."""
        queryset = self.filter_queryset(self.get_queryset())
        no_pagination = request.query_params.get("no_pagination", "false").lower() == "true"

        if no_pagination:
            serializer = self.get_serializer(queryset, many=True)
            return Response(
                {"success": True, "data": serializer.data}, 
                status=status.HTTP_200_OK
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

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
        data["uuid"] = str(uuid.uuid4())

        data["created_at"]=timezone.now()# Generate unique UUID
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
        request.data["updated_at"]=timezone.now()# Generate unique UUID
        
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


    @action(detail=False, methods=["POST"], url_path="endvideocall")
    def endvideocall(self, request, *args, **kwargs):
        uuid = request.data.get("uuid")  # Use `.get()` instead of `()`

        try:
            video_instance = VideoRoom.objects.get(uuid=uuid)
        except VideoRoom.DoesNotExist:
            return Response(
                {"success": False, "message": f"No VideoRoom with uuid {id} found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not video_instance.start:
            return Response(
                {"success": False, "message": "Start time is missing."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        video_instance.end = timezone.now()
        duration = (video_instance.end - video_instance.start).total_seconds()  # Duration in seconds

        video_instance.status = "Completed"
        video_instance.duration=f"{int(duration // 60)} minutes {int(duration % 60)} seconds"
        video_instance.save()
        
        serilaizer=self.serializer_class(video_instance)

        return Response(
            {
                "success": True,
                "message": "Video call ended successfully.",
                "data": serilaizer.data,
            },
            status=status.HTTP_200_OK,
        )
        
    @action(detail=False,methods=["POST",],url_path="check-uuid")
    def check_uuid(self,request,*args,**kwarsg):
        uuid=request.data.get("uuid")
        
        if not uuid:
            return Response ({"success":False,"message":"uuid is required"},status=status.HTTP_400_BAD_REQUEST)
        
        try:
            video_call_instance=VideoRoom.objects.get(uuid=uuid)

        except VideoRoom.DoesNotExist:
            return Response ({"success":False,"message":"video link is invalid"},status=status.HTTP_400_BAD_REQUEST)
        
        
        return Response({"success":True,"message":"video call found successfully"},status=status.HTTP_200_OK)
    
    
    @action(detail=False,methods=["POST",],url_path="get-video-call-by-student")
    def get_video_call_by_student(self,request,*args,**kwargs):
        student_id=request.data.get("student_id")
        
        if not student_id:
            return Response({"success":False,"message":"student id is required"},status=status.HTTP_400_BAD_REQUEST)
        
            
        videocall_instance=VideoRoom.objects.filter(student=student_id)
        page = self.paginate_queryset(videocall_instance)
        
        if  page is not None :
            serializer = self.get_serializer(page, many=True)
            
            return self.get_paginated_response(serializer.data)
        
        serilaizer=self.serializer_class(videocall_instance)
        return Response({"success":True,"data":serilaizer.data},status=status.HTTP_200_OK)
        
        
    @action(detail=False,methods=["POST"],url_path="get-video-call-by-teacher")
    def get_video_call_by_teacher(self,request,*args,**kwargs):
        teacher_id=request.data.get("teacher_id")
        
        if not teacher_id:
            return Response({"success":False,"message":"teacher id is required"},status=status.HTTP_400_BAD_REQUEST)
        
            
        videocall_instance=VideoRoom.objects.filter(teacher=teacher_id)
        page = self.paginate_queryset(videocall_instance)
        
        if  page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serilaizer=self.serializer_class(videocall_instance)
        return Response({"success":True,"data":serilaizer.data},status=status.HTTP_200_OK)
        
        

class VideoChatRoomViewSet(ModelViewSet):
    queryset = VideoChatRoom.objects.all()
    serializer_class = VideoChatRoomSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = ["uuid", "created_by__username"]
    ordering_fields = ["uuid", "created_at", "updated_at"]
    
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


    def create(self, request, *args, **kwargs):
        data = request.data
        data["created_by"] = request.user.id

        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": True, "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {"success": False, "message": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
            
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.serializer_class(instance)
        return Response(
            {"success": True, "data": serializer.data},
            status=status.HTTP_200_OK,
        )


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(
            {"success": True, "message": "Chat room deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class VideoChatMessageViewSet(ModelViewSet):
    queryset = VideoChatMessage.objects.all()
    serializer_class = VideoChatMessageSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = ["message", "user__username",
            "chatroom_uuid",]
    ordering_fields = ["created_at", "updated_at","chatroom",
            "chatroom_uuid"]
    
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


    def create(self, request, *args, **kwargs):
        data = request.data
        data["user"] = request.user.id

        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": True, "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {"success": False, "message": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
            
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.serializer_class(instance)
        return Response(
            {"success": True, "data": serializer.data},
            status=status.HTTP_200_OK,
        )


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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(
            {"success": True, "message": "Chat message deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


    @action(detail=False,methods=["POST",],url_path="get-chat-message-uuid")
    def get_chat_message_from_uuid(self,request,*args,**kwargs):
        print(request.data)
        uuid=request.data.get("uuid")
        if not uuid:
            return Response({"success":False,"message":"UUID is required"},status=status.HTTP_400_BAD_REQUEST)
        
        chat_message_instance=VideoChatMessage.objects.filter(chatroom__uuid=uuid)
        
        serilaizer=VideoChatMessageSerializer(chat_message_instance,many=True)
        return Response({"success": True, "data": serilaizer.data},
            status=status.HTTP_200_OK,)
        
        
        