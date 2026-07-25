from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.tasks import TaskService
from src.db import get_session
from src.repositories.daily_tasks import DailyTaskRepository
from src.repositories.tasks import TaskRepository
from src.schemas.export import ExportedTasksOut
from src.services.daily_tasks import DailyTaskService
from src.services.export import ExportService

router = APIRouter(prefix="/export")


@router.get("/json")
async def export_tasks_to_json(
    task_repository: Annotated[TaskRepository, Depends(TaskRepository)],
    task_service: Annotated[TaskService, Depends(TaskService)],
    daily_task_repository: Annotated[DailyTaskRepository, Depends(DailyTaskRepository)],
    daily_task_service: Annotated[DailyTaskService, Depends(DailyTaskService)],
    export_service: Annotated[ExportService, Depends(ExportService)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> ExportedTasksOut:
    return await export_service.export_tasks_data(
        task_repository=task_repository,
        task_service=task_service,
        daily_task_repository=daily_task_repository,
        daily_task_service=daily_task_service,
        session=session,
    )
