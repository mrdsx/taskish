from dataclasses import dataclass
from datetime import datetime

import httpx
from fastapi import Request
from sqlalchemy import Sequence

from src.core.settings import settings
from src.db.request_attempts import DB_RequestAttempt
from src.schemas.request_attempts import (
    HostGeolocation,
    HostGeolocationList,
    InvalidHostGeolocation,
)


@dataclass
class HostDataDTO:
    id: int
    last_attempt: datetime
    geolocation: HostGeolocation | None


@dataclass
class RequestAttemptDTO:
    id: int
    host: str
    last_attempt: datetime
    location: str
    flag_url: str


class RequestAttemptService:
    async def process_attempts(
        self,
        db_attempts: Sequence[DB_RequestAttempt],
        request: Request,
    ) -> list[RequestAttemptDTO]:
        hosts_dict = self._get_hosts_dict(db_attempts=db_attempts)
        geolocations = await self._fetch_geolocations(list(hosts_dict.keys()))
        for geolocation in geolocations:
            if geolocation.status == "fail":
                continue
            if hosts_dict.get(geolocation.query) is None:
                continue

            hosts_dict[geolocation.query].geolocation = geolocation
        mapped_hosts_data = self._map_hosts_data(hosts_dict=hosts_dict, request=request)

        return sorted(mapped_hosts_data, key=lambda d: d.id)

    def _get_hosts_dict(
        self, db_attempts: Sequence[DB_RequestAttempt]
    ) -> dict[str, HostDataDTO]:
        hosts_dict: dict[str, HostDataDTO] = {}

        for attempt in db_attempts:
            hosts_dict[attempt.host] = HostDataDTO(
                id=attempt.id,
                last_attempt=attempt.last_attempt,
                geolocation=None,
            )

        return hosts_dict

    async def _fetch_geolocations(
        self,
        hosts: list[str],
    ) -> list[HostGeolocation | InvalidHostGeolocation]:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://ip-api.com/batch?fields=status,country,countryCode,regionName,city,query",
                json=hosts,
            )
        data = response.json()

        return HostGeolocationList.validate_python(data)

    def _map_hosts_data(
        self,
        hosts_dict: dict[str, HostDataDTO],
        request: Request,
    ) -> list[RequestAttemptDTO]:
        result: list[RequestAttemptDTO] = []

        for host, host_data in hosts_dict.items():
            location = "Unknown location"
            flag_url = request.url_for("static", path="flags/blank_flag.png")

            geolocation = host_data.geolocation
            if geolocation is not None:
                location = f"{geolocation.country}, {geolocation.region_name}, {geolocation.city}"

                country_code = geolocation.country_code.lower()
                flag_file = settings.static_dir / "flags" / f"{country_code}.svg"
                if flag_file.exists() and flag_file.is_file():
                    flag_url = request.url_for(
                        "static", path=f"flags/{country_code}.svg"
                    )

            request_attempt = RequestAttemptDTO(
                id=host_data.id,
                host=host,
                last_attempt=host_data.last_attempt,
                location=location,
                flag_url=str(flag_url),
            )
            result.append(request_attempt)

        return result
