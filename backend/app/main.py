from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import api_router

app = FastAPI(
    title="RADIX Talent Match Platform API",
    description="Python FastAPI backend foundation for SVCE Placement Intelligence Hub & RADIX Talent Match Platform",
    version="1.0.0",
)

# Configure CORS for local frontend communication
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint to verify backend service readiness.
    """
    return {"status": "ok"}


# Mount all RADIX API module routers
app.include_router(api_router)
