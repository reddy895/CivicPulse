# SPDX-License-Identifier: AGPL-3.0-or-later OR Apache-2.0
# Copyright (C) 2026 Praveen Reddy. All rights reserved.
# CivicPulse DPG - Multilingual AI Citizen Infrastructure Alignment Platform

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import router as api_router

app = FastAPI(
    title="CivicPulse DPG - Multilingual AI Infrastructure Alignment Platform",
    description=(
        "A Digital Public Good (DPG) connecting citizen grassroots development requests with national "
        "infrastructure priorities across BRICS nations using Multilingual AI, Geospatial Clustering, "
        "and Multi-Criteria Decision Intelligence. Authored by Praveen Reddy."
    ),
    version="1.0.0",
    license_info={
        "name": "GNU AGPLv3 / Apache 2.0 (Dual Licensed)",
        "url": "https://www.gnu.org/licenses/agpl-3.0.html",
    },
    contact={
        "name": "Praveen Reddy",
        "url": "https://github.com/reddy895/CivicPulse",
    },
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router under /api and root fallback
app.include_router(api_router, prefix="/api")
app.include_router(api_router)

@app.get("/")
async def root():
    return {
        "name": "CivicPulse DPG Core Engine",
        "status": "Online",
        "docs": "/docs",
        "standards": "/api/dpg/standards"
    }

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CivicPulse DPG Backend",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
