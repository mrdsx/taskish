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


@router.get("")
async def get_daily_tasks(
    daily_task_repository: Annotated[DailyTaskRepository, Depends(DailyTaskRepository)],
    daily_task_service: Annotated[DailyTaskService, Depends(DailyTaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[DailyTaskOut]:
    return await daily_task_service.get_all(
        daily_task_repository=daily_task_repository,
        session=session,
    )


@router.post("")
async def create_daily_task(
    task: DailyTaskIn,
    daily_task_repository: Annotated[DailyTaskRepository, Depends(DailyTaskRepository)],
    daily_task_service: Annotated[DailyTaskService, Depends(DailyTaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> DailyTaskOut:
    return await daily_task_service.create(
        task=task,
        daily_task_repository=daily_task_repository,
        session=session,
    )


@router.put("/{task_id}")
async def update_task_by_id(
    task_id: int,
    task: DailyTaskIn,
    daily_task_repository: Annotated[DailyTaskRepository, Depends(DailyTaskRepository)],
    daily_task_service: Annotated[DailyTaskService, Depends(DailyTaskService)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> DailyTaskOut:
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
) -> Response:
    await daily_task_service.delete_by_id(
        id=task_id,
        daily_task_repository=daily_task_repository,
        session=session,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
