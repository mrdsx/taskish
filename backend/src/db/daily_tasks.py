from sqlalchemy import String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from src.db import Base


class DB_DailyTask(Base):
    __tablename__ = "daily_tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    sub_tasks: Mapped[list[str]] = mapped_column(ARRAY(String))
    completed: Mapped[bool] = mapped_column(default=False)
