from pydantic import BaseModel, Field, field_validator
import os
import secrets

import requests
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.core.security import create_access_token, get_user_id_from_token, hash_password, verify_password
from app.database.database import SessionLocal
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["authentication"])


class LoginCredentials(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=10, max_length=256)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        email = value.strip().lower()
        if email.count("@") != 1 or "." not in email.rsplit("@", 1)[1]:
            raise ValueError("Enter a valid email address.")
        return email


class RegisterCredentials(LoginCredentials):
    full_name: str = Field(min_length=2, max_length=100)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not any(char.islower() for char in value) or not any(char.isupper() for char in value) or not any(char.isdigit() for char in value):
            raise ValueError("Use at least 10 characters with uppercase, lowercase, and a number.")
        return value


class GoogleCredential(BaseModel):
    credential: str = Field(min_length=20, max_length=10000)


def user_payload(user: User) -> dict:
    return {"id": user.id, "full_name": user.full_name, "email": user.email}


@router.get("/providers")
def providers():
    return {"google": bool(os.getenv("GOOGLE_CLIENT_ID"))}


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(credentials: RegisterCredentials):
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
def login(credentials: LoginCredentials):
    session = SessionLocal()
    try:
        user = session.scalar(select(User).where(User.email == credentials.email.lower()))
        if not user or not verify_password(credentials.password, user.password):
            raise HTTPException(status_code=401, detail="Incorrect email or password.")
        return {"access_token": create_access_token(user.id), "user": user_payload(user)}
    finally:
        session.close()


@router.post("/google")
def google_login(payload: GoogleCredential):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not client_id:
        raise HTTPException(status_code=503, detail="Google sign-in has not been configured yet.")
    try:
        response = requests.get("https://oauth2.googleapis.com/tokeninfo", params={"id_token": payload.credential}, timeout=8)
        claims = response.json()
    except requests.RequestException as exc:
        raise HTTPException(status_code=503, detail="Google sign-in could not be verified. Try again shortly.") from exc
    if response.status_code != 200 or claims.get("aud") != client_id or claims.get("email_verified") != "true" or not claims.get("email"):
        raise HTTPException(status_code=401, detail="Google could not verify this account.")

    email = claims["email"].strip().lower()
    full_name = (claims.get("name") or email.split("@", 1)[0]).strip()[:100]
    session = SessionLocal()
    try:
        user = session.scalar(select(User).where(User.email == email))
        if not user:
            user = User(full_name=full_name, email=email, password=hash_password(secrets.token_urlsafe(48)))
            session.add(user)
            session.commit()
            session.refresh(user)
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
