import dns.resolver


def get_dns(domain: str):
    records = {}

    record_types = ["A", "AAAA", "MX", "NS", "TXT", "CNAME"]

    for record_type in record_types:
        try:
            answers = dns.resolver.resolve(domain, record_type)
            records[record_type] = [str(answer) for answer in answers]
        except Exception:
            records[record_type] = []

    return records