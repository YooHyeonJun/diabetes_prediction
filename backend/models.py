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
