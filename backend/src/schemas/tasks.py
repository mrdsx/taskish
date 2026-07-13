from datetime import datetime
from typing import Any

from pydantic import (
    BaseModel,
    Field,
    field_serializer,
    field_validator,
)

from src.schemas.config import api_model_config
from src.utils.time import humanize_expiration

MAX_TITLE_LENGTH = 50


class TaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=MAX_TITLE_LENGTH)
    sub_tasks: list[str]

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, title: Any) -> Any:
        if isinstance(title, str):
            return title.strip()
        return title

    @field_validator("sub_tasks", mode="after")
    @classmethod
    def strip_sub_tasks(cls, sub_tasks: list[str]) -> list[str]:
        valid_tasks: list[str] = []

        for sub_task in sub_tasks:
            stripped = sub_task.strip()
            if len(stripped) > MAX_TITLE_LENGTH:
                raise ValueError("Too long sub task")
            elif len(stripped) > 0:
                valid_tasks.append(stripped)

        return valid_tasks

    model_config = api_model_config


class PartialTaskIn(TaskIn):
    title: str | None = Field(min_length=1, max_length=MAX_TITLE_LENGTH, default=None)
    sub_tasks: list[str] | None = None

    @field_validator("sub_tasks", mode="before")
    @classmethod
    def process_tasks(cls, sub_tasks: Any) -> Any:
        if sub_tasks is None:
            return []
        return sub_tasks


class TaskOut(BaseModel):
    id: int
    title: str
    sub_tasks: list[str]

    model_config = api_model_config


class DeletedTaskOut(TaskOut):
    expires_at: datetime

    @field_serializer("expires_at", when_used="json")
    def serialize_expiration_field(self, expires_at: datetime) -> str:
        return humanize_expiration(expires_at)

    model_config = api_model_config
