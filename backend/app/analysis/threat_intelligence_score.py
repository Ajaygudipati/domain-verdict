from app.core.scoring import CATEGORY_WEIGHTS


def calculate_threat_intelligence_score(
    virustotal,
    abuseipdb,
    google_safe_browsing
):

    # Maximum score for Threat Intelligence
    score = CATEGORY_WEIGHTS["threat_intelligence"]

    issues = []

    # ------------------------------------
    # VirusTotal (10 Points)
    # ------------------------------------

    vt_score = virustotal.get("score", 0)

    if vt_score < 10:

        deduction = 10 - vt_score

        score -= deduction

        issues.extend(
            virustotal.get("issues", [])
        )

    # ------------------------------------
    # AbuseIPDB (10 Points)
    # ------------------------------------

    abuse_score = abuseipdb.get("score", 0)

    if abuse_score < 10:

        deduction = 10 - abuse_score

        score -= deduction

        issues.extend(
            abuseipdb.get("issues", [])
        )

    # ------------------------------------
    # Google Safe Browsing (10 Points)
    # ------------------------------------

    gsb_score = google_safe_browsing.get("score", 0)

    if gsb_score < 10:

        deduction = 10 - gsb_score

        score -= deduction

        issues.extend(
            google_safe_browsing.get("issues", [])
        )

    # ------------------------------------
    # Prevent Negative Scores
    # ------------------------------------

    score = max(score, 0)

    return score, issues