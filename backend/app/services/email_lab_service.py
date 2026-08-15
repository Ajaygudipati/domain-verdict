"""Evidence-led, offline-safe email triage for the Email Lab."""

import re
from email import policy
from email.parser import Parser
from email.utils import parseaddr
from app.scanners.dkim_scanner import get_dkim
from app.scanners.dmarc_scanner import get_dmarc
from app.scanners.spf_scanner import get_spf
from app.services.url_intelligence_service import inspect_url
from app.utils.domain import normalize_domain

SUSPICIOUS_LANGUAGE = (
    "urgent", "immediately", "password", "verify", "suspended", "unusual activity",
    "gift card", "wire transfer", "invoice", "click here", "login", "sign in",
)
HEADER_NAMES = ("from", "reply-to", "return-path", "subject", "date", "message-id", "authentication-results")


def _extract_urls(text: str) -> list[str]:
    return list(dict.fromkeys(re.findall(r"https?://[^\s<>'\"]+", text, flags=re.IGNORECASE)))[:20]


def _addresses(message) -> dict:
    values = {}
    for header in ("From", "Reply-To", "Return-Path"):
        name, address = parseaddr(message.get(header, ""))
        values[header.lower().replace("-", "_")] = {"name": name, "address": address}
    return values


def _domain_from_address(address: str) -> str | None:
    if "@" not in address:
        return None
    try:
        return normalize_domain(address.rsplit("@", 1)[1])
    except ValueError:
        return None


def _indicator(kind: str, value: str, severity: str, note: str) -> dict:
    return {"type": kind, "value": value, "severity": severity, "note": note}


def investigate_email(raw_email: str) -> dict:
    """Analyze a pasted raw email or header; no delivery, attachment, or link fetching occurs."""
    message = Parser(policy=policy.default).parsestr(raw_email)
    headers = {name: str(message.get(name, "")) for name in HEADER_NAMES if message.get(name)}
    addresses = _addresses(message)
    sender_domain = _domain_from_address(addresses["from"]["address"])
    reply_domain = _domain_from_address(addresses["reply_to"]["address"])
    body = raw_email.lower()
    findings, actions, indicators = [], [], []
    risk = 0

    auth_header = headers.get("authentication-results", "").lower()
    for mechanism in ("spf", "dkim", "dmarc"):
        if f"{mechanism}=fail" in auth_header or f"{mechanism}=softfail" in auth_header:
            findings.append({"severity": "high", "title": f"{mechanism.upper()} authentication failed", "detail": "The receiving mail system recorded a failed authentication result."})
            actions.append(f"Quarantine the message and review why {mechanism.upper()} failed before releasing it.")
            risk += 30
        elif f"{mechanism}=pass" in auth_header:
            findings.append({"severity": "low", "title": f"{mechanism.upper()} passed", "detail": "A passing result appears in Authentication-Results. Verify alignment for high-confidence decisions."})

    if reply_domain and sender_domain and reply_domain != sender_domain:
        findings.append({"severity": "medium", "title": "Reply-To domain differs from sender", "detail": f"Replies would be sent to {reply_domain}, not {sender_domain}."})
        actions.append("Confirm the alternate Reply-To address through a trusted channel before responding.")
        risk += 20

    language = [phrase for phrase in SUSPICIOUS_LANGUAGE if phrase in body]
    if language:
        findings.append({"severity": "medium", "title": "Social-engineering language detected", "detail": f"Sensitive or pressure language found: {', '.join(language[:5])}."})
        actions.append("Do not act on urgency or credential/payment requests without independent verification.")
        risk += min(25, len(language) * 4)

    urls = _extract_urls(raw_email)
    inspected_urls = []
    for url in urls:
        try:
            result = inspect_url(url)
            inspected_urls.append(result)
            indicators.append(_indicator("URL", url, "high" if result["risk_score"] >= 55 else "medium" if result["risk_score"] >= 25 else "low", result["verdict"]))
            if result["risk_score"] >= 25:
                findings.append({"severity": "high" if result["risk_score"] >= 55 else "medium", "title": "Suspicious link detected", "detail": f"{result['domain']}: {', '.join(result['findings']) or result['verdict']}."})
                risk += result["risk_score"] // 2
        except ValueError:
            continue

    for label, item in addresses.items():
        if item["address"]:
            indicators.append(_indicator("Email address", item["address"], "low", label.replace("_", " ").title()))
    if sender_domain:
        indicators.append(_indicator("Domain", sender_domain, "low", "Envelope/display sender domain"))

    auth = {"spf": None, "dkim": None, "dmarc": None}
    if sender_domain:
        auth = {"spf": get_spf(sender_domain), "dkim": get_dkim(sender_domain), "dmarc": get_dmarc(sender_domain)}
        if not auth["spf"].get("data", {}).get("enabled"):
            actions.append("Publish a restrictive SPF record that authorizes only legitimate outbound senders.")
        if not auth["dkim"].get("data", {}).get("enabled"):
            actions.append("Enable DKIM signing for every outbound mail platform and rotate keys periodically.")
        policy_value = auth["dmarc"].get("data", {}).get("policy")
        if policy_value in (None, "none"):
            actions.append("Deploy DMARC reporting, validate sources, then enforce quarantine or reject at pct=100.")
        elif policy_value == "quarantine":
            actions.append("After monitoring legitimate traffic, progress DMARC from quarantine to reject at pct=100.")
    else:
        findings.append({"severity": "medium", "title": "Sender domain unavailable", "detail": "A valid From address was not found in the supplied evidence."})
        actions.append("Request the complete original message (.eml) or full headers for reliable authentication analysis.")
        risk += 15

    actions.extend(["Preserve the original email and headers as evidence.", "Report confirmed phishing to your mail/security team and block confirmed IOCs."])
    risk = min(risk, 100)
    verdict = "HIGH RISK" if risk >= 55 else "SUSPICIOUS" if risk >= 25 else "NO STRONG PHISHING SIGNAL"
    return {"verdict": verdict, "risk_score": risk, "sender_domain": sender_domain, "headers": headers, "addresses": addresses, "authentication": auth, "findings": findings, "indicators": indicators, "url_analysis": inspected_urls, "recommended_actions": list(dict.fromkeys(actions)), "safety_note": "This analysis never opens links, executes content, or sends email. Treat results as triage evidence and validate high-impact decisions with your security team."}
