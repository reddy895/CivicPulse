import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, ChevronRight, FileText, Activity, MessageSquare, ThumbsUp
} from 'lucide-react';
import { getHotspots, getRequests, upvoteRequest } from '../services/api';
import L from 'leaflet';

const COUNTRY_COORDS = {
  ALL: { center: [20.0, 30.0], zoom: 2 },
  USA: { center: [37.0902, -95.7129], zoom: 4 },
  IND: { center: [20.5937, 78.9629], zoom: 5 },
  BRA: { center: [-14.2350, -51.9253], zoom: 4 },
  ZAF: { center: [-29.0852, 26.1596], zoom: 5 },
  CHN: { center: [35.8617, 104.1954], zoom: 4 },
  RUS: { center: [61.5240, 105.3188], zoom: 3 }
};

const STATE_FOCUS_TARGETS = {
  'Karnataka': { center: [12.9716, 77.5946], zoom: 8, label: 'Karnataka (Bengaluru)' },
  'Uttar Pradesh': { center: [25.3176, 82.9739], zoom: 8, label: 'Uttar Pradesh (Varanasi)' },
  'Maharashtra': { center: [20.1809, 79.9950], zoom: 8, label: 'Maharashtra (Gadchiroli)' },
  'Bihar': { center: [26.0903, 87.9405], zoom: 8, label: 'Bihar (Kishanganj)' },
  'Rajasthan': { center: [25.7521, 71.3967], zoom: 8, label: 'Rajasthan (Barmer)' },
  'Kerala': { center: [11.6854, 76.1320], zoom: 8, label: 'Kerala (Wayanad)' }
};

