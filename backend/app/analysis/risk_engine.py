from app.analysis.infrastructure_score import calculate_infrastructure_score
from app.analysis.website_security_score import calculate_website_security_score
from app.analysis.domain_trust_score import calculate_domain_trust_score
from app.analysis.email_security_score import calculate_email_security_score
from app.analysis.threat_intelligence_score import calculate_threat_intelligence_score



def calculate_risk(
    whois,
    dns,
    ssl,
    headers,
    spf,
    dkim,
    dmarc,
    virustotal,
    abuseipdb,
    google_safe_browsing
):

    # ------------------------------------
    # Infrastructure (30)
    # ------------------------------------

    infrastructure_score, infrastructure_issues = (
        calculate_infrastructure_score(
            whois,
            dns,
            ssl
        )
    )

    # ------------------------------------
    # Website Security (20)
    # ------------------------------------

    website_security_score, website_security_issues = (
        calculate_website_security_score(
            headers
        )
    )

    # ------------------------------------
    # Email Security (20)
    # ------------------------------------

    email_security_score, email_security_issues = (
        calculate_email_security_score(
            spf,
            dkim,
            dmarc
        )
    )

    # ------------------------------------
    # Threat Intelligence (30)
    # ------------------------------------

    threat_intelligence_score, threat_intelligence_issues = (
        calculate_threat_intelligence_score(
            virustotal,
            abuseipdb,
            google_safe_browsing
        )
    )

    # ------------------------------------
    # Domain Trust (20)
    # ------------------------------------

    domain_trust_score, domain_trust_issues = (
        calculate_domain_trust_score(
            whois
        )
    )

    # ------------------------------------
    # Final Score
    # ------------------------------------

    total_score = (
        infrastructure_score +
        website_security_score +
        email_security_score +
        threat_intelligence_score +
        domain_trust_score
    )

    total_score = min(max(total_score, 0), 100)

    evidence_sources = [whois, ssl, headers, spf, dmarc, virustotal, abuseipdb, google_safe_browsing]
    completed_sources = sum(source.get("status") == "success" for source in evidence_sources)
    confirmed_threat = any(source.get("status") == "success" and source.get("score", 10) == 0 for source in (virustotal, google_safe_browsing))
    score_ceiling, score_policy_note = 100, "All core evidence sources completed successfully."
    if confirmed_threat:
        score_ceiling, score_policy_note = 39, "A confirmed threat-provider flag caps the score until it is resolved."
    elif completed_sources < 5:
        score_ceiling, score_policy_note = 69, "Limited evidence coverage prevents a high-trust score."
    elif completed_sources < 7:
        score_ceiling, score_policy_note = 84, "Incomplete evidence coverage prevents a top-tier score."
    total_score = min(total_score, score_ceiling)

    # ------------------------------------
    # Verdict
    # ------------------------------------

    if total_score >= 92:
        verdict = "SAFE"
        trust_level = "VERY TRUSTED"

    elif total_score >= 76:
        verdict = "LOW RISK"
        trust_level = "TRUSTED"

    elif total_score >= 55:
        verdict = "MEDIUM RISK"
        trust_level = "CAUTION"

    elif total_score >= 35:
        verdict = "HIGH RISK"
        trust_level = "UNTRUSTED"

    else:
        verdict = "CRITICAL"
        trust_level = "DANGEROUS"

    # ------------------------------------
    # Confidence is based on the amount of evidence collected, not the verdict.
    # A score can be high while a third-party provider is unavailable, so using
    # the score itself here would overstate how complete the assessment is.
    # ------------------------------------

    if completed_sources >= 7:
        confidence = "HIGH"

    elif completed_sources >= 5:
        confidence = "MEDIUM"

    else:
        confidence = "LOW"

    # ------------------------------------
    # Merge Issues
    # ------------------------------------

    issues = (
        infrastructure_issues +
        website_security_issues +
        email_security_issues +
        threat_intelligence_issues +
        domain_trust_issues
    )

    # ------------------------------------
    # Return
    # ------------------------------------

    return {

        "score": total_score,

        "verdict": verdict,

        "trust_level": trust_level,

        "confidence": confidence,

        "completed_sources": completed_sources,
        "total_sources": len(evidence_sources),

        "category_scores": {

            "infrastructure": infrastructure_score,

            "website_security": website_security_score,

            "email_security": email_security_score,

            "threat_intelligence": threat_intelligence_score,

            "domain_trust": domain_trust_score

        },

        "score_explanation": {
            "policy": score_policy_note,
            "score_ceiling": score_ceiling,
            "categories": [
                {"key": "infrastructure", "label": "Infrastructure", "earned": infrastructure_score, "maximum": 25},
                {"key": "website_security", "label": "Website security", "earned": website_security_score, "maximum": 20},
                {"key": "email_security", "label": "Email security", "earned": email_security_score, "maximum": 15},
                {"key": "threat_intelligence", "label": "Threat intelligence", "earned": threat_intelligence_score, "maximum": 30},
                {"key": "domain_trust", "label": "Domain trust", "earned": domain_trust_score, "maximum": 10},
            ],
        },

        "issues": issues

    }
