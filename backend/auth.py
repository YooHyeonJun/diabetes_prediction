from datetime import timedelta
from uuid import UUID
from passlib.context import CryptContext
from fastapi_users import FastAPIUsers, schemas
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from fastapi_users.authentication import BearerTransport, AuthenticationBackend, JWTStrategy
from backend.database import Base, AsyncSessionLocal

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User 테이블
class User(SQLAlchemyBaseUserTableUUID, Base):
    pass

# 스키마
class UserRead(schemas.BaseUser[UUID]):   pass
class UserCreate(schemas.BaseUserCreate): pass

# PatchedUserDB
class PatchedUserDB(SQLAlchemyUserDatabase):
    async def create(self, user_create, **kwargs):
        kwargs.pop("safe", None)
        kwargs.pop("request", None)

        data = user_create.model_dump() if hasattr(user_create, "model_dump") else user_create.dict()
        data["hashed_password"] = pwd_context.hash(data.pop("password"))
        return await super().create(data)
    
    async def authenticate(self, credentials):
        user = await self.get_by_email(credentials.username)
        if user is None:
            return None
        if not pwd_context.verify(credentials.password, user.hashed_password):
            return None
        return user
    
    async def on_after_login(self, user, request, response):
        pass

    def parse_id(self, value):
        return UUID(value)

async def get_user_db():
    async with AsyncSessionLocal() as session:
        yield PatchedUserDB(session, User)

SECRET = "supersecret"
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=int(timedelta(hours=1).total_seconds()))

auth_backend = AuthenticationBackend(name="jwt", transport=bearer_transport, get_strategy=get_strategy)

fastapi_users = FastAPIUsers(get_user_db, [auth_backend])
current_user = fastapi_users.current_user()
