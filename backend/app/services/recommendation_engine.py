from typing import List, Optional, Dict, Any
from .data_store import db
from .hotspot_engine import calculate_hotspots
from ..models.schemas import MCDAWeights, ProjectRecommendation

# Project templates mapping to high-demand infrastructure solutions
PROJECT_TEMPLATES = {
    "Water & Sanitation": {
        "title_template": "Decentralized Piped Clean Water & Solar Borewell Network",
        "solution": "Installation of high-capacity filtration units, solar-powered deep borewell pumps, and 12km distribution grid pipeline to replace broken channels.",
        "cost_base_m": 4.5,
        "completion_months": 8,
        "sdgs": ["SDG 6: Clean Water & Sanitation", "SDG 3: Good Health & Well-being", "SDG 10: Reduced Inequalities"],
        "roi_multiplier": 3.8
    },
    "Roads & Public Transport": {
        "title_template": "All-Weather Rural Corridor & Resilient Culvert Rehabilitation",
        "solution": "Re-engineering arterial road with reinforced asphalt, 3 high-load drainage culverts, and dedicated electric feeder bus stops.",
        "cost_base_m": 7.2,
        "completion_months": 12,
        "sdgs": ["SDG 9: Industry, Innovation & Infrastructure", "SDG 11: Sustainable Cities & Communities", "SDG 8: Decent Work"],
        "roi_multiplier": 4.2
    },
    "Clean Energy & Grid": {
        "title_template": "Community Solar Microgrid & Grid Reinforcement Project",
        "solution": "Deploying 500kW rooftop & ground solar microgrid paired with lithium battery storage to guarantee uninterrupted power for clinics and local commerce.",
        "cost_base_m": 3.8,
        "completion_months": 6,
        "sdgs": ["SDG 7: Affordable & Clean Energy", "SDG 13: Climate Action", "SDG 9: Infrastructure"],
        "roi_multiplier": 3.5
    },
    "Healthcare & Clinics": {
        "title_template": "Primary Health Clinic Modernization & Telemedicine Hub",
        "solution": "Upgrading rural clinic infrastructure, installing solar-powered vaccine cold storage, and equipping a 24/7 digital telemedicine diagnosis room.",
        "cost_base_m": 2.9,
        "completion_months": 5,
        "sdgs": ["SDG 3: Good Health & Well-being", "SDG 10: Reduced Inequalities"],
        "roi_multiplier": 5.1
    },
    "Digital Public Infrastructure": {
        "title_template": "Fiber-to-the-Panchayat & Public Broadband Access Hubs",
        "solution": "Laying 25km fiber-optic connectivity and establishing 5 open community Digital Public Service Kiosks for seamless citizen governance access.",
        "cost_base_m": 1.8,
        "completion_months": 4,
        "sdgs": ["SDG 9: Digital Infrastructure", "SDG 1: No Poverty", "SDG 4: Quality Education"],
        "roi_multiplier": 4.7
    },
    "Education & Schools": {
        "title_template": "Smart Resilient School Complex & Sanitation Overhaul",
        "solution": "Rebuilding classroom wings with thermal insulation, dedicated girl/boy modern sanitation facilities, and solar-powered digital learning labs.",
        "cost_base_m": 2.2,
        "completion_months": 7,
        "sdgs": ["SDG 4: Quality Education", "SDG 5: Gender Equality", "SDG 6: Clean Water"],
        "roi_multiplier": 4.0
    },
    "Flood & Climate Resilience": {
        "title_template": "Bio-Engineered Flood Barrier & Stormwater Drainage System",
        "solution": "Reinforced embankment construction, retention pond rehabilitation, and real-time IoT flood monitoring sensors connected to national emergency dispatch.",
        "cost_base_m": 6.0,
        "completion_months": 10,
        "sdgs": ["SDG 13: Climate Action", "SDG 11: Resilient Communities", "SDG 15: Life on Land"],
        "roi_multiplier": 4.9
    }
}

