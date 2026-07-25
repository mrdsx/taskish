import json
from datetime import UTC, datetime

from cachetools import TTLCache
from fastapi import status
from httpx import AsyncClient, Response

from src.core.enums.box import BoxErrorCodes, BoxGrantTypes
from src.core.settings import settings
from src.schemas.backup import (
    API_AccessTokenResponse,
    API_CreateFolderResponse,
    API_FailedCreateFolderResponse,
)
from src.schemas.export import ExportedTasksOut

box_auth_cache = TTLCache(maxsize=1, ttl=60 * 50)
ACCESS_TOKEN_KEY = "access_token"


def auth_headers():
    access_token = box_auth_cache.get(ACCESS_TOKEN_KEY, "token")

    return {"Authorization": f"Bearer {access_token}"}


class BackupService:
    async def perform_backup(
        self,
        backup_data: ExportedTasksOut,
        http_client: AsyncClient,
    ) -> None:
        folder_response = await self._upsert_backups_folder(http_client=http_client)
        folder_id = self._get_folder_id(folder_response=folder_response)
        await self._upload_backup_file(
            folder_id=folder_id,
            backup_data=backup_data,
            http_client=http_client,
        )

    async def _upsert_backups_folder(self, http_client: AsyncClient) -> Response:
        backups_folder_metadata = {
            "name": settings.box_backups_folder_name,
            "parent": {"id": "0"},
        }

        print("Upserting the folder...")
        folder_response = await http_client.post(
            f"{settings.box_api_url_v2}/folders?fields=id",
            headers=auth_headers(),
            json=backups_folder_metadata,
        )

        if folder_response.status_code == status.HTTP_401_UNAUTHORIZED:
            print("Unauthenticated. Trying to refresh the access token...")
            client_data = {
                "grant_type": BoxGrantTypes.CLIENT_CREDENTIALS,
                "client_id": settings.box_client_id,
                "client_secret": settings.box_client_secret,
                "box_subject_type": settings.box_project_type,
                "box_subject_id": settings.box_project_id,
            }
            token_response = await http_client.post(
                f"{settings.box_api_url}/oauth2/token?fields=access_token",
                data=client_data,
            )
            valid_token_response = API_AccessTokenResponse.model_validate(
                token_response.json(),
            )

            box_auth_cache[ACCESS_TOKEN_KEY] = valid_token_response.access_token
            folder_response = await http_client.post(
                f"{settings.box_api_url_v2}/folders?fields=id",
                headers=auth_headers(),
                json=backups_folder_metadata,
            )

        return folder_response

    def _get_folder_id(self, folder_response: Response) -> str:
        folder_id: str | None = None

        if folder_response.status_code == status.HTTP_201_CREATED:
            valid_folder_response = API_CreateFolderResponse.model_validate(
                folder_response.json(),
            )
            folder_id = valid_folder_response.id
        elif folder_response.status_code == status.HTTP_409_CONFLICT:
            valid_folder_response = API_FailedCreateFolderResponse.model_validate(
                folder_response.json(),
            )
            if valid_folder_response.code == BoxErrorCodes.ITEM_NAME_IN_USE:
                folder_id = valid_folder_response.context_info.conflicts[0].id

        if folder_id is None:
            raise ValueError("Folder ID is not specified")

        return folder_id

    async def _upload_backup_file(
        self,
        folder_id: str,
        backup_data: ExportedTasksOut,
        http_client: AsyncClient,
    ) -> None:
        timestamp = datetime.now(UTC).strftime("%Y_%m_%d-%H_%M_%S")
        backup_filename = f"backup-{timestamp}.json"
        backup_metadata = {"name": backup_filename, "parent": {"id": folder_id}}
        files = {
            "attributes": (None, json.dumps(backup_metadata), "application/json"),
            "file": (
                backup_metadata["name"],
                backup_data.model_dump_json().encode("utf-8"),
                "application/octet-stream",
            ),
        }

        print("Uploading the backup file...")
        await http_client.post(
            f"{settings.box_upload_url_v2}/files/content?fields=total_count",
            headers=auth_headers(),
            files=files,
        )

        print("Successfully uploaded the backup file!")
