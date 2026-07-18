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

    if virustotal.get("status") == "success" and vt_score < 10:

        deduction = 10 - vt_score

        score -= deduction

        issues.extend(
            virustotal.get("issues", [])
        )
    elif virustotal.get("status") != "success":
        issues.append("VirusTotal was unavailable; this scan has reduced threat-intelligence coverage.")

    # ------------------------------------
    # AbuseIPDB (10 Points)
    # ------------------------------------

    abuse_score = abuseipdb.get("score", 0)

    if abuseipdb.get("status") == "success" and abuse_score < 10:

        deduction = 10 - abuse_score

        score -= deduction

        issues.extend(
            abuseipdb.get("issues", [])
        )
    elif abuseipdb.get("status") != "success":
        issues.append("AbuseIPDB was unavailable; this scan has reduced threat-intelligence coverage.")

    # ------------------------------------
    # Google Safe Browsing (10 Points)
    # ------------------------------------

    gsb_score = google_safe_browsing.get("score", 0)

    if google_safe_browsing.get("status") == "success" and gsb_score < 10:

        deduction = 10 - gsb_score

        score -= deduction

        issues.extend(
            google_safe_browsing.get("issues", [])
        )
    elif google_safe_browsing.get("status") != "success":
        issues.append("Google Safe Browsing was unavailable; this scan has reduced threat-intelligence coverage.")

    # ------------------------------------
    # Prevent Negative Scores
    # ------------------------------------

    score = max(score, 0)

    return score, issues
