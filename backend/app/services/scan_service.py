from concurrent.futures import ThreadPoolExecutor, as_completed

from app.analysis.risk_engine import calculate_risk
from app.scanners.abuseipdb_scanner import get_abuseipdb
from app.scanners.dkim_scanner import get_dkim
from app.scanners.dmarc_scanner import get_dmarc
from app.scanners.dns_scanner import get_dns
from app.scanners.dnssec_scanner import get_dnssec
from app.scanners.google_safe_browsing_scanner import get_google_safe_browsing
from app.scanners.ip_scanner import get_ip_intelligence
from app.scanners.security_headers_scanner import get_security_headers
from app.scanners.spf_scanner import get_spf
from app.scanners.ssl_scanner import get_ssl
from app.scanners.technology_scanner import get_technology
from app.scanners.virustotal_scanner import get_virustotal
from app.scanners.whois_scanner import get_whois
from app.services.history_service import save_scan
from app.utils.response_builder import build_response


def analyze_domain(domain: str, on_progress=None, user_id: int | None = None):
    def report(stage, completed, total):
        if on_progress:
            on_progress(
                {
                    "stage": stage,
                    "completed": completed,
                    "total": total,
                }
            )

    scanners = {
        "whois": get_whois,
        "dns": get_dns,
        "ssl": get_ssl,
        "headers": get_security_headers,
        "ip_info": get_ip_intelligence,
        "technology": get_technology,
        "dnssec": get_dnssec,
        "spf": get_spf,
        "dkim": get_dkim,
        "dmarc": get_dmarc,
        "virustotal": get_virustotal,
        "google_safe_browsing": get_google_safe_browsing,
    }

    total_checks = len(scanners) + 1
    report("Starting security checks", 0, total_checks)

    # Run all scanners in parallel
    with ThreadPoolExecutor(max_workers=len(scanners)) as executor:

        futures = {
            executor.submit(scanner, domain): name
            for name, scanner in scanners.items()
        }

        results = {}

        for completed, future in enumerate(as_completed(futures), start=1):

            name = futures[future]

            try:
                results[name] = future.result()

            except Exception as e:
                print(f"{name} scanner failed: {e}")

                results[name] = {
                    "status": "failed",
                    "issues": [str(e)],
                }

            report(
                f"Completed {name.replace('_', ' ')} check",
                completed,
                total_checks,
            )

    # -----------------------------------
    # Extract Results
    # -----------------------------------

    whois = results["whois"]
    dns = results["dns"]
    ssl = results["ssl"]
    headers = results["headers"]
    ip_info = results["ip_info"]
    technology = results["technology"]
    dnssec = results["dnssec"]
    spf = results["spf"]
    dkim = results["dkim"]
    dmarc = results["dmarc"]
    virustotal = results["virustotal"]
    google_safe_browsing = results["google_safe_browsing"]

    # -----------------------------------
    # AbuseIPDB
    # -----------------------------------

    resolved_ip = ip_info.get("data", {}).get("ip")

    if resolved_ip:

        report("Checking IP reputation", total_checks - 1, total_checks)

        abuseipdb = get_abuseipdb(resolved_ip)

    else:

        abuseipdb = {
            "status": "failed",
            "score": 0,
            "grade": "N/A",
            "severity": "UNKNOWN",
            "data": {},
            "tags": [],
            "issues": ["Unable to resolve IP."],
            "recommendations": [],
        }

    report("Calculating final verdict", total_checks, total_checks)

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
        google_safe_browsing,
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
        "google_safe_browsing": google_safe_browsing,
    }

    # -----------------------------------
    # Build Final Response
    # -----------------------------------

    response = build_response(
        domain=domain,
        risk=risk,
        analysis=analysis,
    )

    response["scan_info"]["scan_id"] = save_scan(
        response,
        user_id=user_id,
    )

    return response