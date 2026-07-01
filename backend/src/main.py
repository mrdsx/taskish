from fastapi import FastAPI
from fastapi_crons import Crons

from src.api import api_router
from src.core.lifespan import lifespan
from src.core.middleware.auth import AuthMiddleware
from src.core.middleware.rate_limiting import RateLimitingMiddleware
from src.db import get_session
from src.services.tasks import TaskService

# TODO
# ? Logging (for auditing auth attempts)

app = FastAPI(lifespan=lifespan)
crons = Crons(app)


@app.get("/")
def read_root():
    return {"status": "ok"}


# every day at midnight
@crons.cron("0 0 * * *")
async def delete_expired_tasks():
    async for session in get_session():
        task_service = TaskService()
        await task_service.delete_expired_tasks(session=session)


# Last middleware added - first to be executed
app.add_middleware(AuthMiddleware)
app.add_middleware(RateLimitingMiddleware)
app.include_router(api_router)
