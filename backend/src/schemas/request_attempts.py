from datetime import datetime
from typing import Literal

from pydantic import BaseModel, TypeAdapter

from src.schemas.config import api_model_config


class HostGeolocation(BaseModel):
    status: Literal["success"]
    country: str
    country_code: str
    region_name: str
    city: str
    query: str

    model_config = api_model_config


class InvalidHostGeolocation(BaseModel):
    status: Literal["fail"]
    query: str

    model_config = api_model_config


HostGeolocationList = TypeAdapter(list[HostGeolocation | InvalidHostGeolocation])


class RequestAttemptOut(BaseModel):
    id: int
    host: str
    last_attempt: datetime
    location: str
    flag_url: str

    model_config = api_model_config
