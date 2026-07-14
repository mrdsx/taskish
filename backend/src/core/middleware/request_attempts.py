from fastapi import BackgroundTasks, Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from src.db import get_session
from src.services.request_attempts import RequestAttemptsService

request_attempts_service = RequestAttemptsService()


class RequestAttemptsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        if request.client is None:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "Client info is missing"},
            )

        bg_tasks = BackgroundTasks()
        async for session in get_session():
            bg_tasks.add_task(
                request_attempts_service.upsert_request_attempt,
                host=request.client.host,
                session=session,
            )
        response = await call_next(request)
        response.background = bg_tasks

        return response
