from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.schemas import TaskIn, TaskOut
from src.session import DB_Task, get_session

router = APIRouter(prefix="/tasks")


@router.get("/", response_model=list[TaskOut])
async def get_tasks(
    session: Annotated[AsyncSession, Depends(get_session)],
):
    result = await session.execute(
        select(DB_Task).where(DB_Task.deleted.is_(False)).order_by(DB_Task.id)
    )

    return result.scalars().all()


@router.get("/{task_id}", response_model=TaskOut)
async def get_task_by_id(
    task_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    result = await session.execute(
        select(DB_Task).where(DB_Task.id == task_id, DB_Task.deleted.is_(False))
    )
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

    return db_task


@router.put("/{task_id}", response_model=TaskOut)
async def update_task_by_id(
    task_id: int,
    task: TaskIn,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    result = await session.execute(
        select(DB_Task).where(DB_Task.id == task_id, DB_Task.deleted.is_(False))
    )
    existing_task = result.scalar()
    if existing_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )

    existing_task.title = task.title
    existing_task.sub_tasks = task.sub_tasks
    await session.commit()

    return existing_task


@router.delete("/{task_id}")
async def delete_task_by_id(
    task_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Response:
    result = await session.execute(
        select(DB_Task).where(DB_Task.id == task_id, DB_Task.deleted.is_(False))
    )
    existing_task = result.scalar()
    if existing_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )

    existing_task.deleted = True
    await session.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
