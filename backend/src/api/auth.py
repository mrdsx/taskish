from datetime import timedelta
from typing import Annotated

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, Request, Response, status
from fastapi.routing import APIRouter
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.dependencies.request import get_ip
from src.core.settings import settings
from src.db import get_session
from src.repositories.auth import AuthSessionRepository
from src.schemas.auth import (
    AuthSessionOut,
)
from src.services.auth import AuthService, AuthSessionService

router = APIRouter(prefix="/auth")
security_scheme = HTTPBearer()


@router.get("/sessions")
async def get_sessions(
    auth_session_repository: Annotated[
        AuthSessionRepository,
        Depends(AuthSessionRepository),
    ],
    auth_session_service: Annotated[AuthSessionService, Depends(AuthSessionService)],
    session: Annotated[AsyncSession, Depends(get_session)],
    request: Request,
) -> list[AuthSessionOut]:
    return await auth_session_service.get_all(
        auth_session_repository=auth_session_repository,
        session=session,
        request=request,
    )


@router.post("/login")
async def login(
    auth_service: Annotated[AuthService, Depends(AuthService)],
    auth_session_repository: Annotated[
        AuthSessionRepository,
        Depends(AuthSessionRepository),
    ],
    auth_session_service: Annotated[AuthSessionService, Depends(AuthSessionService)],
    session: Annotated[AsyncSession, Depends(get_session)],
    ip: Annotated[str, Depends(get_ip)],
    hasher: Annotated[PasswordHasher, Depends(PasswordHasher)],
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security_scheme)],
) -> Response:
    try:
        password = credentials.credentials
        session_token = await auth_session_service.create(
            password=password,
            ip=ip,
            auth_session_repository=auth_session_repository,
            hasher=hasher,
            session=session,
        )
    except VerifyMismatchError:
        return auth_service.handle_failed_auth(ip=ip)

    response = Response(status_code=status.HTTP_204_NO_CONTENT)
    cookie_max_age = timedelta(
        days=settings.auth_session_expiration_time_days,
    ).total_seconds()
    response.set_cookie(
        key=settings.session_token_cookie,
        value=session_token,
        secure=True,
        httponly=True,
        samesite="strict",
        max_age=int(cookie_max_age),
    )

    return response


@router.post("/logout")
async def logout(
    auth_service: Annotated[AuthService, Depends(AuthService)],
    auth_session_repository: Annotated[
        AuthSessionRepository,
        Depends(AuthSessionRepository),
    ],
    session: Annotated[AsyncSession, Depends(get_session)],
    ip: Annotated[str, Depends(get_ip)],
    request: Request,
) -> Response:
    session_token = request.cookies.get(settings.session_token_cookie)
    if session_token is None:
        return auth_service.handle_failed_auth(ip)

    db_auth_session = await auth_session_repository.fetch_by_token(
        session_token=session_token,
        session=session,
    )
    if db_auth_session is None:
        return auth_service.handle_failed_auth(ip)
    await auth_session_repository.delete(auth_session=db_auth_session, session=session)
    response = Response(status_code=status.HTTP_204_NO_CONTENT)
    response.delete_cookie(
        key=settings.session_token_cookie,
        secure=True,
        httponly=True,
        samesite="strict",
    )

    return response
