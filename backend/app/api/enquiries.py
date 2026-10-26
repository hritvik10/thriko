"""POST /api/enquiries: validate a quote request and append it to the spreadsheet."""

import logging
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from starlette.concurrency import run_in_threadpool

from ..schemas import TIMELINE_LABELS, EnquiryIn, EnquiryOut
from ..services.excel_store import EnquiryRecord, ExcelEnquiryStore, ExcelStoreError
from ..services.rate_limiter import RateLimiter
from .dependencies import client_ip, get_rate_limiter, get_store

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["enquiries"])

SUCCESS_MESSAGE = "Thanks! We'll be in touch within one business day."


def new_reference() -> str:
    """Short, human-friendly reference such as TH-4F9A2C (shown in the spreadsheet)."""
    return f"TH-{secrets.token_hex(3).upper()}"


@router.post("/enquiries", response_model=EnquiryOut, status_code=status.HTTP_201_CREATED)
async def create_enquiry(
    enquiry: EnquiryIn,
    request: Request,
    store: ExcelEnquiryStore = Depends(get_store),
    limiter: RateLimiter = Depends(get_rate_limiter),
) -> EnquiryOut:
    if not limiter.allow(client_ip(request)):
        logger.warning("Rate limit hit for an enquiry submission")
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests, please try later.")

    reference = new_reference()

    # Honeypot filled in: pretend success so bots learn nothing, but store nothing.
    if enquiry.is_probably_spam:
        logger.info("Discarded likely spam enquiry %s", reference)
        return EnquiryOut(id=reference, message=SUCCESS_MESSAGE)

    record = EnquiryRecord(
        reference=reference,
        submitted_at=datetime.now(timezone.utc),
        name=enquiry.name,
        email=str(enquiry.email),
        country=enquiry.country_label,
        project_type=enquiry.project_type_labels,
        currency=enquiry.currency,
        budget=enquiry.budget_amount,
        timeline=TIMELINE_LABELS[enquiry.timeline],
        founding_partner=enquiry.partner_program,
        message=enquiry.message,
    )

    try:
        # openpyxl is blocking; run it off the event loop.
        await run_in_threadpool(store.append, record)
    except ExcelStoreError:
        logger.exception("Failed to store enquiry %s", reference)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="We could not save your enquiry right now. Please try again shortly.",
        )

    # Log the reference and type only: no names, emails or messages in logs.
    logger.info("Received enquiry %s (%s, %s)", reference, enquiry.country, ",".join(enquiry.project_types))
    return EnquiryOut(id=reference, message=SUCCESS_MESSAGE)
