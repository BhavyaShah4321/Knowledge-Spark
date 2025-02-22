from django.urls import re_path
from videocall.consumers import VideoCallConsumer,VideoChatConsumer
from chat.consumers import ChatConsumer
from videocall.models import VideoRoom 
from chat.models import ChatID,ChatMessage
from django.urls import path

websocket_urlpatterns = [
    path("ws/chat/<str:id>/",ChatConsumer.as_asgi()),
    path("ws/video-call/<str:id>/",VideoCallConsumer.as_asgi()),
    # path("ws/video-chat/<str:id>/",VideoChatConsumer.as_asgi()),
    
]
