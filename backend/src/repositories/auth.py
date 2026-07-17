from datetime import timedelta

from sqlalchemy import Sequence, delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.settings import settings
from src.db.auth import DB_AuthSession
from src.utils.hashing import get_hash
from src.utils.time import get_now


class AuthSessionRepository:
    async def fetch_sessions(self, session: AsyncSession) -> Sequence[DB_AuthSession]:
        result = await session.execute(
            select(DB_AuthSession)
            .where(DB_AuthSession.expires_at > get_now())
            .order_by(DB_AuthSession.id)
        )

        return result.scalars().all()  # pyright: ignore[reportReturnType]

    async def fetch_session(
        self, session_token: str, session: AsyncSession
    ) -> DB_AuthSession | None:
        hashed_token = get_hash(session_token)
        result = await session.execute(
            select(DB_AuthSession).where(
                DB_AuthSession.hash == hashed_token,
                DB_AuthSession.expires_at > get_now(),
            )
        )

        return result.scalar()

    async def create_session(
        self, session_token: str, ip: str, session: AsyncSession
    ) -> DB_AuthSession:
        hashed_token = get_hash(session_token)
        now = get_now()

        db_auth_session = DB_AuthSession(
            hash=hashed_token,
            ip_address=ip,
            last_login=now,
            expires_at=now + timedelta(days=settings.auth_session_expiration_time_days),
        )
        session.add(db_auth_session)
        await session.commit()

        return db_auth_session

    async def delete_session(
        self, auth_session: DB_AuthSession, session: AsyncSession
    ) -> None:
        await session.delete(auth_session)
        await session.commit()

    async def delete_expired_sessions(self, session: AsyncSession) -> None:
        await session.execute(
            delete(DB_AuthSession).where(DB_AuthSession.expires_at <= get_now())
        )
        await session.commit()
