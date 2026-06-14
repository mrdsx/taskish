from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.schemas import TaskIn, TaskOut
from src.session import DB_Task, get_session

router = APIRouter(prefix="/tasks")

# TODO
# 1. implement routes
# 2. implement security


@router.get("/", response_model=list[TaskOut])
async def get_tasks(
    session: Annotated[AsyncSession, Depends(get_session)],
):
    result = await session.execute(select(DB_Task))
    return result.scalars().all()


@router.get("/{task_id}", response_model=TaskOut)
async def get_task_by_id(
    task_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    result = await session.execute(select(DB_Task).where(DB_Task.id == task_id))
    existing_task = result.scalar()
    if existing_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
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

    result = await session.execute(select(DB_Task).where(DB_Task.id == db_task.id))
    created_task = result.scalar()
    if created_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )

    return created_task


@router.put("/{task_id}")
async def update_task_by_id(task_id: int): ...


@router.delete("/{task_id}")
async def delete_task_by_id(task_id: int): ...