export default function GISMap({ selectedCountry, onSelectProject, onOpenCopilot }) {
  const [hotspots, setHotspots] = useState([]);
  const [liveRequests, setLiveRequests] = useState([]);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeLayer, setActiveLayer] = useState('demand');
  const [activeRightTab, setActiveRightTab] = useState('complaints'); // 'complaints' | 'metrics'
  const [isLoading, setIsLoading] = useState(true);
  const [complaintSearch, setComplaintSearch] = useState('');
  const [focusedState, setFocusedState] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const markersMapRef = useRef({});

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [selectedCountry]);

  async function loadData() {
    const [hData, rData] = await Promise.all([
      getHotspots(selectedCountry),
      getRequests(selectedCountry === 'ALL' ? null : selectedCountry)
    ]);
    
    // Ensure Karnataka hotspot exists if Karnataka requests exist
    const kaRequests = rData.filter(r => 
      (r.state_province && r.state_province.toLowerCase().includes('karnataka')) ||
      (r.location_name && (r.location_name.toLowerCase().includes('karnataka') || r.location_name.toLowerCase().includes('bengaluru') || r.location_name.toLowerCase().includes('bangalore')))
    );

    let processedHotspots = [...hData];
    const hasKaHotspot = processedHotspots.some(h => (h.state_province || '').toLowerCase().includes('karnataka'));
    
    if (kaRequests.length > 0 && !hasKaHotspot) {
      processedHotspots.unshift({
        id: "HOTSPOT-IND_Karnataka",
        cluster_name: "Bengaluru Urban & Rural (Water, Roads & Flood)",
        country_code: "IND",
        state_province: "Karnataka",
        latitude: 12.9716,
        longitude: 77.5946,
        radius_km: 5.2,
        request_count: kaRequests.length,
        top_category: kaRequests[0]?.category || "Water & Sanitation",
        avg_urgency_score: 0.88,
        vulnerability_index: 0.62,
        infrastructure_deficit_index: 0.78,
        priority_level: "Critical Demand Hotspot",
        estimated_affected_population: 1850000,
        sample_requests: kaRequests.map(r => r.translated_text || r.original_text)
      });
    }

    setHotspots(processedHotspots);
    setLiveRequests(rData);

    // Default select Karnataka or first hotspot if none selected
    setSelectedHotspot(prev => {
      if (prev) {
        // Keep selected hotspot updated with latest data
        const updated = processedHotspots.find(h => h.id === prev.id || h.state_province === prev.state_province);
        return updated || prev;
      }
      const kaSpot = processedHotspots.find(h => (h.state_province || '').toLowerCase().includes('karnataka'));
      return kaSpot || processedHotspots[0] || null;
    });

    setIsLoading(false);
  }

  // Initialize Map container once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initial = COUNTRY_COORDS[selectedCountry] || COUNTRY_COORDS.ALL;
      const map = L.map(mapContainerRef.current, {
        center: initial.center,
        zoom: initial.zoom,
        zoomControl: true,
        attributionControl: false
      });

      // CartoDB Positron light theme tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }
  }, []);

  // Handle camera position when selectedCountry changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (focusedState) return; // don't override state focus
    const target = COUNTRY_COORDS[selectedCountry] || COUNTRY_COORDS.ALL;
    mapInstanceRef.current.flyTo(target.center, target.zoom, { duration: 0.8 });
  }, [selectedCountry]);

  // Update map markers when hotspots or liveRequests update without resetting pan/zoom
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    
    layerGroupRef.current.clearLayers();
    markersMapRef.current = {};

    // 1. Render Cluster Hotspots
    hotspots.forEach((h) => {
      const isKa = (h.state_province || '').toLowerCase().includes('karnataka');
      const isCritical = isKa || h.priority_level.includes('Critical') || h.avg_urgency_score > 0.75;
      const isMedium = h.avg_urgency_score > 0.55;
      
      const dotColor = isKa ? '#E11D48' : (isCritical ? '#B54A4A' : (isMedium ? '#A67B5B' : '#D4A373'));
      const dotSize = isKa ? 24 : (isCritical ? 20 : (isMedium ? 15 : 12));

      const isSelected = selectedHotspot && (selectedHotspot.id === h.id || selectedHotspot.state_province === h.state_province);

      const iconHtml = `
        <div style="position: relative; width: ${dotSize}px; height: ${dotSize}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <span style="position: absolute; width: ${dotSize * 2.2}px; height: ${dotSize * 2.2}px; border-radius: 50%; background: ${dotColor}; opacity: ${isSelected ? '0.5' : '0.25'}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <span style="width: ${dotSize}px; height: ${dotSize}px; border-radius: 50%; background: ${dotColor}; border: ${isSelected ? '3px solid #2C1810' : '2px solid #FFFFFF'}; box-shadow: 0 3px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 10px; font-weight: bold; font-family: sans-serif;">
            ${h.request_count || ''}
          </span>
          ${isKa ? `<div style="position: absolute; bottom: -18px; white-space: nowrap; background: #2C1810; color: #FFF; font-size: 9px; font-weight: bold; padding: 1px 5px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">📍 KARNATAKA</div>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-map-dot',
        iconSize: [dotSize, dotSize],
        iconAnchor: [dotSize / 2, dotSize / 2]
      });

      const marker = L.marker([h.latitude, h.longitude], { icon: customIcon, zIndexOffset: isKa ? 500 : 200 });
      marker.on('click', () => {
        setSelectedHotspot(h);
        setActiveRightTab('complaints');
        mapInstanceRef.current.flyTo([h.latitude, h.longitude], 8, { duration: 0.6 });
      });

      layerGroupRef.current.addLayer(marker);
    });

    // 2. Render Individual Real-time Citizen Complaints pins
    liveRequests.forEach((req) => {
      const isKarnataka = (req.state_province && req.state_province.toLowerCase().includes('karnataka')) || 
                          (req.location_name && (req.location_name.toLowerCase().includes('karnataka') || req.location_name.toLowerCase().includes('bengaluru') || req.location_name.toLowerCase().includes('bangalore')));
      
      const pinColor = isKarnataka ? '#DC2626' : (req.urgency === 'Critical' ? '#B54A4A' : '#10B981');
      const pinSize = isKarnataka ? 18 : 13;

      const pinHtml = `
        <div style="position: relative; width: ${pinSize}px; height: ${pinSize}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <span style="position: absolute; width: ${pinSize * 2}px; height: ${pinSize * 2}px; border-radius: 50%; background: ${pinColor}; opacity: 0.4; animation: ping 1.5s infinite;"></span>
          <span style="width: ${pinSize}px; height: ${pinSize}px; border-radius: 50%; background: ${pinColor}; border: 2px solid #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 8px; color: white;">
            ${isKarnataka ? '🚨' : '•'}
          </span>
        </div>
      `;
      const pinIcon = L.divIcon({
        html: pinHtml,
        className: 'live-citizen-pin',
        iconSize: [pinSize, pinSize],
        iconAnchor: [pinSize / 2, pinSize / 2]
      });
      const cMarker = L.marker([req.latitude, req.longitude], { icon: pinIcon, zIndexOffset: isKarnataka ? 1000 : 800 });
      
      cMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 11px; padding: 6px; min-width: 180px;">
          <div style="font-weight: bold; color: #2C1810; margin-bottom: 2px; display: flex; align-items: center; justify-content: space-between;">
            <span>🚨 ${req.category}</span>
            <span style="background: #FEE2E2; color: #991B1B; padding: 1px 4px; border-radius: 3px; font-size: 9px;">${req.urgency}</span>
          </div>
          <div style="color: #4B5563; font-size: 10px; margin-bottom: 4px;">📍 ${req.location_name || req.state_province}</div>
          <div style="color: #1F2937; margin-bottom: 6px; font-style: italic;">"${req.translated_text || req.original_text}"</div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E5E7EB; padding-top: 4px; font-size: 9px; color: #6B7280;">
            <span>By: ${req.submitter_name || 'Citizen'}</span>
            <span>👍 ${req.upvotes || 1} upvotes</span>
          </div>
        </div>
      `);

      cMarker.on('click', () => {
        setSelectedRequest(req);
        // Find matching hotspot
        const matchHs = hotspots.find(h => 
          (h.state_province && req.state_province && h.state_province.toLowerCase() === req.state_province.toLowerCase()) ||
          (isKarnataka && (h.state_province || '').toLowerCase().includes('karnataka'))
        );
        if (matchHs) setSelectedHotspot(matchHs);
        setActiveRightTab('complaints');
      });

      markersMapRef.current[req.id] = cMarker;
      layerGroupRef.current.addLayer(cMarker);
    });

  }, [hotspots, liveRequests, selectedCountry, selectedHotspot]);

  // Focus specific state/region on map
  const handleFocusState = (stateName) => {
    setFocusedState(stateName);
    const target = STATE_FOCUS_TARGETS[stateName];
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(target.center, target.zoom, { duration: 0.8 });
    }
    
    // Select the hotspot for this state
    const matched = hotspots.find(h => (h.state_province || '').toLowerCase().includes(stateName.toLowerCase()));
    if (matched) {
      setSelectedHotspot(matched);
      setActiveRightTab('complaints');
    }
  };

  const handleUpvoteComplaint = async (reqId, e) => {
    if (e) e.stopPropagation();
    const res = await upvoteRequest(reqId);
    if (res) {
      setLiveRequests(prev => prev.map(r => r.id === reqId ? { ...r, upvotes: res.upvotes } : r));
    }
  };

  const handleFocusComplaintPin = (req) => {
    setSelectedRequest(req);
    if (mapInstanceRef.current && req.latitude && req.longitude) {
      mapInstanceRef.current.flyTo([req.latitude, req.longitude], 10, { duration: 0.6 });
      const marker = markersMapRef.current[req.id];
      if (marker) {
        setTimeout(() => marker.openPopup(), 650);
      }
    }
  };

  // Filter complaints for the currently selected hotspot
  const selectedStateName = (selectedHotspot?.state_province || '').toLowerCase();
  const regionalComplaints = liveRequests.filter(req => {
    if (!selectedHotspot) return true;
    const reqState = (req.state_province || '').toLowerCase();
    const reqLoc = (req.location_name || '').toLowerCase();
    const isKa = selectedStateName.includes('karnataka') && 
                 (reqState.includes('karnataka') || reqLoc.includes('karnataka') || reqLoc.includes('bengaluru') || reqLoc.includes('bangalore') || reqLoc.includes('mysuru') || reqLoc.includes('hubli'));
    
    if (isKa) return true;
    return reqState === selectedStateName || reqLoc.includes(selectedStateName);
  });

  const displayedComplaints = regionalComplaints.filter(r => {
    if (!complaintSearch.trim()) return true;
    const q = complaintSearch.toLowerCase();
    return (
      (r.original_text || '').toLowerCase().includes(q) ||
      (r.translated_text || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q) ||
      (r.location_name || '').toLowerCase().includes(q) ||
      (r.submitter_name || '').toLowerCase().includes(q)
    );
  });

  // Calculate Karnataka-specific counts
  const karnatakaComplaintsCount = liveRequests.filter(r => 
    (r.state_province && r.state_province.toLowerCase().includes('karnataka')) ||
    (r.location_name && (r.location_name.toLowerCase().includes('karnataka') || r.location_name.toLowerCase().includes('bengaluru') || r.location_name.toLowerCase().includes('bangalore')))
  ).length;

  const totalSignals = hotspots.reduce((acc, h) => acc + h.request_count, 0) + liveRequests.length;
  const totalImpacted = hotspots.reduce((acc, h) => acc + h.estimated_affected_population, 0);

  return (
    <div className="max-w-[1440px] mx-auto px-8 space-y-6">
      
      {/* 1. Top Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-coffee p-5 space-y-1">
          <div className="text-label">Citizen Signals</div>
          <div className="text-kpi">{totalSignals.toLocaleString()}</div>
          <div className="text-kpi-sub">Multilingual verified grassroots reports</div>
        </div>

        <div className="card-coffee p-5 space-y-1">
          <div className="text-label">Priority Hotspots</div>
          <div className="text-kpi text-[#B54A4A]">{hotspots.length}</div>
          <div className="text-kpi-sub">Active geospatial demand clusters</div>
        </div>

        <div className="card-coffee p-5 space-y-1">
          <div className="text-label">People Impacted</div>
          <div className="text-kpi">{totalImpacted.toLocaleString()}</div>
          <div className="text-kpi-sub">Direct municipal population radius</div>
        </div>

        <div className="card-coffee p-5 space-y-1">
          <div className="text-label">Capital Under Review</div>
          <div className="text-kpi text-[#5A8F6E]">$184.5M</div>
          <div className="text-kpi-sub">National infrastructure budget</div>
        </div>
      </div>

      {/* 2. Map Section Header & Quick Regional Focus Toolbar */}
      <div className="card-coffee p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#2C1810] tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#6F4E37]" />
              Geospatial Demand Intelligence & Complaint Verification
            </h2>
            <p className="text-xs text-[#5C4A42]">
              Click any regional cluster or complaint marker on the map to inspect citizen-filed grievances in real-time.
            </p>
          </div>

          {/* Map Layer Controls */}
          <div className="flex items-center gap-1 p-1 bg-[#F5F0E8] rounded-lg border border-[#E8E0D5]">
            {[
              { id: 'demand', label: 'Demand Density' },
              { id: 'deficit', label: 'Infra Deficit' },
              { id: 'vulnerability', label: 'Vulnerability' }
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => setActiveLayer(l.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeLayer === l.id
                    ? 'bg-[#FFFFFF] text-[#6F4E37] shadow-sm'
                    : 'text-[#5C4A42] hover:text-[#2C1810]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Region Focus Pills (Spotlight on Karnataka) */}
        <div className="pt-2 border-t border-[#F0EBE3] flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider shrink-0">
            Quick Jump:
          </span>

          <button
            onClick={() => {
              setFocusedState(null);
              const target = COUNTRY_COORDS[selectedCountry] || COUNTRY_COORDS.IND;
              mapInstanceRef.current?.flyTo(target.center, target.zoom);
            }}
            className={`px-2.5 py-1 rounded-full font-semibold border transition shrink-0 ${
              !focusedState ? 'bg-[#2C1810] text-[#FFFFFF] border-[#2C1810]' : 'bg-[#FFFFFF] text-[#5C4A42] border-[#E8E0D5] hover:border-[#D4A373]'
            }`}
          >
            All National Spots
          </button>

          {/* Highlighted Karnataka Quick Pill */}
          <button
            onClick={() => handleFocusState('Karnataka')}
            className={`px-3 py-1 rounded-full font-bold border transition shrink-0 flex items-center gap-1.5 ${
              focusedState === 'Karnataka' || (selectedHotspot && (selectedHotspot.state_province || '').toLowerCase().includes('karnataka'))
                ? 'bg-[#E11D48] text-white border-[#BE123C] shadow-sm animate-pulse'
                : 'bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3] hover:bg-[#FCD34D]'
            }`}
          >
            <span>🚨 Karnataka (Bengaluru)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">
              {karnatakaComplaintsCount} Complaints
            </span>
          </button>

          {Object.keys(STATE_FOCUS_TARGETS).filter(s => s !== 'Karnataka').map((stateKey) => {
            const count = liveRequests.filter(r => (r.state_province || '').toLowerCase().includes(stateKey.toLowerCase())).length;
            const isSel = focusedState === stateKey;
            return (
              <button
                key={stateKey}
                onClick={() => handleFocusState(stateKey)}
                className={`px-2.5 py-1 rounded-full font-semibold border transition shrink-0 flex items-center gap-1 ${
                  isSel
                    ? 'bg-[#6F4E37] text-white border-[#6F4E37]'
                    : 'bg-[#FFFFFF] text-[#5C4A42] border-[#E8E0D5] hover:border-[#D4A373]'
                }`}
              >
                <span>{stateKey}</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#F5F0E8] text-[#6F4E37] text-[10px] font-bold">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Split View: Map + Right Detailed Complaints & Hotspot Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Interactive Map Container (7 Cols) */}
        <div className="lg:col-span-7 card-coffee p-2 relative h-[620px] overflow-hidden flex flex-col">
          <div ref={mapContainerRef} className="w-full h-full rounded-lg z-0" />

          {/* Map Floating Banner */}
          <div className="absolute top-4 left-4 z-10 card-coffee p-2.5 bg-[#FFFFFF]/90 backdrop-blur-sm text-xs border-[#E8E0D5] shadow-md flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] animate-ping" />
            <span className="text-[#2C1810] font-bold">Live Demand Pins Active</span>
            <span className="text-[#8C7A70]">• {liveRequests.length} Total Verified Signals</span>
          </div>

          {/* Persistent Light Legend */}
          <div className="absolute bottom-4 left-4 z-10 card-coffee p-3 bg-[#FFFFFF]/95 text-xs space-y-1.5 border-[#E8E0D5] shadow-md">
            <div className="text-label text-[10px]">Map Indicators</div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#E11D48] flex items-center justify-center text-[8px] text-white font-bold">!</span>
              <span className="text-[#2C1810] font-semibold">Karnataka / Critical Cluster</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#B54A4A]" />
              <span className="text-[#5C4A42]">High Priority Hotspot</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              <span className="text-[#5C4A42]">Individual Citizen Complaint Pin</span>
            </div>
          </div>
        </div>

        {/* Right Detail Panel: Citizen Complaints & Cluster Intelligence (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedHotspot ? (
            <div className="card-coffee p-5 space-y-4">
              
              {/* Header: Title + Subtle Badge */}
              <div className="space-y-1.5 pb-3 border-b border-[#F0EBE3]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-[#6F4E37] bg-[#F5F0E8] px-2 py-0.5 rounded border border-[#E8E0D5]">
                    {selectedHotspot.country_code} · {selectedHotspot.id}
                  </span>
                  <span className={`badge-pill ${selectedHotspot.priority_level.includes('Critical') || (selectedHotspot.state_province || '').toLowerCase().includes('karnataka') ? 'badge-pill-danger' : 'badge-pill-warning'}`}>
                    {selectedHotspot.priority_level}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#2C1810] pt-0.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#E11D48]" />
                  {selectedHotspot.cluster_name}
                </h3>
                <p className="text-xs text-[#5C4A42]">
                  {selectedHotspot.state_province} Administrative Region • <strong>{regionalComplaints.length} Filed Citizen Complaints</strong>
                </p>
              </div>

              {/* Tab Switcher: Filed Complaints vs Hotspot Metrics */}
              <div className="flex items-center p-1 bg-[#F5F0E8] rounded-xl border border-[#E8E0D5]">
                <button
                  onClick={() => setActiveRightTab('complaints')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeRightTab === 'complaints'
                      ? 'bg-[#FFFFFF] text-[#2C1810] shadow-sm'
                      : 'text-[#5C4A42] hover:text-[#2C1810]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Filed Complaints ({regionalComplaints.length})</span>
                </button>

                <button
                  onClick={() => setActiveRightTab('metrics')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeRightTab === 'metrics'
                      ? 'bg-[#FFFFFF] text-[#2C1810] shadow-sm'
                      : 'text-[#5C4A42] hover:text-[#2C1810]'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>SROI & Deficit Metrics</span>
                </button>
              </div>

              {/* TAB 1: FILED CITIZEN COMPLAINTS LIST */}
              {activeRightTab === 'complaints' && (
                <div className="space-y-3">
                  {/* Search / Filter in complaints */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={complaintSearch}
                      onChange={(e) => setComplaintSearch(e.target.value)}
                      placeholder={`Search ${selectedHotspot.state_province} complaints...`}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#E8E0D5] bg-[#FAF6F0] focus:ring-1 focus:ring-[#D4A373] outline-none"
                    />
                    <span className="text-[11px] text-[#8C7A70] shrink-0 font-medium">
                      Showing {displayedComplaints.length}
                    </span>
                  </div>

                  {/* Complaints Scroll Area */}
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {displayedComplaints.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#8C7A70] bg-[#FAF6F0] rounded-xl border border-dashed border-[#E8E0D5]">
                        No complaints match filter in {selectedHotspot.state_province}.
                      </div>
                    ) : (
                      displayedComplaints.map((comp) => {
                        const isSelected = selectedRequest && selectedRequest.id === comp.id;
                        return (
                          <div
                            key={comp.id}
                            onClick={() => handleFocusComplaintPin(comp)}
                            className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 relative ${
                              isSelected
                                ? 'bg-[#FFFBEB] border-[#D97706] shadow-md ring-2 ring-[#F59E0B]/30'
                                : 'bg-[#FFFFFF] border-[#E8E0D5] hover:border-[#D4A373] hover:shadow-sm'
                            }`}
                          >
                            {/* Card Header: Category + Urgency + Channel */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#2C1810] flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-[#6F4E37]" />
                                {comp.category}
                              </span>

                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                comp.urgency === 'Critical'
                                  ? 'bg-[#FEE2E2] text-[#991B1B]'
                                  : 'bg-[#FEF3C7] text-[#92400E]'
                              }`}>
                                {comp.urgency} Urgency
                              </span>
                            </div>

                            {/* Complaint Content */}
                            <div className="space-y-1">
                              <p className="text-xs text-[#2C1810] font-medium leading-relaxed">
                                "{comp.translated_text || comp.original_text}"
                              </p>
                              {comp.original_text && comp.translated_text && comp.original_text !== comp.translated_text && (
                                <p className="text-[11px] text-[#8C7A70] italic">
                                  Original ({comp.language_name || 'Native'}): "{comp.original_text}"
                                </p>
                              )}
                            </div>

                            {/* Card Footer: Submitter, Location, Upvotes, Focus Action */}
                            <div className="pt-2 border-t border-[#F0EBE3] flex items-center justify-between text-[11px] text-[#5C4A42]">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#2C1810]">
                                  {comp.submitter_name || 'Verified Citizen'}
                                </span>
                                <span>•</span>
                                <span className="text-[#8C7A70]">
                                  {comp.location_name || comp.state_province}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={(e) => handleUpvoteComplaint(comp.id, e)}
                                  className="flex items-center gap-1 text-[#6F4E37] hover:text-[#2C1810] font-semibold"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{comp.upvotes || 1}</span>
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFocusComplaintPin(comp);
                                  }}
                                  className="text-[10px] font-bold text-[#D4A373] hover:text-[#6F4E37] flex items-center gap-0.5"
                                >
                                  <span>Pin</span>
                                  <MapPin className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: METRICS & SROI */}
              {activeRightTab === 'metrics' && (
                <div className="space-y-4">
                  {/* 2x2 Grid of Metric Cards */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-[#FDFBF7] rounded-lg border border-[#E8E0D5] space-y-0.5">
                      <div className="text-label text-[10px]">Citizen Signals</div>
                      <div className="text-xl font-bold font-mono text-[#2C1810]">{selectedHotspot.request_count}</div>
                      <div className="text-[10px] text-[#9C8C84]">Verified reports</div>
                    </div>

                    <div className="p-3 bg-[#FDFBF7] rounded-lg border border-[#E8E0D5] space-y-0.5">
                      <div className="text-label text-[10px]">Deficit Score</div>
                      <div className="text-xl font-bold font-mono text-[#C78D3F]">{Math.round(selectedHotspot.infrastructure_deficit_index * 100)}%</div>
                      <div className="text-[10px] text-[#9C8C84]">National baseline</div>
                    </div>

                    <div className="p-3 bg-[#FDFBF7] rounded-lg border border-[#E8E0D5] space-y-0.5">
                      <div className="text-label text-[10px]">People Impacted</div>
                      <div className="text-xl font-bold font-mono text-[#2C1810]">{selectedHotspot.estimated_affected_population.toLocaleString()}</div>
                      <div className="text-[10px] text-[#9C8C84]">District radius</div>
                    </div>

                    <div className="p-3 bg-[#FDFBF7] rounded-lg border border-[#E8E0D5] space-y-0.5">
                      <div className="text-label text-[10px]">Urgency Index</div>
                      <div className="text-xl font-bold font-mono text-[#B54A4A]">{selectedHotspot.avg_urgency_score}</div>
                      <div className="text-[10px] text-[#9C8C84]">0.0 to 1.0 scale</div>
                    </div>
                  </div>

                  {/* WHY THIS MATTERS */}
                  <div className="space-y-1.5">
                    <div className="text-label text-[10px]">WHY THIS MATTERS (GROUND REALITY)</div>
                    <div className="space-y-2">
                      {selectedHotspot.sample_requests?.slice(0, 2).map((text, idx) => (
                        <div key={idx} className="p-2.5 bg-[#FDFBF7] border-l-[3px] border-[#6F4E37] text-xs text-[#5C4A42] leading-relaxed italic rounded-r-lg">
                          "{text}"
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions Bottom Bar */}
              <div className="pt-2 border-t border-[#F0EBE3] space-y-2">
                <button
                  onClick={() => onSelectProject(selectedHotspot)}
                  className="btn-primary w-full justify-center text-xs py-2.5"
                >
                  <span>Prioritize Project & SROI for {selectedHotspot.state_province}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenCopilot('brief', selectedHotspot)}
                  className="btn-secondary w-full justify-center text-xs py-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Draft Policy Brief for {selectedHotspot.state_province}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="card-coffee p-8 text-center text-[#9C8C84] text-xs space-y-2">
              <MapPin className="w-8 h-8 text-[#D4A373] mx-auto opacity-60" />
              <p className="font-bold text-[#2C1810]">No Hotspot Selected</p>
              <p>Click on any hotspot dot (e.g. Karnataka) or individual complaint marker on the map to inspect filed grievances.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

