from sqlalchemy import Sequence, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.request_attempts import DB_RequestAttempt
from src.utils.time import get_now


class RequestAttemptRepository:
    async def fetch_request_attempts(
        self,
        session: AsyncSession,
    ) -> Sequence[DB_RequestAttempt]:
        result = await session.execute(
            select(DB_RequestAttempt).order_by(DB_RequestAttempt.last_attempt)
        )

        return result.scalars().all()

    async def upsert_request_attempt(self, host: str, session: AsyncSession) -> None:
        result = await session.execute(
            select(DB_RequestAttempt)
            .where(DB_RequestAttempt.host == host)
            .order_by(DB_RequestAttempt.last_attempt)
        )
        db_attempt = result.scalar()
        if db_attempt is None:
            new_db_attempt = DB_RequestAttempt(
                host=host,
                attempts=1,
                last_attempt=get_now(),
            )
            session.add(new_db_attempt)
            await session.commit()
        else:
            db_attempt.attempts += 1
            db_attempt.last_attempt = get_now()
            await session.commit()
