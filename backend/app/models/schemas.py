from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class CountryCode(str, Enum):
    INDIA = "IND"
    BRAZIL = "BRA"
    SOUTH_AFRICA = "ZAF"
    CHINA = "CHN"
    RUSSIA = "RUS"
    USA = "USA"
    ALL = "ALL"

class InfrastructureCategory(str, Enum):
    WATER_SANITATION = "Water & Sanitation"
    ROADS_TRANSPORT = "Roads & Public Transport"
    CLEAN_ENERGY = "Clean Energy & Grid"
    HEALTHCARE = "Healthcare & Clinics"
    DIGITAL_CONNECTIVITY = "Digital Public Infrastructure"
    EDUCATION = "Education & Schools"
    FLOOD_CLIMATE = "Flood & Climate Resilience"

class UrgencyLevel(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class SubmissionChannel(str, Enum):
    VOICE = "voice"
    TEXT = "text"
    WHATSAPP = "whatsapp"
    TELEGRAM = "telegram"
    SMS = "sms"

class UserRole(str, Enum):
    CITIZEN = "citizen"
    GOVERNMENT = "government"

class LoginRequest(BaseModel):
    email_or_username: str
    password: str
    role: Optional[UserRole] = None

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole = UserRole.CITIZEN
    country_code: CountryCode = CountryCode.INDIA
    district: Optional[str] = "Central District"
    department: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    country_code: str
    country_name: str
    district: Optional[str] = None
    department: Optional[str] = None
    clearance_level: Optional[str] = None
    avatar_url: Optional[str] = None

class AuthTokenResponse(BaseModel):
    token: str
    token_type: str = "Bearer"
    user: UserProfile

class ComplaintStatusUpdate(BaseModel):
    status: str
    official_notes: Optional[str] = None
    allocated_budget_usd: Optional[float] = None
    assigned_agency: Optional[str] = None

class CitizenRequestCreate(BaseModel):
    text: str = Field(..., description="Original citizen request text or voice transcription")
    language: Optional[str] = Field("auto", description="Source language code (e.g., 'hi', 'pt', 'zh', 'ru', 'zu', 'en')")
    channel: SubmissionChannel = Field(SubmissionChannel.TEXT, description="Input channel")
    country_code: CountryCode = Field(CountryCode.INDIA, description="Target nation code")
    location_name: Optional[str] = Field(None, description="Reported location/district/village")
    latitude: Optional[float] = Field(None, description="GPS latitude if available")
    longitude: Optional[float] = Field(None, description="GPS longitude if available")
    citizen_name: Optional[str] = Field("Anonymous Citizen", description="Citizen name (anonymized in DPG mode)")
    submitter_id: Optional[str] = Field(None, description="User ID of authenticated citizen")
    submitter_email: Optional[str] = Field(None, description="Email of authenticated citizen")
    contact_hash: Optional[str] = Field(None, description="Anonymized contact hash for status updates")

class EvidenceItem(BaseModel):
    id: str
    complaint_id: str
    filename: str
    original_filename: str
    file_type: str
    file_size_bytes: int
    storage_url: str
    upload_timestamp: str
    width: Optional[int] = None
    height: Optional[int] = None

class CitizenRequestResponse(BaseModel):
    id: str
    original_text: str
    translated_text: str
    language: str
    language_name: str
    channel: SubmissionChannel
    country_code: CountryCode
    country_name: str
    category: InfrastructureCategory
    urgency: UrgencyLevel
    urgency_score: float
    sentiment_score: float
    location_name: str
    state_province: str
    latitude: float
    longitude: float
    upvotes: int
    status: str
    resolution_stage: Optional[str] = "Pending Review"
    official_notes: Optional[str] = None
    submitter_id: Optional[str] = None
    submitter_name: Optional[str] = None
    created_at: str
    extracted_entities: Dict[str, Any]
    evidence_count: Optional[int] = 0
    evidence: Optional[List["EvidenceItem"]] = []

class LiveGrievanceEvent(BaseModel):
    event_type: str = "NEW_COMPLAINT"
    timestamp: str
    request: CitizenRequestResponse
    message: str

class UpvoteRequest(BaseModel):
    request_id: str

class UpvoteResponse(BaseModel):
    request_id: str
    upvotes: int
    message: str

class VoiceSubmissionResponse(BaseModel):
    transcription: str
    detected_language: str
    language_name: str
    confidence: float
    processed_request: CitizenRequestResponse

class HotspotCluster(BaseModel):
    id: str
    cluster_name: str
    country_code: str
    state_province: str
    latitude: float
    longitude: float
    radius_km: float
    request_count: int
    top_category: str
    avg_urgency_score: float
    vulnerability_index: float
    infrastructure_deficit_index: float
    priority_level: str
    estimated_affected_population: int
    sample_requests: List[str]

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]

