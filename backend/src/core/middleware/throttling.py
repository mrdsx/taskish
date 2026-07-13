import asyncio

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from src.core.settings import settings


class ThrottlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        if settings.app_env == "dev":
            await asyncio.sleep(settings.throttling_delay_seconds)

        return await call_next(request)
