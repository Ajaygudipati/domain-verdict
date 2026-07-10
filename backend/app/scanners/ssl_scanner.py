import socket
import ssl
from datetime import datetime


def get_ssl(domain: str):
    try:
        context = ssl.create_default_context()

        with socket.create_connection((domain, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as secure_sock:

                cert = secure_sock.getpeercert()

                issued_to = dict(x[0] for x in cert["subject"]).get("commonName")
                issued_by = dict(x[0] for x in cert["issuer"]).get("commonName")

                valid_from = cert["notBefore"]
                valid_until = cert["notAfter"]

                expiry = datetime.strptime(
                    valid_until,
                    "%b %d %H:%M:%S %Y %Z"
                )

                days_left = (expiry - datetime.utcnow()).days

                return {
                    "status": "success",
                    "data": {
                        "https": True,
                        "issued_to": issued_to,
                        "issued_by": issued_by,
                        "valid_from": valid_from,
                        "valid_until": valid_until,
                        "days_left": days_left,
                        "expired": days_left < 0
                    },
                    "issues": [],
                    "recommendations": [
                        "SSL certificate is valid."
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
                "Enable HTTPS and install a valid SSL certificate."
            ]
        }