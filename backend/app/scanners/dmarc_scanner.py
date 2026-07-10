import dns.resolver


def get_dmarc(domain: str):
    try:

        query = f"_dmarc.{domain}"

        answers = dns.resolver.resolve(query, "TXT")

        for record in answers:

            text = "".join(
                part.decode() if isinstance(part, bytes) else part
                for part in record.strings
            )

            if text.startswith("v=DMARC1"):

                # -----------------------------
                # Default Values
                # -----------------------------
                score = 0
                grade = "F"
                policy = "unknown"

                # -----------------------------
                # Determine DMARC Policy
                # -----------------------------
                if "p=reject" in text:
                    score = 10
                    grade = "A+"
                    policy = "reject"

                elif "p=quarantine" in text:
                    score = 8
                    grade = "A"
                    policy = "quarantine"

                elif "p=none" in text:
                    score = 4
                    grade = "C"
                    policy = "none"

                # -----------------------------
                # Check Percentage Enforcement
                # -----------------------------
                if "pct=" in text:
                    try:
                        pct = int(text.split("pct=")[1].split(";")[0])

                        if pct < 100:
                            score = max(score - 1, 0)

                    except Exception:
                        pass

                # -----------------------------
                # Recommendations
                # -----------------------------
                recommendations = []

                if policy == "none":
                    recommendations.append(
                        "Consider changing DMARC policy to quarantine or reject."
                    )

                elif policy == "quarantine":
                    recommendations.append(
                        "Consider changing DMARC policy to reject for maximum protection."
                    )

                else:
                    recommendations.append(
                        "DMARC configuration follows best practices."
                    )

                return {
                    "status": "success",
                    "score": score,
                    "grade": grade,
                    "data": {
                        "enabled": True,
                        "policy": policy,
                        "record": text
                    },
                    "issues": [],
                    "recommendations": recommendations
                }

        return {
            "status": "success",
            "score": 0,
            "grade": "F",
            "data": {
                "enabled": False,
                "policy": None
            },
            "issues": [
                "DMARC record not found."
            ],
            "recommendations": [
                "Publish a DMARC policy to protect against email spoofing."
            ]
        }

    except Exception as e:

        return {
            "status": "failed",
            "score": 0,
            "grade": "N/A",
            "data": {},
            "issues": [str(e)],
            "recommendations": [
                "Unable to retrieve DMARC record."
            ]
        }