from urllib.parse import parse_qsl, urlparse

from app.utils.domain import normalize_domain

BRANDS = ("amazon", "apple", "bankofamerica", "coinbase", "facebook", "google", "instagram", "microsoft", "netflix", "paypal", "whatsapp")
SUSPICIOUS_WORDS = ("login", "verify", "secure", "update", "signin", "wallet", "password", "account", "bonus", "gift")


def _distance(left: str, right: str) -> int:
    row = list(range(len(right) + 1))
    for index, char in enumerate(left):
        next_row = [index + 1]
        for offset, other in enumerate(right):
            next_row.append(min(next_row[-1] + 1, row[offset + 1] + 1, row[offset] + (char != other)))
        row = next_row
    return row[-1]


def inspect_url(value: str) -> dict:
    raw = value.strip()
    parsed = urlparse(raw if "://" in raw else f"https://{raw}")
    if parsed.scheme not in {"http", "https"}:
        raise ValueError("Only HTTP and HTTPS links can be inspected.")
    domain = normalize_domain(raw)
    label = domain.split(".")[0]
    normalized_label = label.replace("0", "o").replace("1", "l")
    findings, risk = [], 0
    brand = next((item for item in BRANDS if label != item and (item in label or item in normalized_label or _distance(normalized_label, item) <= 2)), None)
    if brand:
        findings.append(f"Possible {brand.title()} lookalike in the hostname.")
        risk += 45
    if "@" in raw or parsed.username:
        findings.append("The URL contains a user-info marker that can disguise its destination.")
        risk += 35
    if parsed.port and parsed.port not in {80, 443}:
        findings.append(f"The URL uses an uncommon port ({parsed.port}).")
        risk += 10
    words = [word for word in SUSPICIOUS_WORDS if word in f"{parsed.path} {parsed.query}".lower()]
    if words:
        findings.append(f"Sensitive-action terms detected: {', '.join(words[:3])}.")
        risk += min(20, len(words) * 6)
    parameters = parse_qsl(parsed.query, keep_blank_values=True)
    if len(parameters) >= 8:
        findings.append("The link contains an unusually large number of parameters.")
        risk += 8
    if parsed.scheme != "https":
        findings.append("The link does not use HTTPS.")
        risk += 12
    risk = min(risk, 100)
    return {"url": parsed.geturl(), "domain": domain, "risk_score": risk, "verdict": "HIGH RISK" if risk >= 55 else "CAUTION" if risk >= 25 else "NO OBVIOUS PHISHING SIGNAL", "brand_match": brand, "findings": findings, "checks": {"https": parsed.scheme == "https", "parameters": len(parameters), "sensitive_terms": words}}
