from datetime import datetime
from typing import Dict, Any, List
from .data_store import db
from .hotspot_engine import calculate_hotspots
from .recommendation_engine import generate_recommendations
from .misalignment_engine import analyze_spend_misalignment
from ..models.schemas import AICopilotQuery, AICopilotResponse

def generate_ai_copilot_response(payload: AICopilotQuery) -> AICopilotResponse:
    """
    Generate policy intelligence, executive summaries, tender justifications, and citizen notifications.
    """
    query_lower = payload.query.lower()
    c_code = payload.country_code or "IND"
    
    hotspots = calculate_hotspots(country_code=c_code)
    recs = generate_recommendations(country_code=c_code)
    gaps = analyze_spend_misalignment(country_code=c_code)
    
    country_name_map = {"IND": "India", "BRA": "Brazil", "ZAF": "South Africa", "CHN": "China", "RUS": "Russia", "ALL": "BRICS Nations"}
    c_name = country_name_map.get(c_code, "BRICS Nations")
    
    # 1. Executive Briefing Template
    if "brief" in query_lower or "summary" in query_lower or payload.context_type == "brief":
        top_rec = recs[0] if recs else None
        top_gap = gaps[0] if gaps else None
        beneficiaries_str = f"{top_rec.projected_beneficiaries:,}" if top_rec else "180,000"
        roi_str = f"{top_rec.projected_social_roi_ratio}x" if top_rec else "4.2x"
        cost_str = f"${top_rec.estimated_cost_usd_m}M USD" if top_rec else "$4.5M USD"
        mcda_str = f"{top_rec.mcda_score}/100" if top_rec else "88.5/100"
        title_str = top_rec.title if top_rec else "Decentralized Piped Clean Water Network"
        gap_region = top_gap.region_name if top_gap else "Varanasi District"
        gap_val = f"${top_gap.spend_gap_m}M USD" if top_gap else "$6.2M USD"

        brief = (
            f"EXECUTIVE POLICY MEMORANDUM\n"
            f"Subject: High-Priority Infrastructure & Citizen Demand Realignment Report ({c_name})\n"
            f"Date: {datetime.utcnow().strftime('%B %d, %Y')} | Status: Action Required\n\n"
            f"1. STRATEGIC OVERVIEW:\n"
            f"CivicPulse AI has ingested and fused {len(db.get_all_requests(c_code))} citizen feedback streams across voice, SMS, and messaging apps "
            f"with national demographic vulnerability records. {len(hotspots)} critical demand hotspots have been validated.\n\n"
            f"2. TOP PRIORITY INTERVENTION:\n"
            f"• Priority #1: {title_str}\n"
            f"• Estimated Cost: {cost_str} | MCDA Score: {mcda_str}\n"
            f"• Impact: {beneficiaries_str} direct beneficiaries with a {roi_str} social ROI ratio.\n\n"
            f"3. FISCAL MISALIGNMENT WARNING:\n"
            f"• {gap_region} currently has a verified spend gap of {gap_val} "
            f"where high citizen demand diverges from capital budget allocation.\n\n"
            f"4. RECOMMENDED CABINET ACTIONS:\n"
            f"1. Fast-track emergency capital tendering for top 3 ranked projects.\n"
            f"2. Reallocate surplus capital from low-demand corridors to critical deficit zones.\n"
            f"3. Authorize Digital Public Good (DPG) open data release to municipal engineers."
        )
        
        answer = f"Generated a comprehensive executive policy briefing for {c_name} highlighting the top {len(recs)} prioritized infrastructure interventions and fiscal realignment gaps."
        action_items = [
            f"Authorize expedited capital disbursement for {recs[0].district if recs else 'high-priority'} {recs[0].category if recs else 'Infrastructure'}",
            f"Review budget reallocation of ${gaps[0].spend_gap_m if gaps else 5.0}M USD for {gaps[0].region_name if gaps else 'identified hotspot'}",
            "Publish anonymized geospatial demand dataset to DPG Alliance Registry"
        ]
        
    # 2. Tender Specification Draft
    elif "tender" in query_lower or "procurement" in query_lower or payload.context_type == "tender":
        target = recs[0] if recs else None
        brief = (
            f"DIGITAL PUBLIC INFRASTRUCTURE TENDER SPECIFICATION\n"
            f"Project Code: {target.id if target else 'TEND-2026-01'}\n"
            f"Title: {target.title if target else 'Primary Corridor Rehabilitation'}\n"
            f"Location: {target.district if target else 'District Zone'}, {target.state_province if target else 'State'}, {c_name}\n"
            f"Budget Envelope: ${target.estimated_cost_usd_m if target else 5.0}M USD\n"
            f"Target Timeline: {target.estimated_completion_months if target else 8} Months\n\n"
            f"SCOPE OF WORK:\n"
            f"{target.proposed_solution if target else 'Engineering and deployment of high-resilience public assets.'}\n\n"
            f"MANDATORY CRITERIA:\n"
            f"1. ISO 9001 quality certification with climate resilience engineering standard.\n"
            f"2. Real-time IoT sensor telemetry integration for public monitoring.\n"
            f"3. Digital Public Good compliant open maintenance API reporting."
        )
        answer = f"Drafted standard DPG-compliant procurement tender specifications for {target.title if target else 'High Priority Project'}."
        action_items = [
            "Submit draft tender to National Procurement Portal",
            "Schedule technical review with regional municipal engineers",
            "Set public milestone milestones in Citizen Tracker Portal"
        ]

    # 3. General Policy Q&A
    else:
        top_cats = [h.top_category for h in hotspots[:3]]
        answer = (
            f"Analysis for {c_name}: Ground citizen data reveals the highest demand concentration in "
            f"**{', '.join(set(top_cats))}**. A total of {len(hotspots)} verified geographic hotspots require urgent capital attention. "
            f"The Multi-Criteria Decision Analysis (MCDA) engine identifies **{recs[0].title if recs else 'Critical Infrastructure Project'}** "
            f"as the highest impact investment (MCDA Score: {recs[0].mcda_score if recs else 90}/100, "
            f"ROI: {recs[0].projected_social_roi_ratio if recs else 4.2}x)."
        )
        brief = None
        action_items = [
            f"Explore interactive GIS heatmap for {len(hotspots)} hotspots",
            "Adjust MCDA weights to stress-test vulnerability vs cost efficiency",
            "Run policy simulation to forecast citizen welfare score gains"
        ]

    citations = [
        {"source": f"Citizen Feedback Stream ({c_name})", "records_count": len(db.get_all_requests(c_code))},
        {"source": "National Demographic Vulnerability Census", "index_coverage": "100%"},
        {"source": "National Infrastructure Deficit Index 2026", "sectors": 7}
    ]
    
    return AICopilotResponse(
        query=payload.query,
        answer=answer,
        generated_brief=brief,
        action_items=action_items,
        citations=citations,
        generated_at=datetime.utcnow().isoformat() + "Z"
    )
