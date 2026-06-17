from typing import Literal

from argon2 import Type
from pydantic import ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    h_time_cost: int
    h_memory_cost: int
    h_parallelism: int
    h_hash_len: int
    h_salt_len: int
    h_type: str

    @property
    def _h_type(self) -> Type:
        if self.h_type == "argon2i":
            return Type.I
        elif self.h_type == "argon2d":
            return Type.D
        elif self.h_type == "argon2id":
            return Type.ID

        raise ValidationError("Invalid type for variable 'h_type'")

    @property
    def hashing_settings(self) -> dict:
        return {
            "time_cost": self.h_time_cost,
            "memory_cost": self.h_memory_cost,
            "parallelism": self.h_parallelism,
            "hash_len": self.h_hash_len,
            "salt_len": self.h_salt_len,
            "type": self._h_type,
        }

    model_config = SettingsConfigDict(env_file=".env", extra="forbid")


settings = Settings()  # ty: ignore[missing-argument]
