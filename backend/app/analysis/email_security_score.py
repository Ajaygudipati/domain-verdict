from app.core.scoring import CATEGORY_WEIGHTS


def calculate_email_security_score(spf, dkim, dmarc):

    score = CATEGORY_WEIGHTS["email_security"]
    issues = []

    # -------------------
    # SPF
    # -------------------

    if spf.get("status") != "success":
        score -= 5
        issues.append("SPF lookup failed.")

    elif not spf.get("data", {}).get("enabled"):
        score -= 5
        issues.append("SPF record missing.")

    # -------------------
    # DKIM
    # -------------------

    # We don't penalize DKIM yet because
    # automatic selector discovery isn't reliable.

    # -------------------
    # DMARC
    # -------------------

    dmarc_score = dmarc.get("score", 0)

    if dmarc_score == 10:
        pass

    elif dmarc_score >= 8:
        score -= 2
        issues.append("DMARC policy could be stronger.")

    elif dmarc_score >= 4:
        score -= 6
        issues.append("Weak DMARC policy.")

    else:
        score -= 10
        issues.append("DMARC protection missing.")

    return max(score, 0), issues
