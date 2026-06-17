from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import ColumnElement, Sequence, delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.tasks import DB_Task
from src.schemas.tasks import PartialTaskIn, TaskIn


class TaskService:
    async def fetch_tasks(
        self, session: AsyncSession, deleted: bool = False
    ) -> Sequence[DB_Task]:
        where_clause = self._get_expiration_clause(deleted=deleted)
        result = await session.execute(
            select(DB_Task).where(where_clause).order_by(DB_Task.id)
        )

        return result.scalars().all()

    async def fetch_task_by_id(
        self, id: int, session: AsyncSession, deleted: bool = False
    ) -> DB_Task:
        where_clause = self._get_expiration_clause(deleted=deleted)
        result = await session.execute(
            select(DB_Task).where(DB_Task.id == id, where_clause)
        )
        db_task = result.scalar()
        if db_task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )

        return db_task

    async def create_task(self, task: TaskIn, session: AsyncSession) -> DB_Task:
        db_task = DB_Task(**task.model_dump())
        session.add(db_task)
        await session.commit()

        return db_task

    async def update_task_by_id(
        self, id: int, task: PartialTaskIn, session: AsyncSession
    ) -> DB_Task:
        db_task = await self.fetch_task_by_id(id=id, session=session)

        for key, value in task.model_dump().items():
            if value is not None:
                setattr(db_task, key, value)
        await session.commit()

        return db_task

    async def delete_task_by_id(self, id: int, session: AsyncSession) -> None:
        db_task = await self.fetch_task_by_id(id=id, session=session)
        db_task.expires_at = datetime.now() + timedelta(days=7)
        await session.commit()

    async def restore_task_by_id(self, id: int, session: AsyncSession) -> None:
        db_task = await self.fetch_task_by_id(id=id, session=session, deleted=True)
        db_task.expires_at = None
        await session.commit()

    async def delete_expired_tasks(self, session: AsyncSession) -> None:
        await session.execute(
            delete(DB_Task).where(DB_Task.expires_at <= datetime.now())
        )
        await session.commit()

    def _get_expiration_clause(self, deleted: bool) -> ColumnElement[bool]:
        where_clause = DB_Task.expires_at.is_(None)
        if deleted:
            where_clause = DB_Task.expires_at > datetime.now()

        return where_clause
