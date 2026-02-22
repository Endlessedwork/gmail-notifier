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
    config_settings
)

# สร้าง tables (ถ้ายังไม่มี)
Base.metadata.create_all(bind=engine)

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


# Register routes
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
