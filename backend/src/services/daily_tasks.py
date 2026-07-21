from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.daily_tasks import DB_DailyTask
from src.repositories.daily_tasks import DailyTaskRepository
from src.schemas.daily_tasks import DailyTaskIn, DailyTaskListOut, DailyTaskOut


class DailyTaskService:
    async def get_all(
        self,
        daily_task_repository: DailyTaskRepository,
        session: AsyncSession,
    ) -> list[DailyTaskOut]:
        db_tasks = await daily_task_repository.fetch_all(session=session)

        return DailyTaskListOut.validate_python(db_tasks)

    async def create(
        self,
        task: DailyTaskIn,
        daily_task_repository: DailyTaskRepository,
        session: AsyncSession,
    ) -> DailyTaskOut:
        db_task = await daily_task_repository.create(task=task, session=session)

        return DailyTaskOut.model_validate(db_task)

    async def update_by_id(
        self,
        id: int,
        task: DailyTaskIn,
        daily_task_repository: DailyTaskRepository,
        session: AsyncSession,
    ) -> DailyTaskOut:
        db_task = await daily_task_repository.update_by_id(
            id=id,
            task=task,
            session=session,
        )
        self._raise_not_found_if_task_is_none(db_task=db_task)

        return DailyTaskOut.model_validate(db_task)

    async def delete_by_id(
        self,
        id: int,
        daily_task_repository: DailyTaskRepository,
        session: AsyncSession,
    ) -> None:
        db_task = await daily_task_repository.delete_by_id(id=id, session=session)
        self._raise_not_found_if_task_is_none(db_task=db_task)

    def _raise_not_found_if_task_is_none(self, db_task: DB_DailyTask | None) -> None:
        if db_task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Daily task not found",
            )
