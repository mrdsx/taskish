from src.db import get_session
from src.main import crons
from src.repositories.auth import AuthSessionRepository
from src.repositories.daily_tasks import DailyTaskRepository
from src.repositories.tasks import TaskRepository


# every day at midnight
@crons.cron("0 0 * * *")
async def delete_expired_tasks():
    async for session in get_session():
        task_repository = TaskRepository()
        await task_repository.delete_all_expired(session=session)

    print("Deleted expired tasks")


# every day at midnight
@crons.cron("0 0 * * *")
async def mark_all_daily_tasks_as_not_completed():
    async for session in get_session():
        daily_task_repository = DailyTaskRepository()
        await daily_task_repository.mark_all_as_not_completed(session=session)

    print("Marked all daily tasks as not completed")


# every day at midnight
@crons.cron("0 0 * * *")
async def deleted_expired_auth_sessions():
    async for session in get_session():
        auth_session_repository = AuthSessionRepository()
        await auth_session_repository.delete_all_expired(session=session)

    print("Deleted expired auth sessions")


print("Cron jobs registered")
