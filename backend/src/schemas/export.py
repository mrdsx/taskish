from pydantic import BaseModel

from src.schemas.config import api_model_config
from src.schemas.daily_tasks import DailyTaskOut
from src.schemas.tasks import DeletedTaskOut, TaskOut


class ExportedTasksOut(BaseModel):
    tasks: list[TaskOut]
    daily_tasks: list[DailyTaskOut]
    trash: list[DeletedTaskOut]

    model_config = api_model_config
