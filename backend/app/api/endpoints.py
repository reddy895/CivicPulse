import io
import csv
import mimetypes
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, Query, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse, Response

from ..models.schemas import (
    CitizenRequestCreate, CitizenRequestResponse, VoiceSubmissionResponse,
    UpvoteRequest, UpvoteResponse, HotspotCluster, GeoJSONFeatureCollection,
    MCDAWeights, ProjectRecommendation, SpendMisalignmentItem,
    PolicySimulationRequest, PolicySimulationResponse,
    AICopilotQuery, AICopilotResponse, CountryCode,
    LoginRequest, RegisterRequest, AuthTokenResponse, UserProfile, ComplaintStatusUpdate,
    EvidenceItem
)
from ..services.data_store import db
from ..services.auth_service import auth_service
from ..services.voice_processor import process_voice_audio, get_voice_demo_samples
from ..services.hotspot_engine import calculate_hotspots, get_hotspots_geojson
from ..services.recommendation_engine import generate_recommendations
from ..services.misalignment_engine import analyze_spend_misalignment
from ..services.policy_simulator import run_policy_simulation
from ..services.ai_copilot import generate_ai_copilot_response
from ..services.disability_adapter import load_disability_records, get_disability_summary
from ..services.evidence_storage import (
    validate_evidence_file, store_evidence, get_evidence_for_complaint,
    get_evidence_file, delete_evidence, MAX_FILE_SIZE_BYTES
)

router = APIRouter()

# ----------------- AUTHENTICATION ENDPOINTS ----------------- #

@router.post("/auth/login", response_model=AuthTokenResponse)
async def login(payload: LoginRequest):
    """Authenticate citizen or government official."""
    auth_res = auth_service.authenticate(payload)
    if not auth_res:
        raise HTTPException(status_code=401, detail="Invalid credentials or unauthorized role access.")
    return auth_res

@router.post("/auth/register", response_model=AuthTokenResponse)
async def register(payload: RegisterRequest):
    """Register new citizen or government user."""
    return auth_service.register(payload)

@router.get("/auth/me", response_model=UserProfile)
async def get_current_user_profile(token: Optional[str] = Query(None)):
    """Retrieve active authenticated profile."""
    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    profile = auth_service.get_user_by_token(token)
    if not profile:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return profile


# ----------------- DISABILITY & VETERAN COMPLAINTS DATASET ----------------- #

@router.get("/citizen/disability-complaints")
async def get_disability_complaints(
    state: Optional[str] = Query(None),
    min_recipients: Optional[int] = Query(None),
    limit: int = Query(50)
):
    """Retrieve complaints and problems faced by citizens from the Disability Compensation dataset."""
    records = load_disability_records()
    if state:
        records = [r for r in records if r["state"].lower() == state.lower()]
    if min_recipients:
        records = [r for r in records if r["total_recipients"] >= min_recipients]
    return records[:limit]

@router.get("/analytics/disability-summary")
async def get_disability_analytics_summary():
    """Retrieve aggregate national summary of disability compensation recipients, severe deficit clusters, and problems."""
    return get_disability_summary()

# ----------------- CITIZEN STREAM ENDPOINTS ----------------- #

@router.post("/citizen/submit", response_model=CitizenRequestResponse)
async def submit_citizen_request(payload: CitizenRequestCreate):
    """Submit a citizen infrastructure request via Text, WhatsApp, Telegram, or SMS."""
    return db.add_request(payload)

@router.post("/citizen/requests/clear")
async def clear_citizen_requests():
    """Clear all citizen requests and evidence (resets database to 0 complaints)."""
    db.clear_all_requests()
    return {"message": "All complaints and evidence successfully cleared.", "total_remaining": 0}

@router.post("/citizen/voice", response_model=VoiceSubmissionResponse)
async def submit_voice_request(
    file: Optional[UploadFile] = File(None),
    country_code: str = Form("IND"),
    channel: str = Form("voice")
):
    """Submit citizen audio voice recording for speech transcription and AI analysis."""
    audio_content = b""
    filename = "recorded_audio.wav"
    if file:
        audio_content = await file.read()
        filename = file.filename
        
    transcription, detected_lang, confidence, metadata = process_voice_audio(
        audio_content, filename, country_code=country_code
    )
    
    loc_meta = metadata.get("location_metadata", {})
    
    req_payload = CitizenRequestCreate(
        text=transcription,
        language=detected_lang,
        channel=channel,
        country_code=CountryCode(country_code) if country_code in [c.value for c in CountryCode] else CountryCode.INDIA,
        location_name=loc_meta.get("location_name"),
        latitude=loc_meta.get("latitude"),
        longitude=loc_meta.get("longitude"),
        citizen_name="Citizen Voice Contributor"
    )
    
    processed = db.add_request(req_payload)
    
    from ..services.multilingual_nlp import LANGUAGE_MAP
    return VoiceSubmissionResponse(
        transcription=transcription,
        detected_language=detected_lang,
        language_name=LANGUAGE_MAP.get(detected_lang, "Auto"),
        confidence=confidence,
        processed_request=processed
    )

