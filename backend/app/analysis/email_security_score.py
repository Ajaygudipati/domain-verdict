from app.core.scoring import CATEGORY_WEIGHTS


def calculate_email_security_score(spf, dkim, dmarc):
    # SPF and DMARC are useful signals, but a DNS/provider timeout must not be
    # reported as the same thing as a missing policy.
    score = 0
    issues = []

    # -------------------
    # SPF
    # -------------------

    if spf.get("status") != "success":
        score += 2
        issues.append("SPF could not be verified; email-security coverage is reduced.")
    elif not spf.get("data", {}).get("enabled"):
        issues.append("SPF record missing.")
    else:
        score += 5

    # -------------------
    # DKIM
    # -------------------

    # We don't penalize DKIM yet because
    # automatic selector discovery isn't reliable.

    # -------------------
    # DMARC
    # -------------------

    if dmarc.get("status") != "success":
        score += 5
        issues.append("DMARC could not be verified; email-security coverage is reduced.")
    else:
        dmarc_score = dmarc.get("score", 0)
        if dmarc_score == 10:
            score += 10
        elif dmarc_score >= 8:
            score += 8
            issues.append("DMARC policy could be stronger.")
        elif dmarc_score >= 4:
            score += 4
            issues.append("Weak DMARC policy.")
        else:
            issues.append("DMARC protection missing.")

    return min(score, CATEGORY_WEIGHTS["email_security"]), issues
