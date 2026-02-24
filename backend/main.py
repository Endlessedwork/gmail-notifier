import logging
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from backend.core.config import settings
from backend.core.database import engine, Base
from backend.middlewares import add_cors_middleware
from backend.routes import (
    gmail_accounts,
    notification_channels,
    filter_rules,
    notification_logs,
    config_settings,
    compat,
)

logger = logging.getLogger(__name__)

# สร้าง tables (ถ้ายังไม่มี) - ถ้าล้มยังให้ API ขึ้นก่อน
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logger.warning("Database init failed (tables may already exist or path issue): %s", e)

# สร้าง FastAPI app
app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    docs_url="/docs",
    redoc_url="/redoc"
)

# เพิ่ม CORS middleware
add_cors_middleware(app)


@app.get("/")
def root():
    """Health check endpoint"""
    return JSONResponse(
        content={
            "status": "ok",
            "app": settings.app_name,
            "version": "1.0.0"
        }
    )


@app.get("/health")
def health():
    """Health check endpoint"""
    return JSONResponse(
        content={
            "status": "healthy",
            "database": "connected"
        }
    )

@app.get(f"{settings.api_prefix}/health")
def api_health():
    """Health check endpoint under API prefix (used by container healthcheck)."""
    return JSONResponse(content={"status": "healthy"})


# Register routes
app.include_router(compat.router)  # /api/health, /api/config, /api/metrics, /api/rules
app.include_router(gmail_accounts.router, prefix=settings.api_prefix)
app.include_router(notification_channels.router, prefix=settings.api_prefix)
app.include_router(filter_rules.router, prefix=settings.api_prefix)
app.include_router(notification_logs.router, prefix=settings.api_prefix)
app.include_router(config_settings.router, prefix=settings.api_prefix)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
