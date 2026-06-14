from typing import Any

from pydantic import BaseModel, Field, field_validator


class TaskIn(BaseModel):
    title: str = Field(min_length=1)
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
        mapped_tasks = map(lambda task: task.strip(), sub_tasks)
        valid_tasks = filter(lambda task: task != "", mapped_tasks)
        return list(valid_tasks)


class TaskOut(BaseModel):
    id: int
    title: str
    sub_tasks: list[str]
