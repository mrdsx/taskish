from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from src.core.settings import settings
from src.services.auth import AuthService

hasher = PasswordHasher()
auth_service = AuthService()


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        if request.client is None:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Client info is missing"},
            )

        ip = request.client.host
        auth_token = request.headers.get("auth-token")
        if auth_token is None:
            return AuthService.handle_failed_auth(ip)

        try:
            hasher.verify(hash=settings.auth_token, password=auth_token)
        except VerifyMismatchError:
            return AuthService.handle_failed_auth(ip)

        result = AuthService.handle_successful_auth(ip)
        if result is not None:
            return result

        return await call_next(request)
