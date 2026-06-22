from fastapi import status
from fastapi.responses import JSONResponse

from src.core.rate_limiting import (
    failed_attempts_rate_limiter,
    successful_attempts_rate_limiter,
)


class AuthService:
    def handle_successful_auth(ip: str) -> JSONResponse | None:
        successful_attempts_rate_limiter.record_attempt(ip)
        if successful_attempts_rate_limiter.is_limited(ip):
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests"},
            )

        return None

    def handle_failed_auth(ip: str) -> JSONResponse:
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
