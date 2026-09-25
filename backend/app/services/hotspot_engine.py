import numpy as np
from typing import List, Dict, Any, Optional
from collections import Counter
from sklearn.cluster import DBSCAN
from .data_store import db
from ..models.schemas import HotspotCluster, GeoJSONFeatureCollection, GeoJSONFeature

def calculate_hotspots(country_code: Optional[str] = None) -> List[HotspotCluster]:
    """
    Perform geospatial clustering on citizen requests combined with infrastructure deficit & vulnerability.
    """
    requests = db.get_all_requests(country_code=country_code)
    if not requests:
        # Provide baseline regional clusters from demographic deficits
        from ..models.schemas import CountryCode, InfrastructureCategory
        clusters = []
        target_regions = [r for r in db.regions if country_code is None or country_code == "ALL" or r["country_code"] == country_code]
        for reg in target_regions:
            top_cat = max(reg["infrastructure_deficits"].items(), key=lambda x: x[1])[0]
            clusters.append(HotspotCluster(
                id=f"HOTSPOT-{reg['country_code']}_{reg['state_province']}",
                cluster_name=f"{reg['district']} ({top_cat})",
                country_code=CountryCode(reg["country_code"]),
                state_province=reg["state_province"],
                latitude=reg["center_lat"],
                longitude=reg["center_lng"],
                radius_km=5.0,
                request_count=0,
                top_category=InfrastructureCategory(top_cat),
                avg_urgency_score=0.75,
                vulnerability_index=reg["vulnerability_index"],
                infrastructure_deficit_index=reg["infrastructure_deficits"][top_cat],
                priority_level="Regional Baseline Deficit",
                estimated_affected_population=int(reg["population"] * 0.15),
                sample_requests=[]
            ))
        return clusters
        
    # Group by state/region or run DBSCAN on coordinates
    clusters_list = []
    
    # We aggregate by regional proximity
    region_buckets = {}
    for req in requests:
        # Key on country + state_province
        key = f"{req.country_code.value}_{req.state_province}"
        if key not in region_buckets:
            region_buckets[key] = []
        region_buckets[key].append(req)
        
    for key, reqs in region_buckets.items():
        if len(reqs) == 0:
            continue
            
        c_code = reqs[0].country_code.value
        state_prov = reqs[0].state_province
        
        # Match region profile
        reg_meta = next((r for r in db.regions if r["country_code"] == c_code and r["state_province"] == state_prov), None)
        if not reg_meta:
            reg_meta = next((r for r in db.regions if r["country_code"] == c_code), db.regions[0])
            
        avg_lat = float(np.mean([r.latitude for r in reqs]))
        avg_lng = float(np.mean([r.longitude for r in reqs]))
        
        categories = [r.category.value for r in reqs]
        top_cat = Counter(categories).most_common(1)[0][0]
        
        avg_urgency = float(np.mean([r.urgency_score for r in reqs]))
        vuln = reg_meta["vulnerability_index"]
        deficit = reg_meta["infrastructure_deficits"].get(top_cat, 0.65)
        
        # Priority score
        combined_score = (len(reqs) * 0.25) + (avg_urgency * 30) + (vuln * 25) + (deficit * 25)
        if combined_score > 65:
            priority = "Critical Demand Hotspot"
        elif combined_score > 45:
            priority = "High Priority Area"
        else:
            priority = "Moderate Need"
            
        sample_texts = [r.translated_text for r in reqs[:3]]
        
        cluster = HotspotCluster(
            id=f"HOTSPOT-{key}",
            cluster_name=f"{reg_meta['district']} ({top_cat})",
            country_code=c_code,
            state_province=state_prov,
            latitude=round(avg_lat, 5),
            longitude=round(avg_lng, 5),
            radius_km=round(3.5 + (len(reqs) * 0.15), 1),
            request_count=len(reqs),
            top_category=top_cat,
            avg_urgency_score=round(avg_urgency, 2),
            vulnerability_index=round(vuln, 2),
            infrastructure_deficit_index=round(deficit, 2),
            priority_level=priority,
            estimated_affected_population=int(reg_meta["population"] * (0.05 + (deficit * 0.1))),
            sample_requests=sample_texts
        )
        clusters_list.append(cluster)
        
    return sorted(clusters_list, key=lambda x: (x.request_count * x.avg_urgency_score), reverse=True)

def get_hotspots_geojson(country_code: Optional[str] = None) -> GeoJSONFeatureCollection:
    """Export hotspots as valid DPG-compliant GeoJSON FeatureCollection."""
    clusters = calculate_hotspots(country_code=country_code)
    features = []
    
    for c in clusters:
        feat = GeoJSONFeature(
            type="Feature",
            geometry={
                "type": "Point",
                "coordinates": [c.longitude, c.latitude]
            },
            properties={
                "id": c.id,
                "name": c.cluster_name,
                "country": c.country_code,
                "state_province": c.state_province,
                "request_count": c.request_count,
                "top_category": c.top_category,
                "urgency_score": c.avg_urgency_score,
                "vulnerability_index": c.vulnerability_index,
                "deficit_index": c.infrastructure_deficit_index,
                "priority_level": c.priority_level,
                "affected_population": c.estimated_affected_population,
                "radius_km": c.radius_km
            }
        )
        features.append(feat)
        
    return GeoJSONFeatureCollection(type="FeatureCollection", features=features)
