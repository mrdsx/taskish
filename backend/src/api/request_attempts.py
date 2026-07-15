from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.repositories.request_attempts import RequestAttemptRepository
from src.schemas.request_attempts import (
    RequestAttemptOut,
)
from src.services.request_attempts import RequestAttemptService

router = APIRouter(prefix="/request-attempts")


@router.get("", response_model=list[RequestAttemptOut])
async def get_request_attempts(
    request_attempt_repository: Annotated[
        RequestAttemptRepository, Depends(RequestAttemptRepository)
    ],
    request_attempt_service: Annotated[
        RequestAttemptService, Depends(RequestAttemptService)
    ],
    session: Annotated[AsyncSession, Depends(get_session)],
    request: Request,
):
    db_attempts = await request_attempt_repository.fetch_request_attempts(
        session=session,
    )

    return await request_attempt_service.process_attempts(
        db_attempts=db_attempts, request=request
    )
