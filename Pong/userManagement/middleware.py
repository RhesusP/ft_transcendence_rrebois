from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from rest_framework.exceptions import AuthenticationFailed
from channels.middleware import BaseMiddleware
from .views import authenticate_user
from .models import User
import jwt
import logging

logger = logging.getLogger('userManagement')


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


class JWTAuthMiddlewareStack(BaseMiddleware):
    # async def __call__(self, scope, receive, send):
    #     # Get the token from the query string
    #     query_string = scope.get('query_string', b'').decode()
    #     token = None
    #     for param in query_string.split('&'):
    #         if param.startswith('token='):
    #             token = param.split('=')[1]
    #             break
    #
    #     if not token:
    #         # If no token in query string, check headers
    #         headers = dict(scope['headers'])
    #         if b'authorization' in headers:
    #             try:
    #                 token_name, token_key = headers[b'authorization'].decode().split()
    #                 if token_name == 'Bearer':
    #                     token = token_key
    #             except ValueError:
    #                 token = None
    #
    #     if token:
    #         try:
    #             # Decode the JWT
    #             payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
    #             user_id = payload.get('id')
    #             user = await self.get_user(user_id)
    #             scope['user'] = user
    #         except jwt.ExpiredSignatureError:
    #             scope['user'] = AnonymousUser()
    #         except jwt.InvalidTokenError:
    #             scope['user'] = AnonymousUser()
    #     else:
    #         scope['user'] = AnonymousUser()
    #
    #     return await super().__call__(scope, receive, send)
    async def __call__(self, scope, receive, send):
        query_string = scope["query_string"].decode()
        params = dict(qp.split("=") for qp in query_string.split("&") if "=" in qp)
        token = params.get("token", None)

        if token:
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('user_id')
                user = await self.get_user(user_id)
                scope['user'] = user
            except jwt.ExpiredSignatureError:
                scope['user'] = AnonymousUser()
            except jwt.InvalidTokenError:
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)
