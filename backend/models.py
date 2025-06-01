from datetime import datetime
from uuid import UUID
from sqlalchemy import JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from backend.database import Base

class Record(Base):
    __tablename__ = "records"

    id:         Mapped[int]      = mapped_column(primary_key=True, autoincrement=True)
    user_id:    Mapped[UUID]     = mapped_column(ForeignKey("user.id"))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    inputs:     Mapped[list]     = mapped_column(JSON)
    prob:       Mapped[float]
    shap:       Mapped[dict]     = mapped_column(JSON)

class Reminder(Base):
    __tablename__ = "reminders"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
    message: Mapped[str]
    remind_at: Mapped[datetime]
    is_sent: Mapped[bool] = mapped_column(default=False)

class Mission(Base):
    __tablename__ = "missions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str]
    description: Mapped[str]
    goal: Mapped[str]
    reward: Mapped[str]

class UserMission(Base):
    __tablename__ = "user_missions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
    mission_id: Mapped[int] = mapped_column(ForeignKey("missions.id"))
    status: Mapped[str]  # 진행중, 완료 등
    progress: Mapped[int] = mapped_column(default=0)

class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
    title: Mapped[str]
    content: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

class Comment(Base):
    __tablename__ = "comments"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"))
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
    content: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
