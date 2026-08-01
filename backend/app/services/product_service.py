import secrets
from datetime import datetime, timezone

from sqlalchemy import select

from app.database.database import SessionLocal
from app.models.product import Feedback, SharedReport, Watchlist
from app.models.scan import Scan


def share_scan(user_id: int, scan_id: int) -> str | None:
    session = SessionLocal()
    try:
        scan = session.get(Scan, scan_id)
        if not scan or scan.user_id != user_id:
            return None
        share = session.scalar(select(SharedReport).where(SharedReport.scan_id == scan_id))
        if not share:
            share = SharedReport(scan_id=scan_id, token=secrets.token_urlsafe(24))
            session.add(share)
            session.commit()
        return share.token
    finally:
        session.close()


def get_shared_scan(token: str) -> dict | None:
    session = SessionLocal()
    try:
        shared = session.scalar(select(SharedReport).where(SharedReport.token == token))
        if not shared:
            return None
        scan = session.get(Scan, shared.scan_id)
        return scan.result if scan else None
    finally:
        session.close()


def list_watchlist(user_id: int) -> list[dict]:
    session = SessionLocal()
    try:
        items = session.scalars(select(Watchlist).where(Watchlist.user_id == user_id).order_by(Watchlist.created_at.desc())).all()
        return [{"id": item.id, "domain": item.domain, "last_score": item.last_score, "last_verdict": item.last_verdict, "last_checked_at": item.last_checked_at.isoformat() if item.last_checked_at else None} for item in items]
    finally:
        session.close()


def add_watchlist(user_id: int, domain: str) -> dict:
    session = SessionLocal()
    try:
        existing = session.scalar(select(Watchlist).where(Watchlist.user_id == user_id, Watchlist.domain == domain))
        if existing:
            return {"id": existing.id, "domain": existing.domain, "exists": True}
        item = Watchlist(user_id=user_id, domain=domain)
        session.add(item)
        session.commit()
        session.refresh(item)
        return {"id": item.id, "domain": item.domain, "exists": False}
    finally:
        session.close()


def update_watchlist_result(user_id: int, item_id: int, result: dict) -> dict | None:
    session = SessionLocal()
    try:
        item = session.get(Watchlist, item_id)
        if not item or item.user_id != user_id:
            return None
        previous_score, previous_verdict = item.last_score, item.last_verdict
        item.last_score = result["summary"]["overall_score"]
        item.last_verdict = result["summary"]["verdict"]
        item.last_checked_at = datetime.now(timezone.utc)
        session.commit()
        return {"result": result, "alert": previous_score is not None and (previous_score != item.last_score or previous_verdict != item.last_verdict), "previous_score": previous_score, "previous_verdict": previous_verdict}
    finally:
        session.close()


def remove_watchlist(user_id: int, item_id: int) -> bool:
    session = SessionLocal()
    try:
        item = session.get(Watchlist, item_id)
        if not item or item.user_id != user_id:
            return False
        session.delete(item)
        session.commit()
        return True
    finally:
        session.close()


def save_feedback(user_id: int | None, scan_id: int | None, category: str, message: str) -> None:
    session = SessionLocal()
    try:
        session.add(Feedback(user_id=user_id, scan_id=scan_id, category=category, message=message))
        session.commit()
    finally:
        session.close()
