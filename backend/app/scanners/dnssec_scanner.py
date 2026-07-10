import dns.resolver


def get_dnssec(domain: str):
    try:
        resolver = dns.resolver.Resolver()

        try:
            answers = resolver.resolve(domain, "DNSKEY")

            if answers:
                return {
                    "status": "success",
                    "data": {
                        "enabled": True,
                        "records_found": len(answers)
                    },
                    "issues": [],
                    "recommendations": []
                }

        except dns.resolver.NoAnswer:
            pass

        return {
            "status": "success",
            "data": {
                "enabled": False,
                "records_found": 0
            },
            "issues": [
                "DNSSEC is not enabled."
            ],
            "recommendations": [
                "Enable DNSSEC to protect against DNS spoofing."
            ]
        }

    except Exception as e:
        return {
            "status": "failed",
            "data": {},
            "issues": [str(e)],
            "recommendations": [
                "Unable to determine DNSSEC status."
            ]
        }