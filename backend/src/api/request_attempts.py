from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.db import get_session
from src.repositories.request_attempts import RequestAttemptRepository
from src.schemas.request_attempts import RequestAttemptOut

router = APIRouter(prefix="/request-attempts")


@router.get("", response_model=list[RequestAttemptOut])
async def get_request_attempts(
    request_attempt_repository: Annotated[
        RequestAttemptRepository, Depends(RequestAttemptRepository)
    ],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await request_attempt_repository.fetch_request_attempts(
        session=session,
    )
