from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.domain import router as domain_router
from app.api.auth import router as auth_router
from app.database.database import Base, engine
import app.models

app = FastAPI(
    title="Domain Verdict API",
    version="1.0.0"
)

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://sentrynx.in",
        "https://www.sentrynx.in",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(domain_router)
app.include_router(auth_router)


@app.on_event("startup")
def create_database_tables():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "Welcome to Domain Verdict 🚀"
    }
