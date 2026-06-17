from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from src.core.settings import settings

# TODO
# ? Rate limiting (for preventing brute-force)
# ? Logging       (for auditing auth attempts)

hasher = PasswordHasher()


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        auth_token = request.headers.get("auth-token")
        if auth_token is None:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid credentials."},
            )

        try:
            hasher.verify(hash=settings.auth_token, password=auth_token)
        except VerifyMismatchError:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid credentials."},
            )

        return await call_next(request)
