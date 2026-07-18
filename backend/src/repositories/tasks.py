from datetime import timedelta

from sqlalchemy import ColumnElement, Sequence, delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.tasks import DB_Task
from src.schemas.tasks import PartialTaskIn, TaskIn
from src.utils.time import get_now


class TaskRepository:
    async def fetch_tasks(
        self, session: AsyncSession, deleted: bool = False
    ) -> Sequence[DB_Task]:
        where_clause = self._get_expiration_clause(deleted=deleted)
        result = await session.execute(
            select(DB_Task).where(where_clause).order_by(DB_Task.id)
        )

        return result.scalars().all()  # pyright: ignore[reportReturnType]

    async def fetch_task_by_id(
        self, id: int, session: AsyncSession, deleted: bool = False
    ) -> DB_Task | None:
        where_clause = self._get_expiration_clause(deleted=deleted)
        result = await session.execute(
            select(DB_Task).where(DB_Task.id == id, where_clause)
        )

        return result.scalar()

    async def create_task(self, task: TaskIn, session: AsyncSession) -> DB_Task:
        db_task = DB_Task(**task.model_dump())
        session.add(db_task)
        await session.commit()

        return db_task

    async def update_task_by_id(
        self, id: int, task: PartialTaskIn, session: AsyncSession
    ) -> DB_Task | None:
        db_task = await self.fetch_task_by_id(id=id, session=session)
        if db_task is None:
            return None

        for key, value in task.model_dump().items():
            if value is not None:
                setattr(db_task, key, value)
        await session.commit()

        return db_task

    async def delete_task_by_id(self, id: int, session: AsyncSession) -> DB_Task | None:
        db_task = await self.fetch_task_by_id(id=id, session=session)
        if db_task is None:
            return None

        db_task.expires_at = get_now() + timedelta(days=7)
        await session.commit()

        return db_task

    async def restore_task_by_id(
        self, id: int, session: AsyncSession
    ) -> DB_Task | None:
        db_task = await self.fetch_task_by_id(id=id, session=session, deleted=True)
        if db_task is None:
            return None

        db_task.expires_at = None
        await session.commit()

        return db_task

    async def delete_expired_tasks(self, session: AsyncSession) -> None:
        await session.execute(delete(DB_Task).where(DB_Task.expires_at <= get_now()))
        await session.commit()

    def _get_expiration_clause(self, deleted: bool) -> ColumnElement[bool]:
        if deleted:
            return DB_Task.expires_at > get_now()
        return DB_Task.expires_at.is_(None)
