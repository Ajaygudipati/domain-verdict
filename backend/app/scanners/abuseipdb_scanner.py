import requests

from app.core.config import ABUSEIPDB_API_KEY


def get_abuseipdb(ip: str):

    url = "https://api.abuseipdb.com/api/v2/check"

    headers = {
        "Key": ABUSEIPDB_API_KEY,
        "Accept": "application/json"
    }

    params = {
        "ipAddress": ip,
        "maxAgeInDays": 90,
        "verbose": True
    }

    try:

        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=20
        )

        if response.status_code != 200:

            return {
                "status": "failed",
                "score": 0,
                "data": {},
                "issues": [
                    f"AbuseIPDB returned HTTP {response.status_code}"
                ],
                "recommendations": []
            }

        result = response.json()["data"]

        confidence = result.get("abuseConfidenceScore", 0)
        reports = result.get("totalReports", 0)

        if confidence == 0:
            score = 10
            grade = "A+"
            severity = "LOW"

        elif confidence <= 25:
            score = 8
            grade = "A"
            severity = "LOW"

        elif confidence <= 50:
            score = 6
            grade = "B"
            severity = "MEDIUM"

        elif confidence <= 75:
            score = 3
            grade = "C"
            severity = "HIGH"

        else:
            score = 0
            grade = "F"
            severity = "CRITICAL"

        tags = []

        if confidence >= 75:
            tags.append("High Abuse Confidence")

        if reports > 100:
            tags.append("Frequently Reported")

        return {
            "status": "success",
            "score": score,
            "grade": grade,
            "severity": severity,

            "data": {
                "ip": result.get("ipAddress"),
                "country": result.get("countryCode"),
                "isp": result.get("isp"),
                "domain": result.get("domain"),
                "usage_type": result.get("usageType"),
                "abuse_confidence_score": confidence,
                "total_reports": reports,
                "last_reported": result.get("lastReportedAt"),
                "is_whitelisted": result.get("isWhitelisted")
            },

            "tags": tags,

            "issues": [] if confidence == 0 else [
                "This IP has been reported for abusive activity."
            ],

            "recommendations": [] if confidence == 0 else [
                "Review before trusting this IP."
            ]
        }

    except Exception as e:

        return {
            "status": "failed",
            "score": 0,
            "grade": "N/A",
            "severity": "UNKNOWN",
            "data": {},
            "tags": [],
            "issues": [
                str(e)
            ],
            "recommendations": [
                "Unable to query AbuseIPDB."
            ]
        }