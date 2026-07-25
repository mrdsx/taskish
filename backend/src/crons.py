import httpx

from src.db import get_session
from src.main import crons
from src.repositories.auth import AuthSessionRepository
from src.repositories.daily_tasks import DailyTaskRepository
from src.repositories.tasks import TaskRepository
from src.services.backup import BackupService
from src.services.daily_tasks import DailyTaskService
from src.services.export import ExportService
from src.services.tasks import TaskService


# every day at midnight
@crons.cron("0 0 * * *")
async def delete_expired_tasks():
    task_repository = TaskRepository()
    async for session in get_session():
        await task_repository.delete_all_expired(session=session)

    print("Deleted expired tasks")


# every day at midnight
@crons.cron("0 0 * * *")
async def mark_all_daily_tasks_as_not_completed():
    daily_task_repository = DailyTaskRepository()
    async for session in get_session():
        await daily_task_repository.mark_all_as_not_completed(session=session)

    print("Marked all daily tasks as not completed")


# every day at midnight
@crons.cron("0 0 * * *")
async def deleted_expired_auth_sessions():
    auth_session_repository = AuthSessionRepository()
    async for session in get_session():
        await auth_session_repository.delete_all_expired(session=session)

    print("Deleted expired auth sessions")


# every 6 hours
@crons.cron("0 */6 * * *", max_retries=5)
async def backup_data():
    export_service = ExportService()
    task_repository = TaskRepository()
    task_service = TaskService()
    daily_task_repository = DailyTaskRepository()
    daily_task_service = DailyTaskService()
    backup_service = BackupService()

    async for session in get_session():
        backup_data = await export_service.export_tasks_data(
            task_repository=task_repository,
            task_service=task_service,
            daily_task_repository=daily_task_repository,
            daily_task_service=daily_task_service,
            session=session,
        )

        async with httpx.AsyncClient(timeout=5) as http_client:
            await backup_service.perform_backup(
                backup_data=backup_data,
                http_client=http_client,
            )


print("Registered cron jobs.")
