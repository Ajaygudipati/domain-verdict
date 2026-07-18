from pydantic import BaseModel, Field, field_validator
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.security import create_access_token, get_user_id_from_token, hash_password, verify_password
from app.database.database import SessionLocal
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["authentication"])


class Credentials(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=10, max_length=256)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        email = value.strip().lower()
        if email.count("@") != 1 or "." not in email.rsplit("@", 1)[1]:
            raise ValueError("Enter a valid email address.")
        return email


def user_payload(user: User) -> dict:
    return {"id": user.id, "full_name": user.full_name, "email": user.email}


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(credentials: Credentials):
    if not credentials.full_name:
        raise HTTPException(status_code=422, detail="Your name is required.")
    session = SessionLocal()
    try:
        if session.scalar(select(User).where(User.email == credentials.email.lower())):
            raise HTTPException(status_code=409, detail="An account with this email already exists.")
        user = User(full_name=credentials.full_name.strip(), email=credentials.email.lower(), password=hash_password(credentials.password))
        session.add(user)
        session.commit()
        session.refresh(user)
        return {"access_token": create_access_token(user.id), "user": user_payload(user)}
    finally:
        session.close()


@router.post("/login")
def login(credentials: Credentials):
    session = SessionLocal()
    try:
        user = session.scalar(select(User).where(User.email == credentials.email.lower()))
        if not user or not verify_password(credentials.password, user.password):
            raise HTTPException(status_code=401, detail="Incorrect email or password.")
        return {"access_token": create_access_token(user.id), "user": user_payload(user)}
    finally:
        session.close()


@router.get("/me")
def me(token: str):
    user_id = get_user_id_from_token(token)
    session = SessionLocal()
    try:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="Your account no longer exists.")
        return user_payload(user)
    finally:
        session.close()
