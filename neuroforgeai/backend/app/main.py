import logging
import os
from collections.abc import Sequence

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes.research import router as research_router

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)
DEFAULT_CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"]


def create_app(cors_origins: Sequence[str] | None = None) -> FastAPI:
    app = FastAPI(
        title="NeuroForge AI Backend",
        version="0.5.0",
        description="Stage 10 reliability/security API for saved research, analysis, evaluation, and decision-support workflows.",
    )
    configured_origins = os.getenv("CORS_ORIGINS")
    origins = list(cors_origins) if cors_origins is not None else (
        [origin.strip() for origin in configured_origins.split(",") if origin.strip()]
        if configured_origins else DEFAULT_CORS_ORIGINS
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type"],
    )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error("Unhandled error while processing %s %s (%s)", request.method, request.url.path, type(exc).__name__)
        return JSONResponse(status_code=500, content={"detail": "The backend could not complete the request."})

    app.include_router(research_router)
    return app


app = create_app()
