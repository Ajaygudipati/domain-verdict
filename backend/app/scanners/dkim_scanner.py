import dns.resolver

COMMON_SELECTORS = [
    "default",
    "google",
    "selector1",
    "selector2",
    "mail",
    "smtp",
    "dkim"
]


def get_dkim(domain: str):
    try:

        for selector in COMMON_SELECTORS:

            try:
                query = f"{selector}._domainkey.{domain}"

                answers = dns.resolver.resolve(query, "TXT")

                for record in answers:

                    text = "".join(
                        part.decode() if isinstance(part, bytes) else part
                        for part in record.strings
                    )

                    if "v=DKIM1" in text:

                        return {
                            "status": "success",
                            "data": {
                                "enabled": True,
                                "selector": selector,
                                "record": text
                            },
                            "issues": [],
                            "recommendations": []
                        }

            except Exception:
                continue

        return {
            "status": "success",
            "data": {
                "enabled": False
            },
            "issues": [
                "DKIM record not found."
            ],
            "recommendations": [
                "Configure DKIM for outgoing email."
            ]
        }

    except Exception as e:

        return {
            "status": "failed",
            "data": {},
            "issues": [str(e)],
            "recommendations": [
                "Unable to determine DKIM."
            ]
        }