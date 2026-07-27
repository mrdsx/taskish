import asyncio
import sys

from sqlalchemy import delete

from src.db import get_session
from src.db.auth import DB_AuthSession


async def main():
    try:
        host = sys.argv[1]
    except IndexError:
        print("Provide host argument.")
        return

    async for session in get_session():
        await session.execute(
            delete(DB_AuthSession).where(DB_AuthSession.ip_address == host),
        )
        await session.commit()

    print(f"Deleted auth session for host: {host}")


if __name__ == "__main__":
    asyncio.run(main())
