from channels.generic.websocket import AsyncJsonWebsocketConsumer
# from video_call.models import ChatMessage,ChatRoom
from videocall.models import VideoRoom
from chat.models import ChatID,ChatMessage
import json
from user.models import User

from asgiref.sync import sync_to_async
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
            print(text_data_json["user_username"])
            
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
            
            
            
    async def video_call_join(self,text_data):
        await self.send(json.dumps({
            "type":text_data["type"],
            "user":text_data["user"],
            "user_username":text_data["user_username"],
            "user_uuid":text_data["user_uuid"],
        }))
        
    async def video_call_offer(self,text_data):
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
        
        
            
            
        