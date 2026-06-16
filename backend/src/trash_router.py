from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.schemas import DeletedTaskOut
from src.session import DB_Task, get_session

router = APIRouter(prefix="/trash")


@router.get("/", response_model=list[DeletedTaskOut])
async def get_tasks_from_trash(
    session: Annotated[AsyncSession, Depends(get_session)],
):
    # TODO: extract "is true" and "expires_at" rules
    result = await session.execute(
        select(DB_Task)
        .where(DB_Task.deleted.is_(True), DB_Task.expires_at >= datetime.now())
        .order_by(DB_Task.id)
    )

    return result.scalars().all()


@router.get("/{task_id}", response_model=DeletedTaskOut)
async def get_task_by_id(
    task_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    result = await session.execute(
        select(DB_Task).where(
            DB_Task.id == task_id,
            DB_Task.deleted.is_(True),
            DB_Task.expires_at >= datetime.now(),
        )
    )
    existing_task = result.scalar()
    if existing_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return existing_task


@router.post("/{task_id}")
async def restore_task_by_id(
    task_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    result = await session.execute(
        select(DB_Task).where(
            DB_Task.id == task_id,
            DB_Task.deleted.is_(True),
            DB_Task.expires_at >= datetime.now(),
        )
    )
    existing_task = result.scalar()
    if existing_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    existing_task.deleted = False
    existing_task.expires_at = None
    await session.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
