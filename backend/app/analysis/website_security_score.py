HEADER_WEIGHTS = {
    "Strict-Transport-Security": 2,
    "Content-Security-Policy": 3,
    "X-Frame-Options": 2,
    "X-Content-Type-Options": 1,
    "Referrer-Policy": 1,
    "Permissions-Policy": 1
}


def calculate_website_security_score(headers):
    score = 20
    issues = []

    if headers.get("status") != "success":
        return 10, ["Unable to inspect security headers."]

    missing = headers.get("data", {})

    for header, weight in HEADER_WEIGHTS.items():
        if missing.get(header) == "Missing":
            score -= weight
            issues.append(f"{header} is missing.")

    return max(score, 0), issues