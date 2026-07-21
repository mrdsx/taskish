from datetime import timedelta

from argon2 import PasswordHasher
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from src.core.settings import settings
from src.db import get_session
from src.repositories.auth import AuthSessionRepository
from src.services.auth import AuthService
from src.utils.time import get_now

auth_session_repository = AuthSessionRepository()
hasher = PasswordHasher()
auth_service = AuthService()


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        if request.client is None:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Client info is missing"},
            )

        path = request.scope.get("path")
        if (
            path is not None
            and isinstance(path, str)
            and (not path.startswith("/api") or path.startswith("/api/auth/login"))
        ):
            return await call_next(request)

        ip = request.client.host
        session_token = request.cookies.get(settings.session_token_cookie)
        if session_token is None:
            return auth_service.handle_failed_auth(ip)

        async for session in get_session():
            now = get_now()
            # TODO: extract to service method
            db_auth_session = await auth_session_repository.fetch_by_token(
                session_token=session_token,
                session=session,
            )
            if db_auth_session is None or db_auth_session.expires_at <= now:
                return auth_service.handle_failed_auth(ip)
            else:
                db_auth_session.last_login = now
                db_auth_session.ip_address = ip
                if db_auth_session.expires_at - now < timedelta(
                    days=settings.expiring_auth_session_days,
                ):
                    db_auth_session.expires_at = now + timedelta(
                        days=settings.auth_session_expiration_time_days,
                    )
                await session.commit()

        error_result = auth_service.handle_successful_auth(ip)
        if error_result is not None:
            return error_result

        return await call_next(request)
