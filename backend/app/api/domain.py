import json
from queue import Empty, Queue
from threading import Thread

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from fastapi.responses import StreamingResponse
from app.services.scan_service import analyze_domain
from app.services.history_service import delete_scan, get_scan, list_scans
from app.core.security import get_user_id_from_token
from app.utils.domain import normalize_domain
from app.services.ai_service import answer_from_scan
from app.services.conversation_service import get_conversation, save_conversation
from app.services.product_service import add_watchlist, get_shared_scan, list_watchlist, remove_watchlist, save_feedback, share_scan, update_watchlist_result
from app.services.url_intelligence_service import inspect_url
from app.services.email_lab_service import investigate_email

router = APIRouter()


class AiQuestion(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    report: dict


class ConversationPayload(BaseModel):
    messages: list[dict] = Field(max_length=200)


class WatchlistPayload(BaseModel):
    domain: str = Field(min_length=1, max_length=2048)


class FeedbackPayload(BaseModel):
    category: str = Field(min_length=2, max_length=40)
    message: str = Field(min_length=2, max_length=2000)
    scan_id: int | None = None


class UrlInspectionPayload(BaseModel):
    url: str = Field(min_length=3, max_length=4096)


class EmailInvestigationPayload(BaseModel):
    raw_email: str = Field(min_length=10, max_length=100000)


@router.get("/scan")
def scan_domain(domain: str = Query(..., min_length=1, max_length=2048), token: str | None = None):
    try:
        normalized_domain = normalize_domain(domain)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    user_id = get_user_id_from_token(token) if token else None
    return analyze_domain(normalized_domain, user_id=user_id)


@router.post("/ai/answer")
def ai_answer(payload: AiQuestion):
    return answer_from_scan(payload.question, payload.report)


@router.post("/url/inspect")
def inspect_link(payload: UrlInspectionPayload):
    try:
        return inspect_url(payload.url)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/email-lab/investigate")
def investigate_email_message(payload: EmailInvestigationPayload):
    return investigate_email(payload.raw_email)


@router.post("/reports/{scan_id}/share")
def share_report(scan_id: int, token: str):
    share_token = share_scan(get_user_id_from_token(token), scan_id)
    if not share_token:
        raise HTTPException(status_code=404, detail="Scan not found.")
    return {"token": share_token}


@router.get("/shared/{share_token}")
def shared_report(share_token: str):
    result = get_shared_scan(share_token)
    if not result:
        raise HTTPException(status_code=404, detail="Shared report not found.")
    return result


@router.get("/watchlist")
def get_watchlist(token: str):
    return {"items": list_watchlist(get_user_id_from_token(token))}


@router.post("/watchlist")
def create_watchlist(payload: WatchlistPayload, token: str):
    try:
        domain = normalize_domain(payload.domain)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return add_watchlist(get_user_id_from_token(token), domain)


@router.post("/watchlist/{item_id}/check")
def check_watchlist(item_id: int, token: str):
    user_id = get_user_id_from_token(token)
    items = {item["id"]: item for item in list_watchlist(user_id)}
    item = items.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found.")
    result = analyze_domain(item["domain"], user_id=user_id)
    checked = update_watchlist_result(user_id, item_id, result)
    return checked


@router.delete("/watchlist/{item_id}")
def delete_watchlist(item_id: int, token: str):
    if not remove_watchlist(get_user_id_from_token(token), item_id):
        raise HTTPException(status_code=404, detail="Watchlist item not found.")
    return {"deleted": True}


@router.post("/feedback")
def submit_feedback(payload: FeedbackPayload, token: str | None = None):
    user_id = get_user_id_from_token(token) if token else None
    save_feedback(user_id, payload.scan_id, payload.category, payload.message.strip())
    return {"saved": True}


@router.get("/ai/conversations/{scan_id}")
def load_ai_conversation(scan_id: int, token: str):
    return get_conversation(get_user_id_from_token(token), scan_id) or {"messages": []}


@router.put("/ai/conversations/{scan_id}")
def update_ai_conversation(scan_id: int, payload: ConversationPayload, token: str):
    saved = save_conversation(get_user_id_from_token(token), scan_id, payload.messages)
    if not saved:
        raise HTTPException(status_code=404, detail="Scan not found.")
    return saved


@router.get("/history")
def scan_history(token: str, limit: int = Query(20, ge=1, le=100)):
    return {"scans": list_scans(get_user_id_from_token(token), limit)}


@router.get("/history/{scan_id}")
def scan_history_item(scan_id: int, token: str):
    result = get_scan(get_user_id_from_token(token), scan_id)
    if not result:
        raise HTTPException(status_code=404, detail="Scan not found.")
    return result


@router.delete("/history/{scan_id}")
def remove_scan_history_item(scan_id: int, token: str):
    if not delete_scan(get_user_id_from_token(token), scan_id):
        raise HTTPException(status_code=404, detail="Scan not found.")
    return {"deleted": True}


@router.get("/scan/stream")
def stream_scan(domain: str = Query(..., min_length=1, max_length=2048), token: str | None = None):
    try:
        normalized_domain = normalize_domain(domain)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    # Resolve authentication before the worker starts.  Otherwise the thread
    # can read user_id before this function has assigned it.
    user_id = get_user_id_from_token(token) if token else None
    events = Queue()

    def run_scan():
        try:
            result = analyze_domain(normalized_domain, on_progress=lambda update: events.put(("progress", update)), user_id=user_id)
            events.put(("complete", result))
        except Exception:
            # Avoid returning implementation details to the browser while still
            # ensuring the stream closes gracefully.
            events.put(("error", {"message": "The scan could not be completed. Please try again."}))

    Thread(target=run_scan, daemon=True).start()

    def event_stream():
        while True:
            try:
                event, payload = events.get(timeout=15)
            except Empty:
                yield ": keep-alive\n\n"
                continue

            yield f"event: {event}\ndata: {json.dumps(payload)}\n\n"
            if event in {"complete", "error"}:
                break

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
