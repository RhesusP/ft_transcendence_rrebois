from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .views import authenticate_user
import json

class UserConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = await self.get_user()
        if self.user.is_authenticated:
            await self.accept()
            await self.channel_layer.group_add(f"user_{self.user.id}", self.channel_name)
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'user') and self.user.is_authenticated:
            await self.channel_layer.group_discard(f"user_{self.user.id}", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Handle received messages

    async def send_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))

    @database_sync_to_async
    def get_user(self):
        return authenticate_user(self.scope['headers'])
