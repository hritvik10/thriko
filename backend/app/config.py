"""Application settings, loaded from environment variables (prefix THRIKO_) or a .env file."""

import json
from functools import lru_cache
from pathlib import Path
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="THRIKO_", env_file=BACKEND_ROOT / ".env", extra="ignore")

    excel_path: Path = BACKEND_ROOT / "data" / "enquiries.xlsx"
    # Set with THRIKO_ALLOWED_ORIGINS, and read through the `allowed_origins`
    # property below. Kept as a string because pydantic-settings JSON-decodes
    # list-typed fields straight from the environment, before any validator runs,
    # so a comma-separated value on a List[str] field fails at startup.
    allowed_origins_value: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        validation_alias="THRIKO_ALLOWED_ORIGINS",
    )
    rate_limit_requests: int = 5
    rate_limit_window_seconds: int = 60
    trust_proxy_headers: bool = False
    frontend_dist: Optional[Path] = None
    log_level: str = "INFO"

    @property
    def allowed_origins(self) -> List[str]:
        """Origins allowed to call the API from a browser, as a list.

        Accepts a comma-separated string (the documented form) or a JSON list.
        """
        value = self.allowed_origins_value.strip()
        if value.startswith("["):
            return [str(origin).strip() for origin in json.loads(value)]
        return [origin.strip() for origin in value.split(",") if origin.strip()]

    @field_validator("excel_path", mode="after")
    @classmethod
    def resolve_excel_path(cls, value: Path) -> Path:
        """Relative paths are resolved against the backend folder, not the shell's cwd."""
        return value if value.is_absolute() else BACKEND_ROOT / value

    @field_validator("frontend_dist", mode="before")
    @classmethod
    def empty_dist_is_none(cls, value: object) -> object:
        return None if value in ("", None) else value


@lru_cache
def get_settings() -> Settings:
    return Settings()
