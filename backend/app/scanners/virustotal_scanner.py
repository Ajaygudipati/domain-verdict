import requests

from app.core.config import VIRUSTOTAL_API_KEY


def get_virustotal(domain: str):

    url = f"https://www.virustotal.com/api/v3/domains/{domain}"

    headers = {
        "x-apikey": VIRUSTOTAL_API_KEY
    }

    try:

        response = requests.get(
            url,
            headers=headers,
            timeout=20
        )

        if response.status_code != 200:

            return {
                "status": "failed",
                "data": {},
                "issues": [
                    f"VirusTotal returned HTTP {response.status_code}"
                ],
                "recommendations": []
            }

        data = response.json()["data"]["attributes"]

        stats = data["last_analysis_stats"]

        malicious = stats.get("malicious", 0)
        suspicious = stats.get("suspicious", 0)
        harmless = stats.get("harmless", 0)
        undetected = stats.get("undetected", 0)

        total_engines = (
            malicious +
            suspicious +
            harmless +
            undetected
        )

        if malicious == 0 and suspicious == 0:
            reputation = "Excellent"
            score = 10

        elif malicious <= 2:
            reputation = "Low Risk"
            score = 8

        elif malicious <= 10:
            reputation = "Suspicious"
            score = 5

        else:
            reputation = "Malicious"
            score = 0

        return {
            "status": "success",
            "score": score,
            "data": {
                "malicious": malicious,
                "suspicious": suspicious,
                "harmless": harmless,
                "undetected": undetected,
                "total_engines": total_engines,
                "reputation": reputation
            },
            "issues": [],
            "recommendations": []
        }

    except Exception as e:

        return {
            "status": "failed",
            "score": 0,
            "data": {},
            "issues": [
                str(e)
            ],
            "recommendations": [
                "Unable to retrieve VirusTotal analysis."
            ]
        }