class MCDAWeights(BaseModel):
    citizen_demand_weight: float = Field(0.35, ge=0.0, le=1.0)
    infra_deficit_weight: float = Field(0.30, ge=0.0, le=1.0)
    vulnerability_weight: float = Field(0.20, ge=0.0, le=1.0)
    budget_feasibility_weight: float = Field(0.15, ge=0.0, le=1.0)
    budget_cap_millions: Optional[float] = Field(100.0, description="Budget cap in Millions USD")

class ProjectRecommendation(BaseModel):
    id: str
    title: str
    country_code: str
    country_name: str
    state_province: str
    district: str
    category: str
    latitude: float
    longitude: float
    priority_rank: int
    mcda_score: float
    citizen_demand_score: float
    infra_deficit_score: float
    vulnerability_score: float
    cost_feasibility_score: float
    estimated_cost_usd_m: float
    projected_beneficiaries: int
    estimated_completion_months: int
    projected_social_roi_ratio: float
    urgency_tier: str
    key_problem_summary: str
    proposed_solution: str
    sdg_alignment: List[str]
    supporting_citizen_request_count: int

class SpendMisalignmentItem(BaseModel):
    id: str
    region_name: str
    country_code: str
    category: str
    citizen_demand_index: float
    infrastructure_deficit_score: float
    current_budget_allocated_m: float
    recommended_budget_m: float
    spend_gap_m: float
    alignment_status: str  # "Severe Deficit / Ignored Hotspot", "Moderate Deficit", "Well Balanced", "Overfunded / Low Demand"
    action_recommendation: str

class PolicySimulationRequest(BaseModel):
    country_code: CountryCode = CountryCode.INDIA
    total_budget_m: float = 250.0
    sector_allocations: Dict[str, float] = Field(
        default_factory=lambda: {
            "Water & Sanitation": 25.0,
            "Roads & Public Transport": 25.0,
            "Clean Energy & Grid": 15.0,
            "Healthcare & Clinics": 15.0,
            "Digital Public Infrastructure": 10.0,
            "Education & Schools": 5.0,
            "Flood & Climate Resilience": 5.0
        }
    )
    equity_focus_multiplier: float = 1.2  # 1.0 = neutral, 1.5 = heavy rural/vulnerability bias

class PolicySimulationResponse(BaseModel):
    total_budget_allocated_m: float
    projected_total_beneficiaries: int
    projected_citizen_satisfaction_score: float
    projected_infrastructure_deficit_reduction_pct: float
    brics_sdg_progress_index: float
    sector_impacts: List[Dict[str, Any]]
    unmet_demand_hotspots_count: int
    economic_multiplier_estimated: float
    executive_summary: str

class AICopilotQuery(BaseModel):
    query: str
    country_code: Optional[str] = "IND"
    language: Optional[str] = "en"
    context_type: Optional[str] = "general"  # "brief", "tender", "citizen_response", "general"

class AICopilotResponse(BaseModel):
    query: str
    answer: str
    generated_brief: Optional[str] = None
    action_items: List[str]
    citations: List[Dict[str, Any]]
    generated_at: str
