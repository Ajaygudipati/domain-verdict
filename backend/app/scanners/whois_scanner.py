import whois

from app.utils.date_formatter import format_date


def get_whois(domain: str):
    try:
        result = whois.whois(domain)

        return {
            "status": "success",
            "data": {
                "domain": result.domain_name,
                "registrar": result.registrar,
                "creation_date": format_date(result.creation_date),
                "expiration_date": format_date(result.expiration_date),
                "name_servers": result.name_servers
            },
            "issues": [],
            "recommendations": []
        }

    except Exception as e:
        return {
            "status": "failed",
            "data": {},
            "issues": [str(e)],
            "recommendations": [
                "Unable to retrieve WHOIS information."
            ]
        }