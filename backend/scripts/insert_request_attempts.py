import asyncio

from src.db import get_session
from src.db.request_attempts import DB_RequestAttempt
from src.utils.time import get_now


async def main():
    request_attempts = [
        {"host": "8.8.8.8", "last_attempt": get_now()},
        {"host": "8.8.8.4", "last_attempt": get_now()},
    ]
    db_attempts = []
    for attempt in request_attempts:
        db_attempts.append(DB_RequestAttempt(**attempt))

    async for session in get_session():
        session.add_all(db_attempts)
        await session.commit()

    print(f"Added request attempts: {len(request_attempts)}")


if __name__ == "__main__":
    asyncio.run(main())
