import asyncio
from datetime import timedelta

from src.core.settings import settings
from src.db import get_session
from src.db.auth import DB_AuthSession
from src.utils.time import get_now


async def main():
    now = get_now()
    expires_at = now + timedelta(days=settings.auth_session_expiration_time_days)
    ip_list = ["8.8.8.8", "8.8.8.4"]
    new_auth_sessions: list[DB_AuthSession] = []
    for ip_address in ip_list:
        new_auth_sessions.append(
            DB_AuthSession(
                hash="arbitrary" + ip_address,
                ip_address=ip_address,
                last_login=now,
                expires_at=expires_at,
            )
        )

    async for session in get_session():
        session.add_all(new_auth_sessions)
        await session.commit()

    print(f"Added auth sessions: {len(ip_list)}")


if __name__ == "__main__":
    asyncio.run(main())
