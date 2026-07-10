import requests


IMPORTANT_HEADERS = [
    "Strict-Transport-Security",
    "Content-Security-Policy",
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Permissions-Policy"
]


def get_security_headers(domain: str):

    url = f"https://{domain}"

    try:
        response = requests.get(url, timeout=10)

        found_headers = {}
        issues = []
        recommendations = []

        for header in IMPORTANT_HEADERS:

            value = response.headers.get(header)

            if value:
                found_headers[header] = value

            else:
                found_headers[header] = "Missing"
                issues.append(f"{header} is missing.")
                recommendations.append(f"Configure {header}.")

        return {
            "status": "success",
            "data": found_headers,
            "issues": issues,
            "recommendations": recommendations
        }

    except Exception as e:

        return {
            "status": "failed",
            "data": {},
            "issues": [str(e)],
            "recommendations": [
                "Unable to inspect security headers."
            ]
        }