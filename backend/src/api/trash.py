from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.repositories.tasks import TaskRepository
from src.schemas.tasks import DeletedTaskOut
from src.services.tasks import TaskService

router = APIRouter(prefix="/trash")


@router.get("", response_model=list[DeletedTaskOut])
async def get_tasks_from_trash(
    task_repository: Annotated[TaskRepository, Depends(TaskRepository)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await task_repository.fetch_tasks(session=session, deleted=True)


@router.get("/{task_id}", response_model=DeletedTaskOut)
async def get_task_by_id(
    task_id: int,
    task_repository: Annotated[TaskRepository, Depends(TaskRepository)],
    task_service: Annotated[TaskService, Depends(TaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await task_service.get_task_by_id(
        id=task_id,
        deleted=True,
        task_repository=task_repository,
        session=session,
    )


@router.post("/{task_id}")
async def restore_task_by_id(
    task_id: int,
    task_repository: Annotated[TaskRepository, Depends(TaskRepository)],
    task_service: Annotated[TaskService, Depends(TaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    await task_service.restore_task_by_id(
        id=task_id, task_repository=task_repository, session=session
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
