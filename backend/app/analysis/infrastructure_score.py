from app.core.scoring import CATEGORY_WEIGHTS


def calculate_infrastructure_score(whois, dns, ssl):
    score = CATEGORY_WEIGHTS["infrastructure"]
    issues = []

    ssl_data = ssl.get("data", {})

    # SSL
    if ssl.get("status") != "success":
        score -= 15
        issues.append("SSL information unavailable.")
    else:
        if ssl_data.get("expired"):
            score -= 10
            issues.append("SSL certificate has expired.")

        if not ssl_data.get("https"):
            score -= 5
            issues.append("HTTPS is not enabled.")

    # WHOIS
    if whois.get("status") != "success":
        # WHOIS data is increasingly redacted or rate-limited for legitimate
        # registrants, so absence is only a modest coverage deduction.
        score -= 2
        issues.append("WHOIS could not be verified; ownership coverage is reduced.")
    else:
        if not whois["data"].get("registrar"):
            score -= 3
            issues.append("Registrar information unavailable.")

    # DNS is returned as a plain record map rather than a scanner envelope.
    if not dns.get("A") and not dns.get("AAAA"):
        score -= 5
        issues.append("No A or AAAA record was found.")

    return max(score, 0), issues
