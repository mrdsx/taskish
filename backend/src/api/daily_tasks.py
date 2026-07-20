from typing import Annotated

from fastapi import Depends, status
from fastapi.responses import Response
from fastapi.routing import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.repositories.daily_tasks import DailyTaskRepository
from src.schemas.daily_tasks import DailyTaskIn, DailyTaskOut
from src.services.daily_tasks import DailyTaskService

router = APIRouter(prefix="/daily-tasks")


@router.get("", response_model=list[DailyTaskOut])
async def get_daily_tasks(
    daily_task_repository: Annotated[DailyTaskRepository, Depends(DailyTaskRepository)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await daily_task_repository.fetch_all(session=session)


@router.post("", response_model=DailyTaskOut)
async def create_daily_task(
    task: DailyTaskIn,
    daily_task_repository: Annotated[DailyTaskRepository, Depends(DailyTaskRepository)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await daily_task_repository.create(task=task, session=session)


@router.put("/{task_id}", response_model=DailyTaskOut)
async def update_task_by_id(
    task_id: int,
    task: DailyTaskIn,
    daily_task_repository: Annotated[DailyTaskRepository, Depends(DailyTaskRepository)],
    daily_task_service: Annotated[DailyTaskService, Depends(DailyTaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await daily_task_service.update_by_id(
        id=task_id,
        task=task,
        daily_task_repository=daily_task_repository,
        session=session,
    )


@router.delete("/{task_id}")
async def delete_task_by_id(
    task_id: int,
    daily_task_repository: Annotated[DailyTaskRepository, Depends(DailyTaskRepository)],
    daily_task_service: Annotated[DailyTaskService, Depends(DailyTaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    await daily_task_service.delete_by_id(
        id=task_id,
        daily_task_repository=daily_task_repository,
        session=session,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
