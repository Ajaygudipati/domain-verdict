from sqlalchemy import select

from app.database.database import SessionLocal
from app.models.conversation import Conversation
from app.models.scan import Scan


def get_conversation(user_id: int, scan_id: int) -> dict | None:
    session = SessionLocal()
    try:
        record = session.scalar(select(Conversation).where(Conversation.user_id == user_id, Conversation.scan_id == scan_id))
        return {"messages": record.messages, "updated_at": record.updated_at.isoformat()} if record else None
    finally:
        session.close()


def save_conversation(user_id: int, scan_id: int, messages: list[dict]) -> dict | None:
    session = SessionLocal()
    try:
        scan = session.get(Scan, scan_id)
        if not scan or scan.user_id != user_id:
            return None
        record = session.scalar(select(Conversation).where(Conversation.user_id == user_id, Conversation.scan_id == scan_id))
        if record:
            record.messages = messages
        else:
            record = Conversation(user_id=user_id, scan_id=scan_id, domain=scan.domain, messages=messages)
            session.add(record)
        session.commit()
        session.refresh(record)
        return {"messages": record.messages, "updated_at": record.updated_at.isoformat()}
    finally:
        session.close()
