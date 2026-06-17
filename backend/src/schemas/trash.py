from datetime import datetime

from src.schemas.config import api_model_config
from src.schemas.tasks import TaskOut


class DeletedTaskOut(TaskOut):
    expires_at: datetime

    model_config = api_model_config
