from pydantic import BaseModel

from src.schemas.config import api_model_config
from src.schemas.tasks import DeletedTaskOut, TaskOut


class ExportedTasksOut(BaseModel):
    tasks: list[TaskOut]
    trash: list[DeletedTaskOut]

    model_config = api_model_config
