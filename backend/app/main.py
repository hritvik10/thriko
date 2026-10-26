"""FastAPI application factory.

Run locally:   uvicorn app.main:app --reload
"""

import logging
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .api.enquiries import router as enquiries_router
from .config import Settings, get_settings
from .schemas import HealthOut


def configure_logging(level: str) -> None:
    logging.basicConfig(level=level.upper(), format="%(asctime)s %(levelname)s %(name)s: %(message)s")


def mount_frontend(app: FastAPI, dist: Path) -> None:
    """Serve the built React app, falling back to index.html for client-side routes like /contact."""
    index_file = dist / "index.html"
    if not index_file.is_file():
        raise RuntimeError(f"THRIKO_FRONTEND_DIST={dist} does not contain index.html; run `npm run build` first.")
    dist_root = dist.resolve()

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa(full_path: str) -> FileResponse:
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404)
        candidate = (dist_root / full_path).resolve()
        # Guard against path traversal (e.g. /../../etc/passwd).
        if candidate.is_file() and dist_root in candidate.parents:
            return FileResponse(candidate)
        return FileResponse(index_file)


def create_app(settings: Optional[Settings] = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(title="Thriko API", version="1.0.0", docs_url="/api/docs", openapi_url="/api/openapi.json")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Accept"],
    )

    @app.get("/api/health", response_model=HealthOut, tags=["meta"])
    async def health() -> HealthOut:
        return HealthOut(status="ok")

    app.include_router(enquiries_router)

    # Registered last so it never shadows API routes.
    if settings.frontend_dist:
        mount_frontend(app, settings.frontend_dist)

    return app


app = create_app()
