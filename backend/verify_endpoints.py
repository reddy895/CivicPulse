import urllib.request
import json
import sys

def test(url, data=None):
    req = urllib.request.Request(
        url,
        headers={'Content-Type': 'application/json'} if data else {},
        data=json.dumps(data).encode('utf-8') if data else None
    )
    with urllib.request.urlopen(req) as res:
        return res.getcode(), res.read().decode('utf-8')

try:
    print("1. Testing Frontend HTML...")
    code, html = test("http://localhost:5173")
    print(f"   [OK] Frontend status: {code}, length: {len(html)}")

    print("2. Testing Citizen Requests Listing...")
    code, text = test("http://localhost:8000/api/citizen/requests")
    reqs = json.loads(text)
    print(f"   [OK] Aggregated requests count: {len(reqs)}")

    print("3. Testing Hindi Citizen Submission...")
    code, text = test("http://localhost:8000/api/citizen/submit", {
        "text": "हमारे ब्लॉक 4 में पीने के पानी की मुख्य पाइपलाइन टूट गई है, 500 घरों में पानी नहीं आ रहा है।",
        "country_code": "IND",
        "channel": "whatsapp"
    })
    sub = json.loads(text)
    print(f"   [OK] Category classified: {sub['category']}, Language: {sub['language_name']}, Urgency: {sub['urgency']}")

    print("4. Testing Hotspot Clustering & GIS...")
    code, text = test("http://localhost:8000/api/analytics/hotspots?country_code=IND")
    hotspots = json.loads(text)
    print(f"   [OK] Hotspots count: {len(hotspots)}, Top Hotspot: {hotspots[0]['cluster_name']}")

    print("5. Testing GeoJSON Export Format...")
    code, text = test("http://localhost:8000/api/analytics/hotspots/geojson?country_code=IND")
    geojson = json.loads(text)
    print(f"   [OK] GeoJSON type: {geojson['type']}, features count: {len(geojson['features'])}")

    print("6. Testing AI MCDA Project Recommendations...")
    code, text = test("http://localhost:8000/api/analytics/recommendations?country_code=IND")
    recs = json.loads(text)
    print(f"   [OK] Top Recommendation: {recs[0]['title']} (Score: {recs[0]['mcda_score']}, ROI: {recs[0]['projected_social_roi_ratio']}x)")

    print("7. Testing Spend Misalignment Matrix...")
    code, text = test("http://localhost:8000/api/analytics/misalignment?country_code=IND")
    gaps = json.loads(text)
    print(f"   [OK] Misalignment gaps detected: {len(gaps)}, Critical Gap: {gaps[0]['region_name']} (Shortfall: ${gaps[0]['spend_gap_m']}M)")

    print("8. Testing Policy Scenario Simulator...")
    code, text = test("http://localhost:8000/api/analytics/simulate", {
        "country_code": "IND",
        "total_budget_m": 150.0,
        "sector_allocations": {
            "Water & Sanitation": 40.0,
            "Roads & Public Transport": 40.0,
            "Healthcare & Clinics": 40.0,
            "Clean Energy & Grid": 30.0
        },
        "equity_focus_multiplier": 1.35
    })
    sim = json.loads(text)
    print(f"   [OK] Projected Beneficiaries: {sim['projected_total_beneficiaries']:,}, Economic Multiplier: {sim['economic_multiplier_estimated']}x")

    print("9. Testing AI Copilot Executive Briefing Generation...")
    code, text = test("http://localhost:8000/api/analytics/ai-copilot", {
        "query": "Draft executive brief for national public infrastructure prioritization",
        "country_code": "IND",
        "context_type": "brief"
    })
    copilot = json.loads(text)
    print(f"   [OK] AI Brief generated successfully (Length: {len(copilot['generated_brief'])} chars)")

    print("10. Testing DPG Standards & Verification...")
    code, text = test("http://localhost:8000/api/dpg/standards")
    dpg = json.loads(text)
    print(f"   [OK] DPG Certification: {dpg['compliance_score']}")

    print("\n>>> ALL 10 INTEGRATION TESTS COMPLETED SUCCESSFULLY! <<<")
except Exception as e:
    print(f"Error during verification: {e}")
    sys.exit(1)