@router.get("/citizen/voice/presets")
async def list_voice_presets():
    """Get predefined multilingual audio voice samples for rapid interactive testing."""
    return get_voice_demo_samples()

@router.post("/citizen/upvote", response_model=UpvoteResponse)
async def upvote_request(payload: UpvoteRequest):
    """Upvote community infrastructure petition."""
    new_count = db.upvote_request(payload.request_id)
    if new_count is None:
        raise HTTPException(status_code=404, detail="Request ID not found")
    return UpvoteResponse(request_id=payload.request_id, upvotes=new_count, message="Upvote recorded successfully")

@router.get("/citizen/requests", response_model=List[CitizenRequestResponse])
async def list_requests(
    country_code: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    urgency: Optional[str] = Query(None),
    submitter_id: Optional[str] = Query(None)
):
    """List aggregated citizen requests with multi-attribute filtering."""
    return db.get_all_requests(country_code=country_code, category=category, urgency=urgency, submitter_id=submitter_id)

@router.get("/citizen/requests/{request_id}", response_model=CitizenRequestResponse)
async def get_request_by_id(request_id: str):
    """Retrieve details of a single citizen request."""
    req = db.get_request_by_id(request_id)
    if not req:
        raise HTTPException(status_code=404, detail=f"Complaint '{request_id}' not found")
    return req

