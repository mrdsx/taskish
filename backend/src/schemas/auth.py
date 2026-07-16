from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, TypeAdapter, ValidationError, field_validator

from src.schemas.config import api_model_config
from src.utils.time import humanize_expiration


class AuthSessionOut(BaseModel):
    id: int
    host: str
    location: str
    flag_url: str
    last_login: datetime
    expires_at: str | datetime

    @field_validator("expires_at", mode="before")
    @classmethod
    def validaet_expires_at(cls, expires_at: Any) -> datetime:
        if not isinstance(expires_at, datetime):
            raise ValidationError("expires_at field must be datetime")
        return expires_at

    @field_validator("expires_at", mode="after")
    @classmethod
    def serialize_expiration_field(cls, expires_at: datetime):
        return humanize_expiration(expires_at)

    model_config = api_model_config


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
