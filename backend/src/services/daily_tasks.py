from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.daily_tasks import DB_DailyTask
from src.repositories.daily_tasks import DailyTaskRepository
from src.schemas.daily_tasks import DailyTaskIn


class DailyTaskService:
    async def update_by_id(
        self,
        id: int,
        task: DailyTaskIn,
        daily_task_repository: DailyTaskRepository,
        session: AsyncSession,
    ) -> DB_DailyTask:
        db_task = await daily_task_repository.update_by_id(
            id=id, task=task, session=session
        )
        if db_task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Daily task not found",
            )

        return db_task

    async def delete_by_id(
        self, id: int, daily_task_repository: DailyTaskRepository, session: AsyncSession
    ) -> None:
        db_task = await daily_task_repository.delete_by_id(id=id, session=session)
        if db_task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Daily task not found",
            )