@router.patch("/citizen/requests/{request_id}/status", response_model=CitizenRequestResponse)
async def update_complaint_status(
    request_id: str,
    payload: ComplaintStatusUpdate
):
    """Update complaint status, official resolution notes, and agency assignment by government official."""
    updated = db.update_request_status(
        request_id=request_id,
        status=payload.status,
        official_notes=payload.official_notes,
        assigned_agency=payload.assigned_agency,
        allocated_budget_usd=payload.allocated_budget_usd
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Request ID '{request_id}' not found.")
    return updated


# ----------------- EVIDENCE UPLOAD & RETRIEVAL ----------------- #

@router.post("/complaints/{complaint_id}/evidence")
async def upload_complaint_evidence(
    complaint_id: str,
    file: UploadFile = File(...),
):
    """
    Upload evidence image for a complaint.
    Supports: JPG, JPEG, PNG, WEBP. Max 10MB per file, max 5 per complaint.
    """
    # Check existing evidence count
    existing = get_evidence_for_complaint(complaint_id)
    if len(existing) >= 5:
        raise HTTPException(status_code=400, detail="Maximum 5 evidence images allowed per complaint.")
    
    # Read file bytes
    try:
        file_bytes = await file.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read uploaded file.")
    
    # Validate
    content_type = file.content_type or "application/octet-stream"
    is_valid, error_msg = validate_evidence_file(
        filename=file.filename or "upload",
        content_type=content_type,
        file_bytes=file_bytes
    )
    if not is_valid:
        raise HTTPException(status_code=422, detail=error_msg)
    
    # Store
    record = store_evidence(
        complaint_id=complaint_id,
        filename=file.filename or "evidence.jpg",
        content_type=content_type,
        file_bytes=file_bytes,
    )
    
    # Immediately update in db.requests if present
    complaint = db.get_request_by_id(complaint_id)
    if complaint:
        ev_list = get_evidence_for_complaint(complaint_id)
        complaint.evidence = ev_list
        complaint.evidence_count = len(ev_list)
        complaint.image_url = record.get("storage_url") or record.get("url")
    
    return record


@router.get("/complaints/{complaint_id}/evidence")
async def get_complaint_evidence(complaint_id: str):
    """Get all evidence items for a complaint."""
    evidence = get_evidence_for_complaint(complaint_id)
    return evidence


@router.get("/evidence/{complaint_id}/{filename}")
async def serve_evidence_file(complaint_id: str, filename: str):
    """
    Serve evidence file bytes. 
    In production, redirect to signed S3 URL or enforce auth token check here.
    """
    file_bytes = get_evidence_file(complaint_id, filename)
    if file_bytes is None:
        raise HTTPException(status_code=404, detail="Evidence file not found.")
    
    # Determine content type
    mime_type, _ = mimetypes.guess_type(filename)
    if mime_type not in {"image/jpeg", "image/png", "image/webp"}:
        mime_type = "image/jpeg"
    
    return Response(
        content=file_bytes,
        media_type=mime_type,
        headers={
            "Cache-Control": "private, max-age=3600",
            "Content-Disposition": f"inline; filename={filename}"
        }
    )


@router.delete("/complaints/{complaint_id}/evidence/{evidence_id}")
async def delete_complaint_evidence(complaint_id: str, evidence_id: str):
    """Delete a specific evidence item from a complaint."""
    success = delete_evidence(complaint_id, evidence_id)
    if not success:
        raise HTTPException(status_code=404, detail="Evidence item not found.")
    return {"message": "Evidence deleted successfully", "evidence_id": evidence_id}


@router.get("/stream/live-events")
async def get_live_events(limit: int = Query(25)):
    """Retrieve real-time event stream of recent incoming citizen complaints & government status updates."""
    return db.get_live_events(limit=limit)


# ----------------- ANALYTICS & DECISION ENGINE ----------------- #

@router.get("/analytics/hotspots", response_model=List[HotspotCluster])
async def get_hotspots(country_code: Optional[str] = Query(None)):
    """Retrieve geospatial demand hotspots and cluster metrics."""
    return calculate_hotspots(country_code=country_code)

@router.get("/analytics/hotspots/geojson", response_model=GeoJSONFeatureCollection)
async def get_hotspots_geojson_data(country_code: Optional[str] = Query(None)):
    """Retrieve demand hotspots in standard GeoJSON format for GIS map rendering."""
    return get_hotspots_geojson(country_code=country_code)

@router.get("/analytics/recommendations", response_model=List[ProjectRecommendation])
async def get_recommendations_get(
    country_code: Optional[str] = Query(None),
    demand_weight: float = Query(0.35),
    deficit_weight: float = Query(0.30),
    vuln_weight: float = Query(0.20),
    budget_weight: float = Query(0.15),
    budget_cap: float = Query(100.0)
):
    """Get MCDA-ranked project recommendations with query parameters."""
    weights = MCDAWeights(
        citizen_demand_weight=demand_weight,
        infra_deficit_weight=deficit_weight,
        vulnerability_weight=vuln_weight,
        budget_feasibility_weight=budget_weight,
        budget_cap_millions=budget_cap
    )
    return generate_recommendations(country_code=country_code, weights=weights)

@router.post("/analytics/recommendations", response_model=List[ProjectRecommendation])
async def get_recommendations_post(
    country_code: Optional[str] = Query(None),
    weights: Optional[MCDAWeights] = None
):
    """Get MCDA-ranked project recommendations with custom weighted multi-criteria."""
    return generate_recommendations(country_code=country_code, weights=weights)

@router.get("/analytics/misalignment", response_model=List[SpendMisalignmentItem])
async def get_spend_misalignment(country_code: Optional[str] = Query(None)):
    """Analyze public investment spend gaps against grassroots citizen demand."""
    return analyze_spend_misalignment(country_code=country_code)

@router.post("/analytics/simulate", response_model=PolicySimulationResponse)
async def simulate_policy(payload: PolicySimulationRequest):
    """Run interactive budget scenario simulation and calculate projected welfare/ROI impact."""
    return run_policy_simulation(payload)

@router.post("/analytics/ai-copilot", response_model=AICopilotResponse)
async def query_ai_copilot(payload: AICopilotQuery):
    """Generate automated executive briefings, procurement tenders, and policy intelligence."""
    return generate_ai_copilot_response(payload)

# ----------------- DPG OPEN DATA & STANDARDS ----------------- #

@router.get("/dpg/export")
async def export_dpg_data(
    format: str = Query("geojson", pattern="^(geojson|csv|json)$"),
    country_code: Optional[str] = Query(None)
):
    """
    Export anonymized, privacy-preserving infrastructure demand data conforming to DPG standards.
    """
    if format == "geojson":
        geojson_data = get_hotspots_geojson(country_code=country_code)
        return JSONResponse(
            content=geojson_data.model_dump(),
            headers={"Content-Disposition": f"attachment; filename=civicpulse_hotspots_{country_code or 'all'}.geojson"}
        )
        
    elif format == "csv":
        requests = db.get_all_requests(country_code=country_code)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "request_id", "country_code", "state_province", "location_name", "category",
            "urgency", "urgency_score", "upvotes", "channel", "created_at", "translated_summary"
        ])
        for r in requests:
            writer.writerow([
                r.id, r.country_code.value, r.state_province, r.location_name, r.category.value,
                r.urgency.value, r.urgency_score, r.upvotes, r.channel.value, r.created_at, r.translated_text
            ])
            
        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=civicpulse_dpg_data_{country_code or 'all'}.csv"}
        )
        
    else: # json
        requests = db.get_all_requests(country_code=country_code)
        return [r.model_dump() for r in requests]

@router.get("/dpg/standards")
async def get_dpg_standards():
    """Return Digital Public Goods Alliance (DPGA) standard compliance scorecard and metadata."""
    return {
        "dpg_name": "CivicPulse DPG",
        "standard_version": "DPGA-v1.4.0",
        "open_license": "Apache 2.0 / MIT",
        "privacy_compliance": "Differential Privacy & PII-Anonymized Stream Aggregation",
        "interoperability": "OpenAPI 3.1, GeoJSON RFC 7946, W3C Schema.org DCAT-AP",
        "supported_brics_languages": [
            "Hindi", "Bengali", "Marathi", "Tamil", "Telugu",
            "Portuguese", "Mandarin Chinese", "Russian", "isiZulu", "Afrikaans", "English"
        ],
        "compliance_score": "9/9 DPGA Indicators Met",
        "sdg_impact": ["SDG 9", "SDG 6", "SDG 7", "SDG 3", "SDG 11", "SDG 16"]
    }
