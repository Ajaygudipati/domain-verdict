from fastapi import APIRouter
from app.services.scan_service import analyze_domain

router = APIRouter()


@router.get("/scan")
def scan_domain(domain: str):
    return analyze_domain(domain)