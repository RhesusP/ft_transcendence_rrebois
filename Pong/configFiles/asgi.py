"""
ASGI config for configFiles project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from userManagement.middleware import JWTAuthWSMiddleware
from userManagement import consumers

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configFiles.settings')

websocket_urlpatterns = [
    re_path(r'ws/user/$', consumers.UserConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "https": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        JWTAuthWSMiddleware(
            URLRouter(
                websocket_urlpatterns
            )
        ),
    )
})
