from datetime import datetime, timedelta

from src.core.settings import settings
from src.utils.time import get_now


class RateLimiter:
    ip_map: dict[str, list[datetime]]
    time_window_seconds: int

    def __init__(self, max_attempts: int, time_window_seconds: int) -> None:
        self.ip_map = {}
        self.max_attempts = max_attempts
        self.time_window_seconds = time_window_seconds

    def is_limited(self, ip: str) -> bool:
        attempts = self._get_attempts_within_window(ip)
        if len(attempts) > self.max_attempts:
            return True
        return False

    def record_attempt(self, ip: str) -> None:
        self.ip_map[ip] = self._get_attempts_within_window(ip)
        attempt = get_now()
        self.ip_map[ip].append(attempt)

    def _get_attempts_within_window(self, ip: str) -> list[datetime]:
        now = get_now()
        cutoff_datetime = now - timedelta(seconds=self.time_window_seconds)
        attempts = self.ip_map.get(ip, [])

        return list(filter(lambda dt: dt >= cutoff_datetime, attempts))


successful_attempts_rate_limiter = RateLimiter(
    max_attempts=settings.max_successful_attempts,
    time_window_seconds=settings.success_time_window_seconds,
)
failed_attempts_rate_limiter = RateLimiter(
    max_attempts=settings.max_failed_attempts,
    time_window_seconds=settings.failure_time_window_seconds,
)
