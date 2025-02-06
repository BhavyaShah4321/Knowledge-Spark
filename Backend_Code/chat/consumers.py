from channels.generic.websocket import AsyncJsonWebsocketConsumer
# from video_call.models import ChatMessage,ChatRoom
from videocall.models import VideoRoom
from chat.models import ChatID,ChatMessage
import json
from user.models import User

from asgiref.sync import sync_to_async
class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.last_key = self.scope['path'].rstrip('/').split('/')[-1]
        self.room_name = f"chat_name_{self.last_key}"
        
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()
        
    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        text_data_json = json.loads(text_data)
        type = text_data_json.get("type")
        
        if type == "chat_message":
            message = text_data_json.get("message")
            sender = text_data_json.get("sender")
            sender_username = text_data_json.get("sender_username")
            sender_image = text_data_json.get("sender_image")
            
            chat_message = await self.chat_message_create(message=message, sender=sender, chatroom=self.last_key)
            print(chat_message)
            created_at = chat_message.created_at.isoformat()
            
            await self.channel_layer.group_send(self.room_name, {
                "type": "single_chat_message",
                "message": message,
                "sender": sender,
                "sender_username": sender_username,
                "sender_image": sender_image,
                "created_at": created_at
            })
            
        if type=='typing_start':
            user = text_data_json.get("user")
            sender_username = text_data_json.get("sender_username")
            sender_image = text_data_json.get("sender_image")
            await self.channel_layer.group_send(self.room_name,{
                "type": "typing_start",
                "sender": sender,
                "sender_username": sender_username,
                "sender_image": sender_image,
            })
            
        if type=="typing_end":
            sender = text_data_json.get("sender")
            sender_username = text_data_json.get("sender_username")
            sender_image = text_data_json.get("sender_image")
            await self.channel_layer.group_send(self.room_name,{
                "type": "typing_end",
                "sender": sender,
                "sender_username": sender_username,
                "sender_image": sender_image,
            })
            
        
    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)
        print("disconnected")
        
    async def single_chat_message(self, text_data):
        print(text_data["created_at"])
        await self.send(json.dumps({
            "type": "chat_message",
            "message": text_data["message"],
            "sender": text_data["sender"],
            "sender_username": text_data["sender_username"],
            "sender_image": text_data["sender_image"],
            "created_at": text_data["created_at"],
        }))
        
    async def typing_end(self,text_data):
        await self.send(json.dumps({
            "type": "typing_end",
            "sender": text_data["sender"],
            "sender_username": text_data["sender_username"],
            "sender_image": text_data["sender_image"],
        }))
        
    async def typing_start(self,text_data):
        await self.send(json.dumps({
            "type": "typing_start",
            "sender": text_data["sender"],
            "sender_username": text_data["sender_username"],
            "sender_image": text_data["sender_image"],
        }))
    @sync_to_async
    def chat_message_create(self, message, sender, chatroom):
        try:
            sender = User.objects.get(id=int(sender))
            chat_room_instance = ChatID.objects.get(uuid=chatroom)

            chat_message_instance = ChatMessage.objects.create(
                message=message,
                sender=sender,
                chatid=chat_room_instance
            )

            return chat_message_instance
        except (User.DoesNotExist, ValueError, TypeError) as e:
            print(f"Error creating chat message: {e}")
            return None


    
            
        