from sqlalchemy import select

from app.database.database import SessionLocal
from app.models.scan import Scan


def save_scan(result: dict, user_id: int | None = None) -> int:
    session = SessionLocal()
    try:
        record = Scan(
            user_id=user_id,
            domain=result["scan_info"]["domain"],
            overall_score=result["summary"]["overall_score"],
            verdict=result["summary"]["verdict"],
            result=result,
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        return record.id
    finally:
        session.close()


def list_scans(user_id: int, limit: int) -> list[dict]:
    session = SessionLocal()
    try:
        records = session.scalars(select(Scan).where(Scan.user_id == user_id).order_by(Scan.created_at.desc()).limit(limit)).all()
        return [
            {
                "id": record.id,
                "domain": record.domain,
                "overall_score": record.overall_score,
                "verdict": record.verdict,
                "created_at": record.created_at.isoformat(),
            }
            for record in records
        ]
    finally:
        session.close()


def get_scan(user_id: int, scan_id: int) -> dict | None:
    session = SessionLocal()
    try:
        record = session.get(Scan, scan_id)
        if not record or record.user_id != user_id:
            return None
        result = record.result
        result.setdefault("scan_info", {})["scan_id"] = record.id
        return result
    finally:
        session.close()


def delete_scan(user_id: int, scan_id: int) -> bool:
    session = SessionLocal()
    try:
        record = session.get(Scan, scan_id)
        if not record or record.user_id != user_id:
            return False
        session.delete(record)
        session.commit()
        return True
    finally:
        session.close()
