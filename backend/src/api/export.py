from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.tasks import TaskService
from src.db import get_session
from src.repositories.daily_tasks import DailyTaskRepository
from src.repositories.tasks import TaskRepository
from src.schemas.export import ExportedTasksOut
from src.services.daily_tasks import DailyTaskService

router = APIRouter(prefix="/export")


@router.get("/json", response_model=ExportedTasksOut)
async def export_tasks_to_json(
    task_repository: Annotated[TaskRepository, Depends(TaskRepository)],
    task_service: Annotated[TaskService, Depends(TaskService)],
    daily_task_repository: Annotated[DailyTaskRepository, Depends(DailyTaskRepository)],
    daily_task_service: Annotated[DailyTaskService, Depends(DailyTaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    tasks = await task_service.get_all(
        task_repository=task_repository,
        session=session,
    )
    daily_tasks = await daily_task_service.get_all(
        daily_task_repository=daily_task_repository,
        session=session,
    )
    deleted_tasks = await task_service.get_all(
        deleted=True,
        task_repository=task_repository,
        session=session,
    )

    return {"tasks": tasks, "daily_tasks": daily_tasks, "trash": deleted_tasks}
