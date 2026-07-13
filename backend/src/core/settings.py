from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: Literal["prod", "dev"] = "dev"
    throttling_delay_seconds: float = 0

    auth_token: str
    frontend_url: str = "http://localhost:3000"

    @property
    def allowed_origins(self) -> list[str]:
        return [self.frontend_url]

    db_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/database"

    # rate limiting configuration
    max_successful_attempts: int
    success_time_window_seconds: int
    max_failed_attempts: int
    failure_time_window_seconds: int

    model_config = SettingsConfigDict(env_file=".env", extra="forbid")


settings = Settings()
