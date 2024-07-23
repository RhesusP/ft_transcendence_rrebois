from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from rest_framework.exceptions import AuthenticationFailed
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from .views import authenticate_user
from .models import User
import jwt
import logging

logger = logging.getLogger(__name__)

class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        logger.debug("Processing request in JWTAuthenticationMiddleware")
        jwt_cookie = request.COOKIES.get('jwt_access')
        logger.debug(f"JWT Cookie: {jwt_cookie}")

        if jwt_cookie:
            try:
                user = authenticate_user(request)
                request.user = user
                logger.debug(f"Authenticated user: {user.username}")
            except AuthenticationFailed:
                request.user = AnonymousUser()
                logger.debug("Authentication failed, setting user as AnonymousUser")
        else:
            request.user = AnonymousUser()
            logger.debug("JWT cookie not found, setting user as AnonymousUser")


# class JWTAuthWSMiddleware:
#

class JWTAuthWSMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        logger.debug("JWTAuthWSMiddleware called")
        query_string = scope["query_string"].decode()
        params = dict(qp.split("=") for qp in query_string.split("&") if "=" in qp)
        token = params.get("token", None)

        if token:
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('user_id')
                user = await self.get_user(user_id)
                scope['user'] = user
                logger.debug(f"Authenticated user: {user.username}")
            except jwt.ExpiredSignatureError:
                logger.debug("Token expired")
                scope['user'] = AnonymousUser()
            except jwt.InvalidTokenError:
                logger.debug("Invalid token")
                scope['user'] = AnonymousUser()
        else:
            logger.debug("No token provided")
            scope['user'] = AnonymousUser()

        return await self.app(scope, receive, send)


    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()
