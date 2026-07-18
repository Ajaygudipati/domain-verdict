from app.analysis.risk_engine import calculate_risk
from app.core.security import create_access_token, get_user_id_from_token, hash_password, verify_password
from app.utils.domain import normalize_domain


def test_normalizes_domain_urls():
    assert normalize_domain(" HTTPS://ExAmple.COM/path ") == "example.com"


def test_rejects_non_domain_input():
    for value in ("", "localhost", "bad_domain.com"):
        try:
            normalize_domain(value)
        except ValueError:
            continue
        raise AssertionError(f"Accepted invalid input: {value}")


def test_clean_scan_has_a_100_point_score_and_high_coverage():
    success = {"status": "success", "data": {}, "score": 10, "issues": []}
    risk = calculate_risk(
        {"status": "success", "data": {"registrar": "x", "creation_date": "2020-01-01"}},
        {"A": ["1.1.1.1"]},
        {"status": "success", "data": {"expired": False, "https": True}},
        success,
        {"status": "success", "data": {"enabled": True}},
        success,
        {"status": "success", "score": 10, "data": {}},
        success,
        success,
        success,
    )
    assert risk["score"] == 100
    assert risk["confidence"] == "HIGH"
    assert risk["completed_sources"] == 8


def test_passwords_and_tokens_are_not_plaintext():
    password_hash = hash_password("a-long-test-password")
    assert password_hash != "a-long-test-password"
    assert verify_password("a-long-test-password", password_hash)
    assert not verify_password("wrong-password", password_hash)
    assert get_user_id_from_token(create_access_token(42)) == 42
