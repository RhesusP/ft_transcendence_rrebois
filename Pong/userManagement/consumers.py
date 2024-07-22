import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .views import authenticate_user
from .models import User
import json

class UserConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        logging.debug(f"User is {str(self.scope['user'])}")
        if user.is_anonymous:
            await self.close()
        else:
            await self.accept()

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
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()
