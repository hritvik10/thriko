"""Shared objects injected into route handlers. Tests override these via app.dependency_overrides."""

from functools import lru_cache

from fastapi import Request

from ..config import get_settings
from ..services.excel_store import ExcelEnquiryStore
from ..services.rate_limiter import RateLimiter


@lru_cache
def get_store() -> ExcelEnquiryStore:
    return ExcelEnquiryStore(get_settings().excel_path)


@lru_cache
def get_rate_limiter() -> RateLimiter:
    settings = get_settings()
    return RateLimiter(settings.rate_limit_requests, settings.rate_limit_window_seconds)


def client_ip(request: Request) -> str:
    """Best-effort client IP. Only trusts X-Forwarded-For when configured to."""
    if get_settings().trust_proxy_headers:
        forwarded = request.headers.get("x-forwarded-for", "")
        if forwarded:
            return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
