import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.multilingual_nlp import detect_language, classify_infrastructure_category, evaluate_urgency
from app.models.schemas import InfrastructureCategory, UrgencyLevel

client = TestClient(app)

def test_root_and_health():
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "Online"
    
    h_resp = client.get("/health")
    assert h_resp.status_code == 200
    assert h_resp.json()["status"] == "healthy"

def test_multilingual_nlp():
    # Hindi water test
    hindi_text = "हमारे गांव में पानी की पाइपलाइन टूट गई है और पीने का पानी नहीं आ रहा है।"
    lang_code, lang_name = detect_language(hindi_text)
    assert lang_code == "hi"
    cat = classify_infrastructure_category(hindi_text, "water pipeline broken")
    assert cat == InfrastructureCategory.WATER_SANITATION

    # Portuguese road test
    pt_text = "A estrada vicinal de acesso aos agricultores está cheia de buracos e a ponte caiu."
    lang_code_pt, _ = detect_language(pt_text)
    assert lang_code_pt == "pt"
    cat_pt = classify_infrastructure_category(pt_text, "road full of potholes and bridge fell")
    assert cat_pt == InfrastructureCategory.ROADS_TRANSPORT

    # Urgency test
    urgency, score = evaluate_urgency("Urgent crisis: 500 households without drinking water for 5 days!", "")
    assert urgency in [UrgencyLevel.HIGH, UrgencyLevel.CRITICAL]
    assert score >= 0.55

def test_citizen_submit_and_upvote():
    payload = {
        "text": "The local primary clinic in Varanasi has no electricity backup for pediatric vaccine storage.",
        "country_code": "IND",
        "channel": "text"
    }
    resp = client.post("/api/citizen/submit", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["category"] in [InfrastructureCategory.HEALTHCARE.value, InfrastructureCategory.CLEAN_ENERGY.value]
    assert data["upvotes"] == 1
    req_id = data["id"]
    
    # Test upvote
    up_resp = client.post("/api/citizen/upvote", json={"request_id": req_id})
    assert up_resp.status_code == 200
    assert up_resp.json()["upvotes"] == 2

def test_analytics_endpoints():
    # Hotspots
    h_resp = client.get("/api/analytics/hotspots?country_code=IND")
    assert h_resp.status_code == 200
    hotspots = h_resp.json()
    assert len(hotspots) > 0
    assert "cluster_name" in hotspots[0]
    
    # GeoJSON
    geo_resp = client.get("/api/analytics/hotspots/geojson?country_code=IND")
    assert geo_resp.status_code == 200
    geo_data = geo_resp.json()
    assert geo_data["type"] == "FeatureCollection"
    assert len(geo_data["features"]) > 0

    # Recommendations
    rec_resp = client.get("/api/analytics/recommendations?country_code=IND")
    assert rec_resp.status_code == 200
    recs = rec_resp.json()
    assert len(recs) > 0
    assert recs[0]["priority_rank"] == 1
    assert recs[0]["mcda_score"] >= recs[-1]["mcda_score"]

    # Misalignment
    gap_resp = client.get("/api/analytics/misalignment?country_code=IND")
    assert gap_resp.status_code == 200
    gaps = gap_resp.json()
    assert len(gaps) > 0

def test_simulation_and_copilot():
    # Simulation
    sim_payload = {
        "country_code": "IND",
        "total_budget_m": 150.0,
        "sector_allocations": {
            "Water & Sanitation": 50.0,
            "Roads & Public Transport": 50.0,
            "Healthcare & Clinics": 30.0,
            "Clean Energy & Grid": 20.0
        },
        "equity_focus_multiplier": 1.2
    }
    sim_resp = client.post("/api/analytics/simulate", json=sim_payload)
    assert sim_resp.status_code == 200
    sim_data = sim_resp.json()
    assert sim_data["projected_total_beneficiaries"] > 0
    assert sim_data["economic_multiplier_estimated"] > 2.0

    # AI Copilot
    copilot_payload = {
        "query": "Draft executive brief for national public infrastructure prioritization",
        "country_code": "IND",
        "context_type": "brief"
    }
    copilot_resp = client.post("/api/analytics/ai-copilot", json=copilot_payload)
    assert copilot_resp.status_code == 200
    cp_data = copilot_resp.json()
    assert cp_data["generated_brief"] is not None

def test_dpg_standards():
    resp = client.get("/api/dpg/standards")
    assert resp.status_code == 200
    data = resp.json()
    assert "DPGA" in data["standard_version"]
    assert "9/9" in data["compliance_score"]

def test_disability_dataset_endpoints():
    summary_resp = client.get("/api/analytics/disability-summary")
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["total_recipients"] > 100000
    assert len(summary["top_states"]) > 0

    complaints_resp = client.get("/api/citizen/disability-complaints?limit=10")
    assert complaints_resp.status_code == 200
    complaints = complaints_resp.json()
    assert len(complaints) > 0
    assert "county_name" in complaints[0]
    assert len(complaints[0]["complaints"]) > 0

    # Test CSV export
    csv_resp = client.get("/api/dpg/export?format=csv&country_code=IND")
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["content-type"]

def test_authentication():
    # Test Citizen Demo Login
    cit_resp = client.post("/api/auth/login", json={
        "email_or_username": "citizen.india@civicpulse.org",
        "password": "citizen123",
        "role": "citizen"
    })
    assert cit_resp.status_code == 200
    cit_data = cit_resp.json()
    assert cit_data["user"]["role"] == "citizen"
    assert cit_data["token"] is not None

    # Test Gov Official Login
    gov_resp = client.post("/api/auth/login", json={
        "email_or_username": "director.infra@gov.in",
        "password": "admin123",
        "role": "government"
    })
    assert gov_resp.status_code == 200
    gov_data = gov_resp.json()
    assert gov_data["user"]["role"] == "government"
    
    # Test Auth Me
    token = gov_data["token"]
    me_resp = client.get(f"/api/auth/me?token={token}")
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "director.infra@gov.in"

def test_status_update_and_live_stream():
    # Submit request
    submit_payload = {
        "text": "Bridge support collapse risk near river crossing in Bihar.",
        "country_code": "IND",
        "channel": "text",
        "latitude": 26.0903,
        "longitude": 87.9405
    }
    sub_resp = client.post("/api/citizen/submit", json=submit_payload)
    assert sub_resp.status_code == 200
    req_data = sub_resp.json()
    req_id = req_data["id"]

    # Update status by government
    patch_resp = client.patch(f"/api/citizen/requests/{req_id}/status", json={
        "status": "Work Order Dispatched",
        "official_notes": "Structural engineering inspection team dispatched to site.",
        "assigned_agency": "State Highway & Infrastructure Dept"
    })
    assert patch_resp.status_code == 200
    updated = patch_resp.json()
    assert updated["resolution_stage"] == "Work Order Dispatched"
    assert updated["official_notes"] is not None

    # Verify live events stream contains the event
    stream_resp = client.get("/api/stream/live-events?limit=5")
    assert stream_resp.status_code == 200
    events = stream_resp.json()
    assert len(events) > 0
    assert events[0]["event_type"] in ["NEW_COMPLAINT", "STATUS_UPDATE"]

