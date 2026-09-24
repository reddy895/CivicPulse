import math
from typing import Dict, Any, List
from .data_store import db
from .hotspot_engine import calculate_hotspots
from ..models.schemas import PolicySimulationRequest, PolicySimulationResponse

SECTOR_MULTIPLIERS = {
    "Water & Sanitation": {"beneficiary_per_m": 45000, "economic_multiplier": 3.8, "sdg_weight": 0.20},
    "Roads & Public Transport": {"beneficiary_per_m": 62000, "economic_multiplier": 4.2, "sdg_weight": 0.22},
    "Clean Energy & Grid": {"beneficiary_per_m": 38000, "economic_multiplier": 3.5, "sdg_weight": 0.18},
    "Healthcare & Clinics": {"beneficiary_per_m": 52000, "economic_multiplier": 5.1, "sdg_weight": 0.19},
    "Digital Public Infrastructure": {"beneficiary_per_m": 75000, "economic_multiplier": 4.7, "sdg_weight": 0.15},
    "Education & Schools": {"beneficiary_per_m": 41000, "economic_multiplier": 4.0, "sdg_weight": 0.14},
    "Flood & Climate Resilience": {"beneficiary_per_m": 58000, "economic_multiplier": 4.9, "sdg_weight": 0.17}
}

def run_policy_simulation(payload: PolicySimulationRequest) -> PolicySimulationResponse:
    """
    Simulate socio-economic impact of capital budget allocation scenarios.
    """
    total_allocated = sum(payload.sector_allocations.values())
    hotspots = calculate_hotspots(country_code=payload.country_code.value)
    
    total_beneficiaries = 0
    total_sdg_score = 0.0
    sector_impacts = []
    
    weighted_economic_multiplier = 0.0
    
    for sector, budget in payload.sector_allocations.items():
        config = SECTOR_MULTIPLIERS.get(sector, {"beneficiary_per_m": 40000, "economic_multiplier": 3.5, "sdg_weight": 0.15})
        
        # Sector beneficiaries scaled by equity multiplier
        sector_beneficiaries = int(budget * config["beneficiary_per_m"] * payload.equity_focus_multiplier)
        total_beneficiaries += sector_beneficiaries
        
        # Sector deficit reduction percentage
        deficit_reduct_pct = min(92.0, round(budget * 1.65 * payload.equity_focus_multiplier, 1))
        
        weighted_economic_multiplier += (budget / max(1.0, total_allocated)) * config["economic_multiplier"]
        total_sdg_score += config["sdg_weight"] * (deficit_reduct_pct / 100.0)
        
        # Count related hotspots addressed
        related_hotspots = [h for h in hotspots if h.top_category == sector]
        addressed_count = min(len(related_hotspots), int(budget / 3.5))
        
        sector_impacts.append({
            "sector": sector,
            "allocated_budget_usd_m": budget,
            "projected_beneficiaries": sector_beneficiaries,
            "deficit_reduction_pct": deficit_reduct_pct,
            "hotspots_resolved": addressed_count,
            "total_sector_hotspots": len(related_hotspots),
            "estimated_social_roi_ratio": round(config["economic_multiplier"] * payload.equity_focus_multiplier, 2)
        })
        
    avg_deficit_reduction = round(sum(s["deficit_reduction_pct"] for s in sector_impacts) / len(sector_impacts), 1)
    
    # Compute citizen satisfaction score (0 - 100)
    baseline_satisfaction = 42.0
    satisfaction_boost = (total_allocated / 10.0) * 1.8 * payload.equity_focus_multiplier
    citizen_satisfaction = min(96.5, round(baseline_satisfaction + satisfaction_boost, 1))
    
    sdg_progress_index = min(98.0, round((total_sdg_score * 85.0) + 20.0, 1))
    
    # Remaining unmet hotspots
    total_resolved = sum(s["hotspots_resolved"] for s in sector_impacts)
    remaining_unmet = max(0, len(hotspots) - total_resolved)
    
    exec_summary = (
        f"Allocating ${total_allocated:.1f}M USD with an Equity Focus of {payload.equity_focus_multiplier}x is projected to directly benefit "
        f"{total_beneficiaries:,} citizens across target regions. It resolves {total_resolved} out of {len(hotspots)} critical infrastructure "
        f"hotspots, generating an estimated macroeconomic ROI multiplier of {weighted_economic_multiplier:.2f}x per dollar invested."
    )
    
    return PolicySimulationResponse(
        total_budget_allocated_m=round(total_allocated, 2),
        projected_total_beneficiaries=total_beneficiaries,
        projected_citizen_satisfaction_score=citizen_satisfaction,
        projected_infrastructure_deficit_reduction_pct=avg_deficit_reduction,
        brics_sdg_progress_index=sdg_progress_index,
        sector_impacts=sector_impacts,
        unmet_demand_hotspots_count=remaining_unmet,
        economic_multiplier_estimated=round(weighted_economic_multiplier, 2),
        executive_summary=exec_summary
    )
