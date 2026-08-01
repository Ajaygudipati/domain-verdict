import json

import requests

from app.core.config import OPENAI_API_KEY, OPENAI_MODEL


def answer_from_scan(question: str, report: dict) -> dict:
    """Return a grounded optional model response; callers provide a local fallback."""
    if not OPENAI_API_KEY:
        return {"enabled": False, "answer": None}

    instructions = (
        "You are Sentrynx AI, a domain-security analyst. Answer only from the supplied "
        "scan report. Be clear and concise. If data is unavailable, say so plainly. Never "
        "claim that a domain is guaranteed safe and do not invent WHOIS, DNS, or threat data."
    )
    payload = {
        "model": OPENAI_MODEL,
        "instructions": instructions,
        "input": f"Scan report:\n{json.dumps(report, default=str)}\n\nUser question: {question}",
    }
    try:
        response = requests.post(
            "https://api.openai.com/v1/responses",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
            json=payload,
            timeout=25,
        )
        response.raise_for_status()
        data = response.json()
        answer = data.get("output_text")
        if answer:
            return {"enabled": True, "answer": answer}
    except requests.RequestException:
        pass
    return {"enabled": False, "answer": None}
