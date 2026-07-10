import requests


def get_technology(domain: str):
    try:

        response = requests.get(
            f"https://{domain}",
            timeout=10
        )

        headers = response.headers

        technology = {}

        # -------------------------
        # Web Server
        # -------------------------
        technology["web_server"] = headers.get(
            "Server",
            "Unknown"
        )

        # -------------------------
        # Powered By
        # -------------------------
        technology["powered_by"] = headers.get(
            "X-Powered-By",
            "Unknown"
        )

        # -------------------------
        # CDN Detection
        # -------------------------
        server = headers.get("Server", "").lower()

        if "cloudflare" in server:
            technology["cdn"] = "Cloudflare"

        elif "akamai" in server:
            technology["cdn"] = "Akamai"

        elif "fastly" in server:
            technology["cdn"] = "Fastly"

        else:
            technology["cdn"] = "Unknown"

        return {
            "status": "success",
            "data": technology,
            "issues": [],
            "recommendations": []
        }

    except Exception as e:

        return {
            "status": "failed",
            "data": {},
            "issues": [str(e)],
            "recommendations": [
                "Unable to detect technologies."
            ]
        }