from datetime import datetime

from pydantic import BaseModel

from src.schemas.config import api_model_config


class RequestAttemptOut(BaseModel):
    id: int
    host: str
    last_attempt: datetime

    model_config = api_model_config
