import json
from queue import Empty, Queue
from threading import Thread

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from app.services.scan_service import analyze_domain
from app.services.history_service import delete_scan, get_scan, list_scans
from app.core.security import get_user_id_from_token
from app.utils.domain import normalize_domain

router = APIRouter()


@router.get("/scan")
def scan_domain(domain: str = Query(..., min_length=1, max_length=2048), token: str | None = None):
    try:
        normalized_domain = normalize_domain(domain)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    user_id = get_user_id_from_token(token) if token else None
    return analyze_domain(normalized_domain, user_id=user_id)


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
