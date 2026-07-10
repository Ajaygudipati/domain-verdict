from fastapi import FastAPI
from app.api.domain import router as domain_router

app = FastAPI(
    title="Domain Verdict API",
    version="1.0.0"
)

app.include_router(domain_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Domain Verdict 🚀"
    }