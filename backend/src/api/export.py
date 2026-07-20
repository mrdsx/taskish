from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.repositories.tasks import TaskRepository
from src.schemas.export import ExportedTasksOut

router = APIRouter(prefix="/export")


@router.get("/json", response_model=ExportedTasksOut)
async def export_tasks_to_json(
    task_repository: Annotated[TaskRepository, Depends(TaskRepository)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    tasks = await task_repository.fetch_all(session=session)
    deleted_tasks = await task_repository.fetch_all(deleted=True, session=session)

    return {"tasks": tasks, "trash": deleted_tasks}
