from typing import List, Optional
from .data_store import db
from .hotspot_engine import calculate_hotspots
from ..models.schemas import SpendMisalignmentItem

def analyze_spend_misalignment(country_code: Optional[str] = None) -> List[SpendMisalignmentItem]:
    """
    Detect fiscal misalignments between public investment budgets and grassroots citizen demand.
    """
    hotspots = calculate_hotspots(country_code=country_code)
    results = []
    
    for hs in hotspots:
        reg_meta = next((r for r in db.regions if r["country_code"] == hs.country_code and r["state_province"] == hs.state_province), None)
        if not reg_meta:
            continue
            
        current_alloc = reg_meta["current_allocated_budget_usd_m"]
        demand_idx = round(min(1.0, (hs.request_count / 12.0) * 0.5 + hs.avg_urgency_score * 0.5) * 100, 1)
        deficit_score = round(hs.infrastructure_deficit_index * 100, 1)
        
        # Calculate needed capital expenditure to clear the deficit
        target_capital = round((demand_idx * 0.12) + (deficit_score * 0.15) * (reg_meta["population"] / 1_000_000), 2)
        target_capital = max(4.0, target_capital)
        
        spend_gap = round(target_capital - current_alloc, 2)
        curr_symbol = "₹" if hs.country_code == "IND" else "$"
        curr_unit = "Cr" if hs.country_code == "IND" else "M USD"
        
        if spend_gap > 8.0:
            status = "Critical Spend Gap / Ignored Hotspot"
            action = f"Immediate capital injection of {curr_symbol}{spend_gap:.1f} {curr_unit} recommended. Prioritize fast-track tendering for {hs.top_category}."
        elif spend_gap > 2.0:
            status = "Moderate Deficit / Underspending"
            action = f"Supplementary budget adjustment of {curr_symbol}{spend_gap:.1f} {curr_unit} required in next fiscal cycle."
        elif spend_gap < -4.0:
            status = "Overfunded / Potential Inefficiency"
            action = f"Current allocation exceeds detected ground demand by {curr_symbol}{abs(spend_gap):.1f} {curr_unit}. Reallocate surplus capital to underfunded regional corridors."
        else:
            status = "Optimal Alignment"
            action = f"Budget allocation is well-calibrated to ground citizen demand and deficit metrics."
            
        results.append(SpendMisalignmentItem(
            id=f"GAP-{hs.country_code}-{hs.id}",
            region_name=f"{reg_meta['district']}, {reg_meta['state_province']}",
            country_code=hs.country_code,
            category=hs.top_category,
            citizen_demand_index=demand_idx,
            infrastructure_deficit_score=deficit_score,
            current_budget_allocated_m=current_alloc,
            recommended_budget_m=target_capital,
            spend_gap_m=spend_gap,
            alignment_status=status,
            action_recommendation=action
        ))
        
    # Sort with biggest critical gaps first
    return sorted(results, key=lambda x: x.spend_gap_m, reverse=True)
