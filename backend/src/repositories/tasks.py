from datetime import timedelta
from typing import Sequence

from sqlalchemy import ColumnElement, delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.tasks import DB_Task
from src.schemas.tasks import TaskIn
from src.utils.time import get_now


class TaskRepository:
    async def fetch_all(
        self,
        session: AsyncSession,
        deleted: bool = False,
    ) -> Sequence[DB_Task]:
        where_clause = self._get_expiration_clause(deleted=deleted)
        result = await session.execute(
            select(DB_Task).where(where_clause).order_by(DB_Task.id),
        )

        return result.scalars().all()

    async def create(self, task: TaskIn, session: AsyncSession) -> DB_Task:
        db_task = DB_Task(**task.model_dump())
        session.add(db_task)
        await session.commit()

        return db_task

    async def update_by_id(
        self,
        id: int,
        task: TaskIn,
        session: AsyncSession,
    ) -> DB_Task | None:
        db_task = await self._fetch_by_id(id=id, session=session)
        if db_task is None:
            return None

        for key, value in task.model_dump().items():
            setattr(db_task, key, value)
        await session.commit()

        return db_task

    async def delete_by_id(self, id: int, session: AsyncSession) -> DB_Task | None:
        db_task = await self._fetch_by_id(id=id, session=session)
        if db_task is None:
            return None

        db_task.expires_at = get_now() + timedelta(days=7)
        await session.commit()

        return db_task

    async def restore_by_id(self, id: int, session: AsyncSession) -> DB_Task | None:
        db_task = await self._fetch_by_id(id=id, session=session, deleted=True)
        if db_task is None:
            return None

        db_task.expires_at = None
        await session.commit()

        return db_task

    async def delete_all_expired(self, session: AsyncSession) -> None:
        await session.execute(delete(DB_Task).where(DB_Task.expires_at <= get_now()))
        await session.commit()

    async def _fetch_by_id(
        self,
        id: int,
        session: AsyncSession,
        deleted: bool = False,
    ) -> DB_Task | None:
        where_clause = self._get_expiration_clause(deleted=deleted)
        result = await session.execute(
            select(DB_Task).where(DB_Task.id == id, where_clause),
        )

        return result.scalar()

    def _get_expiration_clause(self, deleted: bool) -> ColumnElement[bool]:
        if deleted:
            return DB_Task.expires_at > get_now()
        return DB_Task.expires_at.is_(None)
