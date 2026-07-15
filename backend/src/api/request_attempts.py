from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.schemas.request_attempts import RequestAttemptOut
from src.services.request_attempts import RequestAttemptsService

router = APIRouter(prefix="/request-attempts")


@router.get("", response_model=list[RequestAttemptOut])
async def get_request_attempts(
    request_attempts_service: Annotated[
        RequestAttemptsService, Depends(RequestAttemptsService)
    ],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await request_attempts_service.fetch_request_attempts(
        session=session,
    )
