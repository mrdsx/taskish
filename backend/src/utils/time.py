from datetime import datetime, timezone


def decline_expiration(amount: int, duration: str):
    if amount == 1:
        return f"expires in 1 {duration}"
    return f"expires in {amount} {duration}s"


def humanize_expiration(expires_at: datetime) -> str:
    now = get_now()
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    seconds = int((expires_at - now).total_seconds())

    if seconds <= 0:
        return "expired"

    minutes = seconds // 60
    hours = minutes // 60
    days = hours // 24
    weeks = days // 7
    months = days // 30
    years = days // 365

    # fallback expiration time
    result = f"expires at {expires_at}"

    if years >= 1:
        result = decline_expiration(years, "year")
    elif months >= 1:
        result = decline_expiration(months, "month")
    elif weeks >= 1:
        result = decline_expiration(weeks, "week")
    elif days >= 1:
        result = decline_expiration(days, "day")
    elif hours >= 1:
        result = decline_expiration(hours, "hour")
    elif minutes >= 1:
        result = decline_expiration(minutes, "minute")
    elif seconds >= 1:
        result = decline_expiration(seconds, "second")

    return result


def get_now() -> datetime:
    return datetime.now(timezone.utc)
