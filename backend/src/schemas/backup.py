from typing import Literal

from pydantic import BaseModel, Field


class API_AccessTokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"]


class API_CreateFolderResponse(BaseModel):
    id: str
    type: Literal["folder"]


class API_CreateFolderConflict(BaseModel):
    type: str
    id: str


class API_CreateFolderContextInfo(BaseModel):
    conflicts: list[API_CreateFolderConflict] = Field(min_length=1)


class API_FailedCreateFolderResponse(BaseModel):
    code: str
    context_info: API_CreateFolderContextInfo
