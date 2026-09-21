from datetime import datetime
from typing import Literal

from pydantic import BaseModel, TypeAdapter

from src.schemas.config import api_model_config


class AuthSessionOut(BaseModel):
    id: int
    host: str
    location: str
    flag_url: str
    last_login: datetime

    model_config = api_model_config


AuthSessionListOut = TypeAdapter(list[AuthSessionOut])


class API_HostGeolocation(BaseModel):
    status: Literal["success"]
    country: str
    country_code: str
    region_name: str
    city: str
    query: str

    model_config = api_model_config


class API_InvalidHostGeolocation(BaseModel):
    status: Literal["fail"]
    query: str

    model_config = api_model_config


API_HostGeolocationList = TypeAdapter(
    list[API_HostGeolocation | API_InvalidHostGeolocation],
)
