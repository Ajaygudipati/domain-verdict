from app.scanners.whois_scanner import get_whois
from app.scanners.dns_scanner import get_dns
from app.scanners.ssl_scanner import get_ssl
from app.scanners.security_headers_scanner import get_security_headers
from app.scanners.ip_scanner import get_ip_intelligence
from app.scanners.technology_scanner import get_technology
from app.scanners.dnssec_scanner import get_dnssec
from app.scanners.spf_scanner import get_spf
from app.scanners.dkim_scanner import get_dkim
from app.scanners.dmarc_scanner import get_dmarc
from app.scanners.virustotal_scanner import get_virustotal
from app.scanners.abuseipdb_scanner import get_abuseipdb

from app.analysis.risk_engine import calculate_risk
from app.utils.response_builder import build_response
from app.scanners.google_safe_browsing_scanner import get_google_safe_browsing


def analyze_domain(domain: str):

    # -----------------------------------
    # DEBUG
    # -----------------------------------

    print("\n==============================")
    print("DOMAIN RECEIVED:", repr(domain))
    print("==============================\n")

    # -----------------------------------
    # Run Scanners
    # -----------------------------------

    whois = get_whois(domain)
    dns = get_dns(domain)
    ssl = get_ssl(domain)
    headers = get_security_headers(domain)

    ip_info = get_ip_intelligence(domain)

    print("IP INFO:", ip_info)

    technology = get_technology(domain)
    dnssec = get_dnssec(domain)
    spf = get_spf(domain)
    dkim = get_dkim(domain)
    dmarc = get_dmarc(domain)
    virustotal = get_virustotal(domain)
    google_safe_browsing = get_google_safe_browsing(domain)

    # -----------------------------------
    # AbuseIPDB
    # -----------------------------------

    resolved_ip = ip_info.get("data", {}).get("ip")

    print("RESOLVED IP:", resolved_ip)

    if resolved_ip:
        abuseipdb = get_abuseipdb(resolved_ip)
    else:
        abuseipdb = {
            "status": "failed",
            "score": 0,
            "grade": "N/A",
            "severity": "UNKNOWN",
            "data": {},
            "tags": [],
            "issues": [
                "Unable to resolve IP."
            ],
            "recommendations": []
        }

    # -----------------------------------
    # Calculate Risk
    # -----------------------------------

    risk = calculate_risk(
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
    )

    # -----------------------------------
    # Build Analysis
    # -----------------------------------

    analysis = {
        "whois": whois,
        "dns": dns,
        "ssl": ssl,
        "security_headers": headers,
        "ip_intelligence": ip_info,
        "technology": technology,
        "dnssec": dnssec,
        "spf": spf,
        "dkim": dkim,
        "dmarc": dmarc,
        "virustotal": virustotal,
        "abuseipdb": abuseipdb,
        "google_safe_browsing": google_safe_browsing
    }

    # -----------------------------------
    # Build Final Response
    # -----------------------------------

    return build_response(
        domain=domain,
        risk=risk,
        analysis=analysis
    )