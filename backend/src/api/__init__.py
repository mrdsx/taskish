from fastapi import APIRouter

from .auth import router as auth_router
from .daily_tasks import router as daily_tasks_router
from .export import router as export_router
from .tasks import router as tasks_router
from .trash import router as trash_router

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(daily_tasks_router)
api_router.include_router(export_router)
api_router.include_router(tasks_router)
api_router.include_router(trash_router)
