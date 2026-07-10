from datetime import datetime


def calculate_domain_trust_score(whois):
    score = 20
    issues = []

    if whois.get("status") != "success":
        return 10, ["WHOIS lookup failed."]

    data = whois.get("data", {})

    creation_date = data.get("creation_date")

    if not creation_date:
        score -= 8
        issues.append("Domain age unavailable.")
        return max(score, 0), issues

    try:
        created = datetime.strptime(creation_date, "%Y-%m-%d")
        age_years = (datetime.utcnow() - created).days / 365

        if age_years < 1:
            score -= 10
            issues.append("Domain is less than 1 year old.")

        elif age_years < 3:
            score -= 5
            issues.append("Domain is relatively new.")

    except Exception:
        score -= 5
        issues.append("Unable to calculate domain age.")

    return max(score, 0), issues