def generate_recommendations(
    country_code: Optional[str] = None,
    weights: Optional[MCDAWeights] = None
) -> List[ProjectRecommendation]:
    """
    Compute Multi-Criteria Decision Analysis (MCDA) rankings for candidate infrastructure interventions.
    """
    if weights is None:
        weights = MCDAWeights()
        
    hotspots = calculate_hotspots(country_code=country_code)
    recommendations = []
    
    country_name_map = {"IND": "India", "BRA": "Brazil", "ZAF": "South Africa", "CHN": "China", "RUS": "Russia"}
    
    for idx, hs in enumerate(hotspots):
        tpl = PROJECT_TEMPLATES.get(hs.top_category, PROJECT_TEMPLATES["Roads & Public Transport"])
        
        # Normalize criteria scores between 0.0 and 1.0
        s_demand = min(1.0, (hs.request_count / 15.0) * 0.5 + hs.avg_urgency_score * 0.5)
        s_deficit = hs.infrastructure_deficit_index
        s_vuln = hs.vulnerability_index
        
        cost = round(tpl["cost_base_m"] * (1.0 + (s_deficit * 0.3)), 2)
        
        # If budget cap is specified and cost exceeds, adjust feasibility
        budget_cap = weights.budget_cap_millions or 100.0
        s_feasibility = max(0.1, min(1.0, 1.0 - (cost / budget_cap) * 0.5))
        
        # Weighted MCDA Composite
        total_w = (weights.citizen_demand_weight + weights.infra_deficit_weight + 
                   weights.vulnerability_weight + weights.budget_feasibility_weight)
        
        if total_w <= 0:
            total_w = 1.0
            
        mcda_raw = (
            (s_demand * weights.citizen_demand_weight) +
            (s_deficit * weights.infra_deficit_weight) +
            (s_vuln * weights.vulnerability_weight) +
            (s_feasibility * weights.budget_feasibility_weight)
        ) / total_w
        
        mcda_score = round(mcda_raw * 100, 1)
        
        urgency_tier = "Immediate Priority (Tier 1)" if mcda_score > 75 else ("High Priority (Tier 2)" if mcda_score > 55 else "Medium Priority (Tier 3)")
        
        beneficiaries = int(hs.estimated_affected_population * (0.8 + (s_demand * 0.4)))
        
        rec = ProjectRecommendation(
            id=f"REC-{hs.country_code}-{idx+1:03d}",
            title=f"{hs.cluster_name}: {tpl['title_template']}",
            country_code=hs.country_code,
            country_name=country_name_map.get(hs.country_code, "Global"),
            state_province=hs.state_province,
            district=hs.cluster_name.split(" (")[0],
            category=hs.top_category,
            latitude=hs.latitude,
            longitude=hs.longitude,
            priority_rank=0, # set after sorting
            mcda_score=mcda_score,
            citizen_demand_score=round(s_demand * 100, 1),
            infra_deficit_score=round(s_deficit * 100, 1),
            vulnerability_score=round(s_vuln * 100, 1),
            cost_feasibility_score=round(s_feasibility * 100, 1),
            estimated_cost_usd_m=cost,
            projected_beneficiaries=beneficiaries,
            estimated_completion_months=tpl["completion_months"],
            projected_social_roi_ratio=round(tpl["roi_multiplier"] * (1.0 + (s_vuln * 0.2)), 2),
            urgency_tier=urgency_tier,
            key_problem_summary=f"Severe citizen-reported deficit in {hs.top_category}. {len(hs.sample_requests)} verified grievance clusters with avg urgency {hs.avg_urgency_score:.2f}.",
            proposed_solution=tpl["solution"],
            sdg_alignment=tpl["sdgs"],
            supporting_citizen_request_count=hs.request_count
        )
        recommendations.append(rec)
        
    # Sort descending by MCDA score
    recommendations = sorted(recommendations, key=lambda x: x.mcda_score, reverse=True)
    
    # Assign ranks
    for r_idx, r in enumerate(recommendations):
        r.priority_rank = r_idx + 1
        
    return recommendations
