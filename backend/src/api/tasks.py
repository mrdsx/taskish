from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.repositories.tasks import TaskRepository
from src.schemas.tasks import TaskIn, TaskOut
from src.services.tasks import TaskService

router = APIRouter(prefix="/tasks")


@router.get("")
async def get_tasks(
    task_repository: Annotated[TaskRepository, Depends(TaskRepository)],
    task_service: Annotated[TaskService, Depends(TaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[TaskOut]:
    return await task_service.get_all(
        task_repository=task_repository,
        session=session,
    )


@router.post("")
async def create_task(
    task: TaskIn,
    task_repository: Annotated[TaskRepository, Depends(TaskRepository)],
    task_service: Annotated[TaskService, Depends(TaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TaskOut:
    return await task_service.create(
        task=task,
        task_repository=task_repository,
        session=session,
    )


@router.put("/{task_id}")
async def update_task_by_id(
    task_id: int,
    task: TaskIn,
    task_repository: Annotated[TaskRepository, Depends(TaskRepository)],
    task_service: Annotated[TaskService, Depends(TaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TaskOut:
    return await task_service.update_by_id(
        id=task_id,
        task=task,
        task_repository=task_repository,
        session=session,
    )


@router.delete("/{task_id}")
async def delete_task_by_id(
    task_id: int,
    task_repository: Annotated[TaskRepository, Depends(TaskRepository)],
    task_service: Annotated[TaskService, Depends(TaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Response:
    await task_service.delete_by_id(
        id=task_id,
        task_repository=task_repository,
        session=session,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
