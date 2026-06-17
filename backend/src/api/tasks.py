from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.schemas.tasks import PartialTaskIn, TaskIn, TaskOut
from src.services.tasks import TaskService

router = APIRouter(prefix="/tasks")


@router.get("/", response_model=list[TaskOut])
async def get_tasks(
    task_service: Annotated[TaskService, Depends(TaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await task_service.fetch_tasks(session=session)


@router.get("/{task_id}", response_model=TaskOut)
async def get_task_by_id(
    task_id: int,
    task_service: Annotated[TaskService, Depends(TaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await task_service.fetch_task_by_id(id=task_id, session=session)


@router.post("/", response_model=TaskOut)
async def create_task(
    task: TaskIn,
    task_service: Annotated[TaskService, Depends(TaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await task_service.create_task(task=task, session=session)


@router.patch("/{task_id}", response_model=TaskOut)
async def update_task_by_id(
    task_id: int,
    task: PartialTaskIn,
    task_service: Annotated[TaskService, Depends(TaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await task_service.update_task_by_id(id=task_id, task=task, session=session)


@router.delete("/{task_id}")
async def delete_task_by_id(
    task_id: int,
    task_service: Annotated[TaskService, Depends(TaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Response:
    await task_service.delete_task_by_id(id=task_id, session=session)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
