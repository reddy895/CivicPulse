# SPDX-License-Identifier: AGPL-3.0-or-later OR Apache-2.0
# Copyright (C) 2026 Praveen Reddy. All rights reserved.
# CivicPulse DPG - Multilingual AI Citizen Infrastructure Alignment Platform

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from .api.endpoints import router as api_router


allowed_origins = [
    origin.strip()
    for origin in os.getenv("CIVICPULSE_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]
production = os.getenv("CIVICPULSE_ENV", "development").lower() == "production"
if production and (not allowed_origins or "*" in allowed_origins):
    raise RuntimeError("Production requires explicit CIVICPULSE_ALLOWED_ORIGINS; wildcard origins are not allowed.")

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
    docs_url=None if production else "/docs",
    redoc_url=None if production else "/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        if production:
            response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        return response


app.add_middleware(SecurityHeadersMiddleware)

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
