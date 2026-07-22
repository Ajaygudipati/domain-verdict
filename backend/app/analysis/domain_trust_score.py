from datetime import datetime
from app.core.scoring import CATEGORY_WEIGHTS


def calculate_domain_trust_score(whois):
    score = CATEGORY_WEIGHTS["domain_trust"]
    issues = []

    if whois.get("status") != "success":
        return 6, ["Domain age could not be verified; trust coverage is reduced."]

    data = whois.get("data", {})

    creation_date = data.get("creation_date")

    if not creation_date:
        score -= 5
        issues.append("Domain age unavailable.")
        return max(score, 0), issues

    try:
        created = datetime.strptime(creation_date, "%Y-%m-%d")
        age_years = (datetime.utcnow() - created).days / 365

        if age_years < 1:
            score -= 7
            issues.append("Domain is less than 1 year old.")

        elif age_years < 3:
            score -= 3
            issues.append("Domain is relatively new.")

    except Exception:
        score -= 3
        issues.append("Unable to calculate domain age.")

    return max(score, 0), issues
