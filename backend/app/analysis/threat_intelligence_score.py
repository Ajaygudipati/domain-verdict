from app.core.scoring import CATEGORY_WEIGHTS


# A domain verdict should be driven primarily by domain-specific evidence.  IP
# reputation is deliberately a small signal because many legitimate sites share
# CDN and cloud-provider addresses with unrelated tenants.
SOURCE_WEIGHTS = {
    "virustotal": 18,
    "google_safe_browsing": 10,
    "abuseipdb": 2,
}


def _source_points(result, weight, unavailable_issue):
    """Return weighted points without treating an unavailable service as safe."""
    if result.get("status") == "success":
        provider_score = min(max(result.get("score", 0), 0), 10)
        return round(weight * provider_score / 10), result.get("issues", [])

    # Unknown evidence is neutral, not a clean result and not a threat finding.
    return round(weight / 2), [unavailable_issue]


def calculate_threat_intelligence_score(
    virustotal,
    abuseipdb,
    google_safe_browsing
):

    score = 0
    issues = []

    for result, source, message in (
        (virustotal, "virustotal", "VirusTotal was unavailable; this scan has reduced threat-intelligence coverage."),
        (google_safe_browsing, "google_safe_browsing", "Google Safe Browsing was unavailable; this scan has reduced threat-intelligence coverage."),
        (abuseipdb, "abuseipdb", "AbuseIPDB was unavailable; this scan has reduced threat-intelligence coverage."),
    ):
        points, source_issues = _source_points(result, SOURCE_WEIGHTS[source], message)
        score += points
        issues.extend(source_issues)

    return min(score, CATEGORY_WEIGHTS["threat_intelligence"]), issues
