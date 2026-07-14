from fastapi import APIRouter

from .request_attempts import router as request_attempts_router
from .tasks import router as tasks_router
from .trash import router as trash_router

api_router = APIRouter(prefix="/api")
api_router.include_router(request_attempts_router)
api_router.include_router(tasks_router)
api_router.include_router(trash_router)
