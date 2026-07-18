from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.tasks import DB_Task
from src.repositories.tasks import TaskRepository
from src.schemas.tasks import PartialTaskIn


class TaskService:
    async def get_task_by_id(
        self,
        id: int,
        task_repository: TaskRepository,
        session: AsyncSession,
        deleted: bool = False,
    ) -> DB_Task:
        db_task = await task_repository.fetch_task_by_id(
            id=id, deleted=deleted, session=session
        )
        if db_task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )

        return db_task

    async def update_task_by_id(
        self,
        id: int,
        task: PartialTaskIn,
        task_repository: TaskRepository,
        session: AsyncSession,
    ) -> DB_Task:
        db_task = await task_repository.update_task_by_id(
            id=id, task=task, session=session
        )
        if db_task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )

        return db_task

    async def delete_task_by_id(
        self,
        id: int,
        task_repository: TaskRepository,
        session: AsyncSession,
    ) -> DB_Task:

        db_task = await task_repository.delete_task_by_id(id=id, session=session)
        if db_task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )

        return db_task

    async def restore_task_by_id(
        self,
        id: int,
        task_repository: TaskRepository,
        session: AsyncSession,
    ) -> DB_Task:

        db_task = await task_repository.restore_task_by_id(id=id, session=session)
        if db_task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )

        return db_task
