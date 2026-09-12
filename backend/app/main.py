from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.models import User  # noqa: F401 — import so SQLAlchemy registers the model
from app.routers import auth_router, files_router


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    docs_url="/docs",        # Swagger UI available at /docs
    redoc_url="/redoc",      # ReDoc available at /redoc
)

# CORS middleware — allows the React frontend to call this API
# Without this, browsers block cross-origin requests (frontend on port 5173, backend on port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(files_router)



@app.on_event("startup")
def on_startup():
    """
    Create all database tables when the application starts.
    
    Base.metadata.create_all() checks which tables exist in PostgreSQL
    and creates any that are missing. It will NOT modify or drop existing tables.
    
    Note: In production, you'd use a migration tool like Alembic instead.
    For Phase 1, this approach is simpler and sufficient.
    """
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health_check():
    """
    Health check endpoint.
    
    Returns a simple status to confirm the API is running.
    Used for monitoring and to verify the server is alive.
    """
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.API_VERSION,
    }


# Step 15: Error Handling Polish
# Custom handler for Pydantic validation errors (422)
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    """
    Formats FastAPI's default validation errors into a simpler, user-friendly format.
    Instead of a complex array of dictionaries, we extract the first meaningful error message.
    """
    errors = exc.errors()
    if errors:
        # Get the first error and create a clean message
        error = errors[0]
        field = error.get("loc", [""])[-1]
        msg = error.get("msg", "Validation error")
        clean_msg = f"{field}: {msg}" if field != "body" else msg
    else:
        clean_msg = "Invalid data provided."

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": clean_msg},
    )

# Global catch-all for unexpected 500 errors
@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    """
    Catches any unhandled exceptions to prevent the server from crashing
    and returns a standard JSON error response instead of HTML/text.
    """
    # In production, you would log `exc` to a monitoring system here
    print(f"Unhandled Exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected internal server error occurred."},
    )
