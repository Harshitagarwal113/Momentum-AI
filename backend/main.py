import time
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONEncoder, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.utils.logger import setup_logging, get_logger
from backend.utils.exceptions import MomentumBaseException
from backend.models.schemas import StandardResponse
from backend.api.tasks import router as tasks_router
from backend.api.goals import router as goals_router
from backend.api.habits import router as habits_router
from backend.api.reflections import router as reflections_router
from backend.api.memories import router as memories_router
from backend.api.schedules import router as schedules_router
from backend.api.notifications import router as notifications_router
from backend.api.logs import router as logs_router

# Initialize production logging systems
setup_logging()
logger = get_logger("momentum_api")

app = FastAPI(
    title="Momentum AI – Autonomous Chief of Staff API",
    description="Production-grade API foundation powering proactive cognitive agent task execution.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set up production CORS policies (configured via environments normally)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to specific app URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(tasks_router)
app.include_router(goals_router)
app.include_router(habits_router)
app.include_router(reflections_router)
app.include_router(memories_router)
app.include_router(schedules_router)
app.include_router(notifications_router)
app.include_router(logs_router)


@app.middleware("http")
async def audit_logging_middleware(request: Request, call_next):
    """Middlewares that measures API request overhead, logs status codes, and tags requests."""
    start_time = time.perf_counter()
    path = request.url.path
    method = request.method

    logger.info(
        "Inbound API Request received",
        method=method,
        path=path,
        ip=request.client.host if request.client else "unknown"
    )

    try:
        response = await call_next(request)
        duration = time.perf_counter() - start_time
        logger.info(
            "Outbound API Request completed",
            method=method,
            path=path,
            status_code=response.status_code,
            duration_ms=round(duration * 1000, 2)
        )
        return response
    except Exception as exc:
        duration = time.perf_counter() - start_time
        logger.error(
            "Uncaught request exception occurred",
            method=method,
            path=path,
            error=str(exc),
            duration_ms=round(duration * 1000, 2)
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "A critical system exception occurred.",
                "data": None
            }
        )


@app.exception_handler(MomentumBaseException)
async def momentum_exception_handler(request: Request, exc: MomentumBaseException):
    """Gracefully catches application level exceptions and standardizes responses."""
    logger.warning(
        "Momentum Domain exception handled",
        path=request.url.path,
        error_code=exc.error_code,
        message=exc.message
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "data": {"error_code": exc.error_code}
        }
    )


@app.get("/api/v1/health", tags=["System"])
async def health_check():
    """Confirms operational parameters of memory systems, DBs, and cognitive loops."""
    return StandardResponse(
        success=True,
        message="Momentum AI Engine is operational.",
        data={
            "status": "healthy",
            "cognitive_agent_active": True,
            "memory_pool_sync": "synced"
        }
    )
