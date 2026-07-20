from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi_crons import Crons
from starlette.responses import FileResponse

from src.api import api_router
from src.core.lifespan import lifespan
from src.core.middleware.auth import AuthMiddleware
from src.core.middleware.rate_limiting import RateLimitingMiddleware
from src.core.middleware.throttling import ThrottlingMiddleware
from src.core.settings import settings
from src.db import get_session
from src.repositories.auth import AuthSessionRepository
from src.repositories.tasks import TaskRepository

app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory=settings.static_dir), name="static")


# Last middleware added - first to be executed
app.add_middleware(AuthMiddleware)
app.add_middleware(RateLimitingMiddleware)
app.add_middleware(ThrottlingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)
app.include_router(api_router)


@app.get("/")
def read_root():
    if settings.app_env == "prod":
        return FileResponse(path="static/frontend/index.html")
    return {"status": "ok"}


crons = Crons(app)


# every day at midnight
@crons.cron("0 0 * * *")
async def delete_expired_tasks():
    async for session in get_session():
        task_service = TaskRepository()
        await task_service.delete_all_expired(session=session)


# every day at midnight
@crons.cron("0 0 * * *")
async def deleted_expired_auth_sessions():
    async for session in get_session():
        auth_session_repository = AuthSessionRepository()
        await auth_session_repository.delete_all_expired(session=session)
