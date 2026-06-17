from fastapi import FastAPI
from fastapi_crons import Crons

from src.api import api_router
from src.core.lifespan import lifespan
from src.core.middleware import AuthMiddleware
from src.db import get_session
from src.services.tasks import TaskService

app = FastAPI(lifespan=lifespan)
crons = Crons(app)


@app.get("/")
def read_root():
    return {"status": "ok"}


@crons.cron("0 0 * * *")
async def delete_expired_tasks():
    async for session in get_session():
        task_service = TaskService()
        await task_service.delete_expired_tasks(session=session)


app.add_middleware(AuthMiddleware)
app.include_router(api_router)
