from typing import Any

from pydantic import BaseModel, Field, field_validator

from src.schemas.config import api_model_config

# TODO: extract duplicating constant someday
MAX_TITLE_LENGTH = 50


class DailyTaskOut(BaseModel):
    id: int
    title: str
    sub_tasks: list[str]
    completed: bool

    model_config = api_model_config


class DailyTaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=MAX_TITLE_LENGTH)
    sub_tasks: list[str]
    completed: bool

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
