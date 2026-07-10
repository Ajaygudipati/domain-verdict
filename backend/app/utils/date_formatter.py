from datetime import datetime


def format_date(value):
    if value is None:
        return None

    if isinstance(value, list):
        value = value[0]

    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d")

    return str(value)