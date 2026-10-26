"""Application settings, loaded from environment variables (prefix THRIKO_) or a .env file."""

from functools import lru_cache
from pathlib import Path
from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="THRIKO_", env_file=BACKEND_ROOT / ".env", extra="ignore")

    excel_path: Path = BACKEND_ROOT / "data" / "enquiries.xlsx"
    allowed_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    rate_limit_requests: int = 5
    rate_limit_window_seconds: int = 60
    trust_proxy_headers: bool = False
    frontend_dist: Optional[Path] = None
    log_level: str = "INFO"

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def split_origins(cls, value: object) -> object:
        """Accept a comma-separated string as well as a JSON list."""
        if isinstance(value, str) and not value.strip().startswith("["):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

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
