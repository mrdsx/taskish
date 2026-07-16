from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: Literal["prod", "dev"] = "dev"
    throttling_delay_seconds: float = 0

    password: str
    session_token_cookie: str = "session-token"
    expiring_auth_session_days: int = 2
    auth_session_expiration_time_days: int = 7

    frontend_url: str = "http://localhost:3000"
    ip_api_url: str = "http://ip-api.com"

    @property
    def allowed_origins(self) -> list[str]:
        return [self.frontend_url]

    @property
    def static_dir(self) -> Path:
        return Path("static")

    db_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/database"
    db_ssl_mode: Literal["require"] | None = None

    # rate limiting configuration
    max_successful_attempts: int
    success_time_window_seconds: int
    max_failed_attempts: int
    failure_time_window_seconds: int

    model_config = SettingsConfigDict(env_file=".env", extra="forbid")


settings = Settings()  # pyright: ignore[reportCallIssue]
