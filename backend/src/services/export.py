from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.daily_tasks import DailyTaskRepository
from src.repositories.tasks import TaskRepository
from src.schemas.export import ExportedTasksOut
from src.services.daily_tasks import DailyTaskService
from src.services.tasks import TaskService


class ExportService:
    async def export_tasks_data(
        self,
        task_repository: TaskRepository,
        task_service: TaskService,
        daily_task_repository: DailyTaskRepository,
        daily_task_service: DailyTaskService,
        session: AsyncSession,
    ) -> ExportedTasksOut:
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
        raw_data = {"tasks": tasks, "daily_tasks": daily_tasks, "trash": deleted_tasks}

        return ExportedTasksOut.model_validate(raw_data)
