from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.schemas import PartialTaskIn, TaskIn, TaskOut
from src.session import DB_Task, get_session

router = APIRouter(prefix="/tasks")


@router.get("/", response_model=list[TaskOut])
async def get_tasks(
    session: Annotated[AsyncSession, Depends(get_session)],
):
    result = await session.execute(
        select(DB_Task).where(DB_Task.expires_at.is_(None)).order_by(DB_Task.id)
    )

    return result.scalars().all()


@router.get("/{task_id}", response_model=TaskOut)
async def get_task_by_id(
    task_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    result = await session.execute(
        select(DB_Task).where(DB_Task.id == task_id, DB_Task.expires_at.is_(None))
    )
    existing_task = result.scalar()
    if existing_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return existing_task


@router.post("/", response_model=TaskOut)
async def create_task(
    task: TaskIn,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    db_task = DB_Task(**task.model_dump())
    session.add(db_task)
    await session.commit()

    return db_task


@router.patch("/{task_id}", response_model=TaskOut)
async def update_task_by_id(
    task_id: int,
    task: PartialTaskIn,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    result = await session.execute(
        select(DB_Task).where(DB_Task.id == task_id, DB_Task.expires_at.is_(None))
    )
    existing_task = result.scalar()
    if existing_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    for key, value in task.model_dump().items():
        if value is not None:
            setattr(existing_task, key, value)
    await session.commit()

    return existing_task


@router.delete("/{task_id}")
async def delete_task_by_id(
    task_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Response:
    result = await session.execute(
        select(DB_Task).where(DB_Task.id == task_id, DB_Task.expires_at.is_(None))
    )
    existing_task = result.scalar()
    if existing_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    existing_task.expires_at = datetime.now() + timedelta(days=7)
    await session.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
