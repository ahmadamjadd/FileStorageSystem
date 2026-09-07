from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

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
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
