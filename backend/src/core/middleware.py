from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from src.core.settings import settings

# TODO
# ? Rate limiting (for preventing brute-force)
# ? Logging       (for auditing auth attempts)
# ? Long token - must-have
# ? Timing attack prevention


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        auth_token = request.headers.get("auth-token")
        if auth_token != settings.auth_token:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid credentials."},
            )

        return await call_next(request)
