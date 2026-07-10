import dns.resolver


def get_spf(domain: str):
    try:
        resolver = dns.resolver.Resolver()

        # Use Google's public DNS
        resolver.nameservers = ["8.8.8.8", "8.8.4.4"]
        resolver.lifetime = 10
        resolver.timeout = 5

        answers = resolver.resolve(domain, "TXT")

        for record in answers:

            text = "".join(
                part.decode() if isinstance(part, bytes) else part
                for part in record.strings
            )

            if text.startswith("v=spf1"):

                return {
                    "status": "success",
                    "data": {
                        "enabled": True,
                        "record": text
                    },
                    "issues": [],
                    "recommendations": []
                }

        return {
            "status": "success",
            "data": {
                "enabled": False,
                "record": None
            },
            "issues": [
                "SPF record not found."
            ],
            "recommendations": [
                "Publish an SPF record."
            ]
        }

    except Exception as e:

        return {
            "status": "failed",
            "data": {},
            "issues": [str(e)],
            "recommendations": [
                "Unable to retrieve SPF."
            ]
        }