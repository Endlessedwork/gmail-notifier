import logging
import sys
from fastapi import FastAPI
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.responses import JSONResponse
from backend.core.config import settings
from backend.core.database import engine, Base, run_migrations
from backend.middlewares import add_cors_middleware
from backend.routes import (
    auth,
    gmail_accounts,
    notification_channels,
    filter_rules,
    notification_logs,
    config_settings,
    compat,
)

logger = logging.getLogger(__name__)

# บังคับ log ไป stdout เพื่อให้เห็นใน Easypanel Logs
logging.basicConfig(stream=sys.stdout, level=logging.INFO, force=True)
logger.info("Backend module loading...")

# รัน migrations ก่อน (เพิ่ม user_id ฯลฯ ถ้าตารางเก่า)
try:
    run_migrations()
except Exception as e:
    logger.warning("Migration skipped: %s", e)

# สร้าง tables (ถ้ายังไม่มี) - ถ้าล้มยังให้ API ขึ้นก่อน
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables OK")
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


# Global exception handler - log 500 และ return detail เมื่อ debug
# HTTPException (401, 404 ฯลฯ) และ RequestValidationError (422) ให้ FastAPI จัดการ
@app.exception_handler(Exception)
def global_exception_handler(request, exc):
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    if isinstance(exc, RequestValidationError):
        raise exc  # FastAPI มี handler สำหรับ 422
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc) if settings.debug else "Internal server error"},
    )


# Register routes
logger.info("Registering routes...")
app.include_router(compat.router)  # /api/health, /api/config, /api/metrics, /api/rules
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(gmail_accounts.router, prefix=settings.api_prefix)
app.include_router(notification_channels.router, prefix=settings.api_prefix)
app.include_router(filter_rules.router, prefix=settings.api_prefix)
app.include_router(notification_logs.router, prefix=settings.api_prefix)
app.include_router(config_settings.router, prefix=settings.api_prefix)
logger.info("Backend app ready")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
