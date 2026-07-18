import re
from urllib.parse import urlparse


DOMAIN_LABEL = re.compile(r"^(?!-)[a-z0-9-]{1,63}(?<!-)$", re.IGNORECASE)


def normalize_domain(value: str) -> str:
    """Return a canonical hostname or raise ValueError for unsafe scan input."""
    raw = value.strip()
    if not raw:
        raise ValueError("Enter a domain to scan.")

    parsed = urlparse(raw if "://" in raw else f"//{raw}")
    hostname = parsed.hostname
    if not hostname or parsed.username or parsed.password:
        raise ValueError("Enter a valid domain or website URL.")

    try:
        domain = hostname.rstrip(".").encode("idna").decode("ascii").lower()
    except UnicodeError as exc:
        raise ValueError("The domain name is not valid.") from exc

    if len(domain) > 253 or "." not in domain:
        raise ValueError("Enter a valid public domain, such as example.com.")

    if not all(DOMAIN_LABEL.match(label) for label in domain.split(".")):
        raise ValueError("The domain name contains an invalid label.")

    return domain
