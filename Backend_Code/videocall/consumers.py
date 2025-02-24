from channels.generic.websocket import AsyncJsonWebsocketConsumer
# from video_call.models import ChatMessage,ChatRoom
from videocall.models import VideoRoom
from chat.models import ChatID,ChatMessage
import json
from user.models import User

from asgiref.sync import sync_to_async
from videocall.models import VideoChatRoom
from django.utils import timezone  

class VideoCallConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.last_key = self.scope['path'].rstrip('/').split('/')[-1]
        
        self.video_room_name=f"video_call_{self.last_key}"
        await self.channel_layer.group_add(self.video_room_name,self.channel_name)
        
        await self.accept()
        
        return super().connect()
    
    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        text_data_json=json.loads(text_data)
        if text_data_json["type"]=="video_call_join":
            await self.channel_layer.group_send(self.video_room_name,{
                "type":text_data_json["type"],
                "user":text_data_json["user"],
                "user_username":text_data_json["user_username"],
                "user_uuid":text_data_json["user_uuid"]
            })
            
        if text_data_json["type"]=="video_call_offer":
            print(text_data_json["user_uuid_by"])
            
            await self.channel_layer.group_send(self.video_room_name,{
                "type":text_data_json["type"],
                "user":text_data_json["user"],
                "user_username":text_data_json["user_username"],
                "offer":text_data_json["offer"],
                "user_uuid_for":text_data_json["user_uuid_for"],
                "user_uuid_by":text_data_json["user_uuid_by"],
            }) 
            
        if text_data_json["type"]=="video_call_answer":
            await self.channel_layer.group_send(self.video_room_name,{
                "type":text_data_json["type"],
                "user":text_data_json["user"],
                "user_username":text_data_json["user_username"],
                
                "answer":text_data_json["answer"],
                "user_uuid_for":text_data_json["user_uuid_for"],
                "user_uuid_by":text_data_json["user_uuid_by"],
            }) 
            
        if text_data_json["type"]=="video_call_candidate":
            await self.channel_layer.group_send(self.video_room_name,{
                "type":text_data_json["type"],
                "user":text_data_json["user"],
                "candidate":text_data_json["candidate"],
                "user_uuid_for":text_data_json["user_uuid_for"],
                "user_uuid_by":text_data_json["user_uuid_by"],
            }) 
            
        if text_data_json["type"]=="video_call_end_call":
            await self.channel_layer.group_send(self.video_room_name,{
                "type":text_data_json["type"],
                "user":text_data_json["user"],
                "user_username":text_data_json["user_username"],
                "user_uuid_for":text_data_json["user_uuid_for"],
                "user_uuid_by":text_data_json["user_uuid_by"],
            })
            
        if text_data_json["type"]=="video_call_video_toggle":
            await self.channel_layer.group_send(self.video_room_name,{
                "type":text_data_json["type"],
                "user":text_data_json["user"],
                "user_username":text_data_json["user_username"],
                "user_uuid_for":text_data_json["user_uuid_for"],
                "user_uuid_by":text_data_json["user_uuid_by"],
            })  
            
    
        if text_data_json["type"]=="video_call_audio_toggle":
                await self.channel_layer.group_send(self.video_room_name,{
                    "type":text_data_json["type"],
                    "user":text_data_json["user"],
                    "user_username":text_data_json["user_username"],
                    "user_uuid_for":text_data_json["user_uuid_for"],
                    "user_uuid_by":text_data_json["user_uuid_by"],
                })  
            
            
    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.video_room_name, self.channel_name)
            
    async def video_call_join(self,text_data):
        await self.send(json.dumps({
            "type":text_data["type"],
            "user":text_data["user"],
            "user_username":text_data["user_username"],
            "user_uuid":text_data["user_uuid"],
        }))
        
    async def video_call_offer(self,text_data):
        print(text_data["user_uuid_by"])
        
        await self.send(json.dumps({
            "type":text_data["type"],
            "user":text_data["user"],
            "offer":text_data["offer"],
            "user_username":text_data["user_username"],
            "user_uuid_for":text_data["user_uuid_for"],
            "user_uuid_by":text_data["user_uuid_by"],
        }))
        
    async def video_call_answer(self,text_data):
        await self.send(json.dumps({
            "type":text_data["type"],
            "user":text_data["user"],
            "answer":text_data["answer"],
            "user_username":text_data["user_username"],
            "user_uuid_for":text_data["user_uuid_for"],
            "user_uuid_by":text_data["user_uuid_by"],
        }))
        
    async def video_call_candidate(self,text_data):
        await self.send(json.dumps({
            "type":text_data["type"],
            "user":text_data["user"],
            "candidate":text_data["candidate"],
            "user_uuid_for":text_data["user_uuid_for"],
            "user_uuid_by":text_data["user_uuid_by"],
        }))
        
    async def video_call_endcall(self,text_data):
        await self.send(json.dumps({
            "type":text_data["type"],
            "user":text_data["user"],
            "user_username":text_data["user_username"],
            "user_uuid_for":text_data["user_uuid_for"],
            "user_uuid_by":text_data["user_uuid_by"],
            
        }))
        
    async def video_call_end_call(self,text_data):
        await self.send(json.dumps({
            "type":text_data["type"],
            "user":text_data["user"],
            "user_username":text_data["user_username"],
            "user_uuid_for":text_data["user_uuid_for"],
            "user_uuid_by":text_data["user_uuid_by"],
            
        }))
        
    async def video_call_video_toggle(self,text_data):
        await self.send(json.dumps({
            "type":text_data["type"],
            "user":text_data["user"],
            "user_username":text_data["user_username"],
            "user_uuid_for":text_data["user_uuid_for"],
            "user_uuid_by":text_data["user_uuid_by"],
            
        }))
        
    async def video_call_audio_toggle(self,text_data):
        await self.send(json.dumps({
            "type":text_data["type"],
            "user":text_data["user"],
            "user_username":text_data["user_username"],
            "user_uuid_for":text_data["user_uuid_for"],
            "user_uuid_by":text_data["user_uuid_by"],
            
        }))
        
class VideoChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.last_key = self.scope['path'].rstrip('/').split('/')[-1]
        self.room_name = f"chat_name_{self.last_key}"
        
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()
        
    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        print(text_data)
        text_data_json = json.loads(text_data)
        type = text_data_json.get("type")
        
        
        if type == "chat_message":
            message = text_data_json.get("message")
            user = text_data_json.get("user")
            user_username = text_data_json.get("user_username")
            user_image = text_data_json.get("user_image")
            
            chat_message = await self.chat_message_create(message=message, user=user, chatroom=self.last_key)
            created_at = chat_message.created_at.isoformat()
            
            await self.channel_layer.group_send(self.room_name, {
                "type": "single_chat_message",
                "message": message,
                "user": user,
                "user_username": user_username,
                "user_image": user_image,
                "created_at": created_at
            })
            
        if type=='typing_start':
            user = text_data_json.get("user")
            user_username = text_data_json.get("user_username")
            user_image = text_data_json.get("user_image")
            await self.channel_layer.group_send(self.room_name,{
                "type": "typing_start",
                "user": user,
                "user_username": user_username,
                "user_image": user_image,
            })
            
        if type=="typing_end":
            user = text_data_json.get("user")
            user_username = text_data_json.get("user_username")
            user_image = text_data_json.get("user_image")
            await self.channel_layer.group_send(self.room_name,{
                "type": "typing_end",
                "user": user,
                "user_username": user_username,
                "user_image": user_image,
            })
            
        
    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)
        print("disconnected")
        
    async def single_chat_message(self, text_data):
        print(text_data["created_at"])
        await self.send(json.dumps({
            "type": "chat_message",
            "message": text_data["message"],
            "user": text_data["user"],
            "user_username": text_data["user_username"],
            "user_image": text_data["user_image"],
            "created_at": text_data["created_at"],
        }))
        
    async def typing_end(self,text_data):
        await self.send(json.dumps({
            "type": "typing_end",
            "user": text_data["user"],
            "user_username": text_data["user_username"],
            "user_image": text_data["user_image"],
        }))
        
    async def typing_start(self,text_data):
        await self.send(json.dumps({
            "type": "typing_start",
            "user": text_data["user"],
            "user_username": text_data["user_username"],
            "user_image": text_data["user_image"],
        }))
    @sync_to_async
    def chat_message_create(self, message, user, chatroom):
        try:
            user_instance = User.objects.get(id=int(user))
            chat_room_instance = VideoChatRoom.objects.get(uuid=chatroom)

            chat_message_instance = ChatMessage.objects.create(
                message=message,
                user=user_instance,
                chatroom=chat_room_instance
            )

            return chat_message_instance
        except (User.DoesNotExist, ValueError, TypeError) as e:
            print(f"Error creating chat message: {e}")
            return None

