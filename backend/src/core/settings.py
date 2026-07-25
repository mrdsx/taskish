from datetime import timedelta
from pathlib import Path
from typing import Any, Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: Literal["prod", "dev"] = "dev"
    throttling_delay_seconds: float = 0

    password: str
    session_token_cookie: str = "session-token"

    @property
    def auth_session_lifespan(self) -> timedelta:
        return timedelta(days=7, hours=1)

    @property
    def expiring_auth_session_lifespan(self) -> timedelta:
        return timedelta(days=2)

    @property
    def allowed_origins(self) -> list[str]:
        if self.app_env == "prod":
            return []
        return ["http://localhost:3000"]

    @property
    def static_dir(self) -> Path:
        return Path("static")

    # db config
    db_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/database"
    db_ssl_mode: Literal["require"] | None = None

    @property
    def db_settings(self) -> dict[str, Any]:
        return {
            "url": self.db_url,
            "connect_args": {"ssl": self.db_ssl_mode == "require"},
            "pool_size": 1,
            "max_overflow": 0,
            "pool_recycle": 240,
            "pool_pre_ping": True,
        }

    # rate limiting config
    max_successful_attempts: int
    success_time_window_seconds: int
    max_failed_attempts: int
    failure_time_window_seconds: int

    # IP API config
    ip_api_url: str = "http://ip-api.com"

    # box.com config
    box_upload_url_v2: str = "https://upload.box.com/api/2.0"
    box_api_url: str = "https://api.box.com"
    box_api_url_v2: str = f"{box_api_url}/2.0"
    box_backups_folder_name: str
    box_client_id: str
    box_client_secret: str
    box_project_type: Literal["enterprise"]
    box_project_id: str

    model_config = SettingsConfigDict(env_file=".env", extra="forbid")


settings = Settings()  # pyright: ignore[reportCallIssue]
