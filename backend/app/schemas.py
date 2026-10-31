"""Request and response models.

Project types and timelines must match frontend/src/features/enquiry/options.ts.
Countries and currencies come from /shared/markets.json (see app/markets.py).
"""

from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, ValidationInfo, field_validator
from pydantic_core import PydanticCustomError

from .markets import OTHER_MARKET, get_markets

ProjectType = Literal["website", "mobile_app", "ui_ux", "ai"]
# Upper bound on a typed budget (mirrors MAX_BUDGET in frontend markets.ts).
MAX_BUDGET = 1_000_000_000
Timeline = Literal["asap", "1_3_months", "3_6_months", "flexible"]

# Human-readable labels written to the spreadsheet.
PROJECT_TYPE_LABELS: Dict[str, str] = {
    "website": "Website",
    "mobile_app": "Mobile app",
    "ui_ux": "UI/UX design",
    "ai": "AI integration",
}
TIMELINE_LABELS: Dict[str, str] = {
    "asap": "As soon as possible",
    "1_3_months": "1–3 months",
    "3_6_months": "3–6 months",
    "flexible": "Flexible",
}


class EnquiryIn(BaseModel):
    """A quote request submitted from the website."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    name: str = Field(min_length=2, max_length=100)
    email: EmailStr = Field(max_length=254)
    # Multi-select: at least one, each value at most once.
    project_types: List[ProjectType] = Field(min_length=1, max_length=len(PROJECT_TYPE_LABELS))
    # Field order matters: `country` is validated before `other_country` uses it.
    country: str = Field(max_length=10)
    # validate_default: the "required for OTHER" check must run even when the field is omitted.
    other_country: str = Field(default="", max_length=60, validate_default=True)
    # Order matters: budget_not_sure is validated before budget_amount reads it.
    budget_not_sure: bool = False
    # Whole units of the country's currency. validate_default: the "required" check runs even if omitted.
    budget_amount: Optional[int] = Field(default=None, ge=1, le=MAX_BUDGET, validate_default=True)
    timeline: Timeline
    message: str = Field(default="", max_length=2000)
    partner_program: bool = False
    consent: bool
    # Honeypot field. Real visitors never see it, so it should always be empty.
    website: str = Field(default="", max_length=200)
    # Sent by the browser when Cloudflare Turnstile is enabled. The Worker verifies
    # these at the edge; this API accepts and ignores them so the same frontend
    # build works against either backend (the model forbids unknown fields).
    turnstile_token: str = Field(default="", max_length=4096)
    started_at: Optional[int] = Field(default=None, ge=0)

    @field_validator("project_types", mode="before")
    @classmethod
    def drop_duplicate_types(cls, value: object) -> object:
        """Ignore repeated values (keeps the first occurrence's order)."""
        if isinstance(value, list):
            return list(dict.fromkeys(value))
        return value

    @field_validator("country")
    @classmethod
    def country_must_be_known(cls, value: str) -> str:
        if value not in get_markets():
            raise PydanticCustomError("unknown_country", "Select your country from the list.")
        return value

    @field_validator("other_country")
    @classmethod
    def other_country_required_for_other(cls, value: str, info: ValidationInfo) -> str:
        if info.data.get("country") != OTHER_MARKET:
            return ""  # Only meaningful for "Other country"; ignore otherwise.
        if len(value) < 2:
            raise PydanticCustomError("other_country_required", "Tell us which country you are in.")
        return value

    @field_validator("budget_amount")
    @classmethod
    def budget_required_unless_not_sure(cls, value: Optional[int], info: ValidationInfo) -> Optional[int]:
        if info.data.get("budget_not_sure"):
            return None  # Ignore any amount when the visitor ticked "Not sure yet".
        if value is None:
            raise PydanticCustomError("budget_required", 'Enter your approximate budget, or tick "Not sure yet".')
        return value

    @field_validator("consent")
    @classmethod
    def consent_must_be_given(cls, value: bool) -> bool:
        if not value:
            raise PydanticCustomError("consent_required", "Please confirm we may contact you about this enquiry.")
        return value

    @property
    def project_type_labels(self) -> str:
        """Selected types as one readable cell, e.g. "Website, AI integration"."""
        return ", ".join(PROJECT_TYPE_LABELS[item] for item in self.project_types)

    @property
    def country_label(self) -> str:
        if self.country == OTHER_MARKET:
            return f"Other: {self.other_country}"
        return get_markets()[self.country].name

    @property
    def currency(self) -> str:
        return get_markets()[self.country].currency

    @property
    def is_probably_spam(self) -> bool:
        return bool(self.website)


class EnquiryOut(BaseModel):
    id: str
    message: str


class HealthOut(BaseModel):
    status: Literal["ok"]
