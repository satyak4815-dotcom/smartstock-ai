"""
SmartStock AI - Backend Main Entrypoint
FastAPI Application serving API endpoints and static React frontend bundle.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from backend.api.routes import router as api_router

app = FastAPI(
    title="SmartStock AI - Recommendation Smart Inventory Management Platform",
    description="CCSAI0301 Artificial Intelligence Course Project (NIET Greater Noida, Team 80)",
    version="2.0.0"
)

# CORS middleware for development flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API router
app.include_router(api_router, prefix="/api")

# Serve frontend build if present
dist_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Allow /api to pass through
        if full_path.startswith("api"):
            return None
        file_path = os.path.join(dist_path, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_path, "index.html"))
else:
    @app.get("/")
    def index():
        return {
            "message": "SmartStock AI Backend running. Frontend build not yet generated. Access API documentation at /docs."
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
