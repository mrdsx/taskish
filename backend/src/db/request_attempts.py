from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from src.db import Base


class DB_RequestAttempt(Base):
    __tablename__ = "request_attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    host: Mapped[str] = mapped_column(String, unique=True)
    last_attempt: Mapped[datetime] = mapped_column(DateTime(timezone=True))
