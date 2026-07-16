from dataclasses import dataclass
from datetime import datetime

import httpx
from argon2 import PasswordHasher
from cachetools import TTLCache
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy import Sequence
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.rate_limiting import (
    failed_attempts_rate_limiter,
    successful_attempts_rate_limiter,
)
from src.core.settings import settings
from src.db.auth import DB_AuthSession
from src.repositories.auth import AuthSessionRepository
from src.schemas.auth import (
    HostGeolocation,
    HostGeolocationList,
    InvalidHostGeolocation,
)
from src.utils.hashing import get_random_hash


class AuthService:
    def handle_successful_auth(self, ip: str) -> JSONResponse | None:
        successful_attempts_rate_limiter.record_attempt(ip)
        if successful_attempts_rate_limiter.is_limited(ip):
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests"},
            )

        return None

    def handle_failed_auth(self, ip: str) -> JSONResponse:
        failed_attempts_rate_limiter.record_attempt(ip)
        if failed_attempts_rate_limiter.is_limited(ip):
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests"},
            )

        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid credentials"},
        )


@dataclass
class IpDataDTO:
    location: str
    flag_url: str


@dataclass
class AuthSessionDTO:
    id: int
    host: str
    location: str
    flag_url: str
    last_login: datetime
    expires_at: datetime


REQUESTS_LEFT_HEADER = "x-rl"
cache = TTLCache(maxsize=100, ttl=60 * 60 * 24)


class AuthSessionService:
    async def get_sessions(
        self,
        auth_session_repository: AuthSessionRepository,
        session: AsyncSession,
        request: Request,
    ):
        db_auth_sessions = await auth_session_repository.fetch_sessions(session=session)
        hosts = [auth_session.ip_address for auth_session in db_auth_sessions]  # pyright: ignore[reportGeneralTypeIssues]
        geolocations = await self._fetch_geolocations(ip_list=hosts)
        ip_dict = self._get_ip_dict(geolocations=geolocations, request=request)

        return self._map_auth_sessions(
            auth_sessions=db_auth_sessions, ip_dict=ip_dict, request=request
        )

    async def create_session(
        self,
        auth_token: str,
        ip: str,
        auth_session_repository: AuthSessionRepository,
        hasher: PasswordHasher,
        session: AsyncSession,
    ) -> str:
        hasher.verify(hash=settings.password, password=auth_token)

        session_token = get_random_hash()
        await auth_session_repository.create_session(
            session_token=session_token,
            ip=ip,
            session=session,
        )

        return session_token

    async def _fetch_geolocations(
        self, ip_list: list[str]
    ) -> list[HostGeolocation | InvalidHostGeolocation]:
        cache_key = tuple(ip_list)
        result = cache.get(cache_key)
        if result is not None:
            return result  # pyright: ignore[reportReturnType]

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.ip_api_url}/batch?fields=status,country,countryCode,regionName,city,query",
                json=ip_list,
            )

        requests_left = response.headers.get(REQUESTS_LEFT_HEADER)
        if requests_left == "0":
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS)

        data = response.json()
        result = HostGeolocationList.validate_python(data)
        cache[cache_key] = result

        return result

    def _get_ip_dict(
        self,
        geolocations: list[HostGeolocation | InvalidHostGeolocation],
        request: Request,
    ) -> dict[str, IpDataDTO]:
        ip_dict: dict[str, IpDataDTO] = {}

        for geolocation in geolocations:
            if geolocation.status == "fail":
                continue

            location = (
                f"{geolocation.country}, {geolocation.region_name}, {geolocation.city}"
            )
            if geolocation.region_name == geolocation.city:
                location = f"{geolocation.country}, {geolocation.city}"

            country_code = geolocation.country_code.lower()
            flag_file = settings.static_dir / "flags" / f"{country_code}.svg"
            if flag_file.exists() and flag_file.is_file():
                flag_url = request.url_for("static", path=f"flags/{country_code}.svg")
            else:
                flag_url = request.url_for("static", path="flags/blank_flag.png")

            ip_dict[geolocation.query] = IpDataDTO(
                location=location,
                flag_url=str(flag_url),
            )

        return ip_dict

    def _map_auth_sessions(
        self,
        auth_sessions: Sequence[DB_AuthSession],
        ip_dict: dict[str, IpDataDTO],
        request: Request,
    ) -> list[AuthSessionDTO]:
        blank_flag_url = request.url_for("static", path="flags/blank_flag.png")
        default_ip_data_dto = IpDataDTO(
            location="Unknown location",
            flag_url=str(blank_flag_url),
        )

        mapped_sessions: list[AuthSessionDTO] = []
        for auth_session in auth_sessions:  # pyright: ignore[reportGeneralTypeIssues]
            ip_data = ip_dict.get(auth_session.ip_address, default_ip_data_dto)
            session_dto = AuthSessionDTO(
                id=auth_session.id,
                host=auth_session.ip_address,
                location=ip_data.location,
                flag_url=ip_data.flag_url,
                last_login=auth_session.last_login,
                expires_at=auth_session.expires_at,
            )
            mapped_sessions.append(session_dto)

        return mapped_sessions
