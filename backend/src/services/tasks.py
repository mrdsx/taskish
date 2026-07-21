from typing import Any, Literal, overload

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.tasks import DB_Task
from src.repositories.tasks import TaskRepository
from src.schemas.tasks import (
    DeletedTaskListOut,
    DeletedTaskOut,
    TaskIn,
    TaskListOut,
    TaskOut,
)


class TaskService:
    @overload
    async def get_all(
        self,
        task_repository: TaskRepository,
        session: AsyncSession,
        deleted: Literal[False] = False,
    ) -> list[TaskOut]: ...

    @overload
    async def get_all(
        self,
        task_repository: TaskRepository,
        session: AsyncSession,
        deleted: Literal[True] = True,
    ) -> list[DeletedTaskOut]: ...

    async def get_all(
        self,
        task_repository: TaskRepository,
        session: AsyncSession,
        deleted: bool = False,
    ) -> list[TaskOut] | list[DeletedTaskOut]:
        db_tasks = await task_repository.fetch_all(deleted=deleted, session=session)

        if deleted:
            return DeletedTaskListOut.validate_python(db_tasks)
        return TaskListOut.validate_python(db_tasks)

    async def create(
        self,
        task: TaskIn,
        task_repository: TaskRepository,
        session: AsyncSession,
    ) -> TaskOut:
        db_task = await task_repository.create(task=task, session=session)

        return TaskOut.model_validate(db_task)

    async def update_by_id(
        self,
        id: int,
        task: TaskIn,
        task_repository: TaskRepository,
        session: AsyncSession,
    ) -> TaskOut:
        db_task = await task_repository.update_by_id(id=id, task=task, session=session)
        self._raise_not_found_if_task_is_none(db_task=db_task)

        return TaskOut.model_validate(db_task)

    async def delete_by_id(
        self,
        id: int,
        task_repository: TaskRepository,
        session: AsyncSession,
    ) -> None:
        db_task = await task_repository.delete_by_id(id=id, session=session)
        self._raise_not_found_if_task_is_none(db_task=db_task)

    async def restore_by_id(
        self,
        id: int,
        task_repository: TaskRepository,
        session: AsyncSession,
    ) -> None:
        db_task = await task_repository.restore_by_id(id=id, session=session)
        self._raise_not_found_if_task_is_none(db_task=db_task)

    def _raise_not_found_if_task_is_none(self, db_task: DB_Task | None) -> None:
        if db_task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )
