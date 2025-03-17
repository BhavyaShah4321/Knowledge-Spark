from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from rest_framework import status
from chat.models import ChatID,ChatMessage
from chat.serilaizer import ChatIDSerializer,ChatMessageSerializer
from rest_framework.decorators import action
from django.db.models import Q
from utils.pagination import mypagination
from django.db.models import Max
from django.db.models import Max, Q, F
from django.db.models import Q
from videocall.models import VideoRoom
from django.db.models.functions import Coalesce

class ChatIDViewSet(ModelViewSet):
    queryset = ChatID.objects.filter(deleted=0)
    serializer_class = ChatIDSerializer
    pagination_class=mypagination
    
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = ["user_1__username", "user_2__username", "uuid"]
    ordering_fields = ["id", "uuid"]

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
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": True,"message":"chat successfully created", "data": serializer.data},
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
                {"success": True,"message":"chat successfully updated", "data": serializer.data},
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
        instance.deleted=1
        instance.save()
        return Response(
            {"success": True, "message": "ChatID deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )
        
    
    @action(detail=False, methods=["POST",], url_path="chatid-according-user")
    def chatid_according_user(self, request, *args, **kwargs):
        user_id = request.data.get("user_id")

        if not user_id:
            return Response(
                {"success": False, "message": "user_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = int(user_id)
        except ValueError:
            return Response(
                {"success": False, "message": "Invalid user_id format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        chatid_instance = ChatID.objects.filter(
            Q(user_1__id=user_id) | Q(user_2__id=user_id)
        ).annotate(
            latest_message=Coalesce(
                Max("messages__created_at"),  # Get latest message timestamp
                F("created_at")  # Default to chat creation time if no messages exist
            )
        ).order_by("-latest_message")  # Sort from latest to oldest

        page = self.paginate_queryset(chatid_instance)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(chatid_instance, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=["POST"], url_path="chatids-admin")
    def chatids_admin(self, request, *args, **kwargs):
        user = request.user

        if not user.is_superuser:
            return Response(
                {"success": False, "message": "Only admin an use this api ."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        chatid_instance = ChatID.objects.all().annotate(
            latest_message=Coalesce(
                Max("messages__created_at"),  # Get latest message timestamp
                F("created_at")  # Default to chat creation time if no messages exist
            )
        ).order_by("-latest_message")  # Sort from latest to oldest

        page = self.paginate_queryset(chatid_instance)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(chatid_instance, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
    
    
    
    @action(detail=False, methods=["POST"], url_path="get-chat-by-videocall-id")
    def get_chat_videocall_id(self, request, *args, **kwargs):
        video_call_uuid = request.data.get("uuid")
        
        if not video_call_uuid:
            return Response({"success": False, "message": "Video call UUID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            video_call_instance = VideoRoom.objects.get(uuid=video_call_uuid)
        except VideoRoom.DoesNotExist:
            return Response({"success": False, "message": "Video call with this UUID does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Get the chat ID based on teacher and student
        chat_id_instance = ChatID.objects.filter(
            Q(user_1=video_call_instance.teacher, user_2=video_call_instance.student) | 
            Q(user_2=video_call_instance.teacher, user_1=video_call_instance.student)
        ).first()  # Use `.first()` instead of `.get()` to avoid multiple object errors

        if not chat_id_instance:
            return Response({"success": False, "message": "Chat ID with these users does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ChatIDSerializer(chat_id_instance)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

class ChatMessageViewSet(ModelViewSet):
    queryset = ChatMessage.objects.filter(deleted=0)
    serializer_class = ChatMessageSerializer
    pagination_class=mypagination
    
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = [
            "sender__username",
            "message",
            "chatid__uuid",
            "created_at",
            "updated_at",]
    ordering_fields = [
            "sender__username",
            "message",
            "chatid__uuid",
            "created_at",
            "updated_at",]

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
        instance.deleted=1
        instance.save()
        
        return Response(
            {"success": True, "message": "ChatID deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )
        
    @action(detail=False, methods=["GET"], url_path="chat-message-according-chat")
    def chat_message_according_chat(self, request, *args, **kwargs):
        chat_uuid = request.query_params.get("uuid")

        if not chat_uuid:
            return Response({"success": False, "message": "uuid is required"}, status=status.HTTP_400_BAD_REQUEST)

        chat_instances = ChatMessage.objects.filter(chatid__uuid=chat_uuid).order_by("id")
        serializer = self.get_serializer(chat_instances, many=True)

        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)