"""
Civic Connect - Main FastAPI Application
A platform for citizens to report civic issues and track their resolution
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection, database
from app.api.v1.api import api_router
from app.core.exceptions import add_exception_handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    try:
        await connect_to_mongo()
    except Exception as e:
        print(f"Warning: Could not connect to MongoDB: {e}")
        print("App will continue without database connection")
    yield
    # Shutdown
    try:
        await close_mongo_connection()
    except Exception as e:
        print(f"Warning: Error closing MongoDB connection: {e}")


# Create FastAPI application
app = FastAPI(
    title="Civic Connect API",
    description="A platform for citizens to report civic issues and track their resolution",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware (more permissive for development)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Allow all hosts for development
)

# Add exception handlers
add_exception_handlers(app)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "🏛️ Civic Connect API is running!",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "healthy",
        "database": "connected" if database is not None else "not configured"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "message": "API is running",
        "database": "connected" if database is not None else "not configured"
    }


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
