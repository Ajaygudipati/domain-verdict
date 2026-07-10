import requests

from app.core.config import GOOGLE_SAFE_BROWSING_API_KEY


def get_google_safe_browsing(domain: str):

    url = (
        "https://safebrowsing.googleapis.com/v4/"
        f"threatMatches:find?key={GOOGLE_SAFE_BROWSING_API_KEY}"
    )

    body = {
        "client": {
            "clientId": "domain-verdict",
            "clientVersion": "1.0.0"
        },
        "threatInfo": {
            "threatTypes": [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION"
            ],
            "platformTypes": [
                "ANY_PLATFORM"
            ],
            "threatEntryTypes": [
                "URL"
            ],
            "threatEntries": [
                {
                    "url": f"http://{domain}"
                },
                {
                    "url": f"https://{domain}"
                }
            ]
        }
    }

    try:

        response = requests.post(
            url,
            json=body,
            timeout=20
        )

        response.raise_for_status()

        data = response.json()

        matches = data.get("matches", [])

        if not matches:

            return {
                "status": "success",
                "score": 10,
                "grade": "A+",
                "severity": "LOW",
                "data": {
                    "unsafe": False,
                    "threats": []
                },
                "tags": [],
                "issues": [],
                "recommendations": []
            }

        threats = list(
            {
                match["threatType"]
                for match in matches
            }
        )

        return {
            "status": "success",
            "score": 0,
            "grade": "F",
            "severity": "CRITICAL",
            "data": {
                "unsafe": True,
                "threats": threats
            },
            "tags": threats,
            "issues": [
                "Google Safe Browsing has flagged this domain."
            ],
            "recommendations": [
                "Avoid visiting or interacting with this website."
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
                "Unable to query Google Safe Browsing."
            ]
        }