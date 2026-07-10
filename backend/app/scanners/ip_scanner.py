import socket
import requests
from urllib.parse import urlparse


def clean_domain(domain: str):
    """
    Removes http://, https://, paths, ports, etc.
    """

    domain = domain.strip()

    if domain.startswith(("http://", "https://")):
        domain = urlparse(domain).hostname

    return domain


def get_ip_intelligence(domain: str):

    try:

        domain = clean_domain(domain)

        if not domain:
            raise Exception("Invalid domain.")

        # Resolve domain
        ip = socket.gethostbyname(domain)

        response = requests.get(
            f"https://ipinfo.io/{ip}/json",
            timeout=10
        )

        response.raise_for_status()

        info = response.json()

        return {
            "status": "success",
            "data": {
                "ip": ip,
                "hostname": info.get("hostname"),
                "city": info.get("city"),
                "region": info.get("region"),
                "country": info.get("country"),
                "location": info.get("loc"),
                "organization": info.get("org"),
                "postal": info.get("postal"),
                "timezone": info.get("timezone")
            },
            "issues": [],
            "recommendations": []
        }

    except socket.gaierror:

        return {
            "status": "failed",
            "data": {},
            "issues": [
                f"Unable to resolve domain '{domain}'."
            ],
            "recommendations": [
                "Verify that the domain exists and has valid DNS records."
            ]
        }

    except requests.RequestException as e:

        return {
            "status": "failed",
            "data": {},
            "issues": [
                f"IPInfo request failed: {str(e)}"
            ],
            "recommendations": [
                "Unable to retrieve IP intelligence."
            ]
        }

    except Exception as e:

        return {
            "status": "failed",
            "data": {},
            "issues": [
                str(e)
            ],
            "recommendations": [
                "Unable to retrieve IP intelligence."
            ]
        }