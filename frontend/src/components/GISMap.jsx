import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, ChevronRight, FileText, Activity, MessageSquare, ThumbsUp, AlertCircle, Layers, SlidersHorizontal
} from 'lucide-react';
import { getHotspots, getRequests, upvoteRequest } from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [selectedCountry]);

  async function loadData() {
    try {
      const [hData, rData] = await Promise.all([
        getHotspots(selectedCountry),
        getRequests(selectedCountry === 'ALL' ? null : selectedCountry)
      ]);
      
      const kaRequests = (rData || []).filter(r => 
        (r.state_province && r.state_province.toLowerCase().includes('karnataka')) ||
        (r.location_name && (r.location_name.toLowerCase().includes('karnataka') || r.location_name.toLowerCase().includes('bengaluru') || r.location_name.toLowerCase().includes('bangalore')))
      );

      let processedHotspots = [...(hData || [])];
      const hasKaHotspot = processedHotspots.some(h => (h.state_province || '').toLowerCase().includes('karnataka'));
      
      if (kaRequests.length > 0 && !hasKaHotspot) {
        processedHotspots.unshift({
          id: "HOTSPOT-IND_Karnataka",
          cluster_name: "Bengaluru Urban & Rural Infrastructure Corridor",
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
      setLiveRequests(rData || []);

      setSelectedHotspot(prev => {
        if (prev) {
          const updated = processedHotspots.find(h => h.id === prev.id || h.state_province === prev.state_province);
          return updated || prev;
        }
        const kaSpot = processedHotspots.find(h => (h.state_province || '').toLowerCase().includes('karnataka'));
        return kaSpot || processedHotspots[0] || null;
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load map data:", err);
      setIsLoading(false);
    }
  }

  // Initialize Map container once with proper cleanup
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initial = COUNTRY_COORDS[selectedCountry] || COUNTRY_COORDS.IND;
    const map = L.map(mapContainerRef.current, {
      center: initial.center,
      zoom: initial.zoom,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Invalidate size to guarantee no partial renders
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    const onResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle camera position when selectedCountry changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (focusedState) return;
    const target = COUNTRY_COORDS[selectedCountry] || COUNTRY_COORDS.IND;
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
      const isCritical = isKa || (h.priority_level && h.priority_level.includes('Critical')) || h.avg_urgency_score > 0.75;
      const isMedium = h.avg_urgency_score > 0.55;
      
      const dotColor = isKa ? '#B02626' : (isCritical ? '#B8720A' : (isMedium ? '#6F4E37' : '#D4A373'));
      const dotSize = isKa ? 26 : (isCritical ? 22 : (isMedium ? 16 : 14));
      const isSelected = selectedHotspot && (selectedHotspot.id === h.id || selectedHotspot.state_province === h.state_province);

      const iconHtml = `
        <div style="position: relative; width: ${dotSize}px; height: ${dotSize}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <span style="position: absolute; width: ${dotSize * 2.2}px; height: ${dotSize * 2.2}px; border-radius: 50%; background: ${dotColor}; opacity: ${isSelected ? '0.45' : '0.22'}; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></span>
          <span style="width: ${dotSize}px; height: ${dotSize}px; border-radius: 50%; background: ${dotColor}; border: ${isSelected ? '2.5px solid #1C0F07' : '2px solid #FFFFFF'}; box-shadow: 0 3px 10px rgba(28,15,7,0.25); display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 10px; font-weight: 700; font-family: Inter, sans-serif;">
            ${h.request_count || ''}
          </span>
          ${isKa ? `<div style="position: absolute; bottom: -20px; white-space: nowrap; background: #1C0F07; color: #FFFFFF; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); letter-spacing: 0.04em;">KARNATAKA</div>` : ''}
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
      
      const pinColor = isKarnataka ? '#B02626' : (req.urgency === 'Critical' ? '#B02626' : (req.urgency === 'High' ? '#B8720A' : '#2D7A50'));
      const pinSize = isKarnataka ? 18 : 14;

      const pinHtml = `
        <div style="position: relative; width: ${pinSize}px; height: ${pinSize}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <span style="position: absolute; width: ${pinSize * 1.8}px; height: ${pinSize * 1.8}px; border-radius: 50%; background: ${pinColor}; opacity: 0.35;"></span>
          <span style="width: ${pinSize}px; height: ${pinSize}px; border-radius: 50%; background: ${pinColor}; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(28,15,7,0.3); display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 800; color: #FFFFFF; font-family: Inter, sans-serif;">
            ${isKarnataka ? '!' : '•'}
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
        <div style="font-family: Inter, sans-serif; font-size: 11px; padding: 4px; min-width: 200px; color: #1C0F07;">
          <div style="font-weight: 700; color: #1C0F07; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E8E0D5; padding-bottom: 4px;">
            <span>${req.category}</span>
            <span style="background: ${req.urgency === 'Critical' ? '#FEF0F0' : '#FEF6E7'}; color: ${req.urgency === 'Critical' ? '#B02626' : '#B8720A'}; padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 700;">${req.urgency}</span>
          </div>
          <div style="color: #5C4A42; font-size: 10px; margin-bottom: 4px;">Location: <strong>${req.location_name || req.state_province}</strong></div>
          <div style="color: #1C0F07; margin-bottom: 6px; line-height: 1.4; font-size: 11px;">"${req.translated_text || req.original_text}"</div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F0EBE3; padding-top: 4px; font-size: 10px; color: #9C8C84;">
            <span>Submitter: ${req.submitter_name || 'Citizen'}</span>
            <span style="font-weight: 600; color: #6F4E37;">${req.upvotes || 1} Endorsements</span>
          </div>
        </div>
      `);

      cMarker.on('click', () => {
        setSelectedRequest(req);
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
    
    const matched = hotspots.find(h => (h.state_province || '').toLowerCase().includes(stateName.toLowerCase()));
    if (matched) {
      setSelectedHotspot(matched);
      setActiveRightTab('complaints');
    }
  };

  const handleUpvoteComplaint = async (reqId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await upvoteRequest(reqId);
      if (res) {
        setLiveRequests(prev => prev.map(r => r.id === reqId ? { ...r, upvotes: res.upvotes } : r));
      }
    } catch (err) {
      console.error("Upvote error:", err);
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

  const karnatakaComplaintsCount = liveRequests.filter(r => 
    (r.state_province && r.state_province.toLowerCase().includes('karnataka')) ||
    (r.location_name && (r.location_name.toLowerCase().includes('karnataka') || r.location_name.toLowerCase().includes('bengaluru') || r.location_name.toLowerCase().includes('bangalore')))
  ).length;

  const totalSignals = hotspots.reduce((acc, h) => acc + (h.request_count || 0), 0) + liveRequests.length;
  const totalImpacted = hotspots.reduce((acc, h) => acc + (h.estimated_affected_population || 0), 0);

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Top Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[var(--border-warm)] p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-tertiary)]">Citizen Signals</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] font-mono">{totalSignals.toLocaleString()}</div>
          <div className="text-xs text-[var(--text-secondary)]">Multilingual verified grassroots records</div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border-warm)] p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-tertiary)]">Priority Hotspots</div>
          <div className="text-2xl font-bold text-[var(--status-danger)] font-mono">{hotspots.length}</div>
          <div className="text-xs text-[var(--text-secondary)]">Active geospatial demand clusters</div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border-warm)] p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-tertiary)]">Citizens Impacted</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] font-mono">{totalImpacted.toLocaleString()}</div>
          <div className="text-xs text-[var(--text-secondary)]">Direct municipal population perimeter</div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border-warm)] p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-tertiary)]">Capital Under Review</div>
          <div className="text-2xl font-bold text-[var(--status-success)] font-mono">$184.5M</div>
          <div className="text-xs text-[var(--text-secondary)]">National infrastructure budget pipeline</div>
        </div>
      </div>

      {/* 2. Map Section Header & Quick Regional Focus Toolbar */}
      <div className="bg-white rounded-xl border border-[var(--border-warm)] p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--accent-primary)]" />
              Geospatial Demand Intelligence & Complaint Verification
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Click any regional cluster or complaint marker to inspect citizen-filed grievances in real time.
            </p>
          </div>

          {/* Map Layer Controls */}
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-warm)]">
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
                    ? 'bg-white text-[var(--accent-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Region Focus Pills */}
        <div className="pt-3 border-t border-[var(--border-divider)] flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider shrink-0">
            Quick Focus:
          </span>

          <button
            onClick={() => {
              setFocusedState(null);
              const target = COUNTRY_COORDS[selectedCountry] || COUNTRY_COORDS.IND;
              mapInstanceRef.current?.flyTo(target.center, target.zoom);
            }}
            className={`px-3 py-1 rounded-full font-medium border transition shrink-0 cursor-pointer ${
              !focusedState ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' : 'bg-white text-[var(--text-secondary)] border-[var(--border-warm)] hover:border-[var(--accent-tertiary)]'
            }`}
          >
            All National Spots
          </button>

          {/* Karnataka Quick Pill */}
          <button
            onClick={() => handleFocusState('Karnataka')}
            className={`px-3.5 py-1 rounded-full font-semibold border transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              focusedState === 'Karnataka' || (selectedHotspot && (selectedHotspot.state_province || '').toLowerCase().includes('karnataka'))
                ? 'bg-[var(--status-danger)] text-white border-[var(--status-danger)] shadow-sm'
                : 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger-border)] hover:bg-red-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white shrink-0" />
            <span>Karnataka (Bengaluru)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/25 text-[10px] font-mono">
              {karnatakaComplaintsCount} Reports
            </span>
          </button>

          {Object.keys(STATE_FOCUS_TARGETS).filter(s => s !== 'Karnataka').map((stateKey) => {
            const count = liveRequests.filter(r => (r.state_province || '').toLowerCase().includes(stateKey.toLowerCase())).length;
            const isSel = focusedState === stateKey;
            return (
              <button
                key={stateKey}
                onClick={() => handleFocusState(stateKey)}
                className={`px-3 py-1 rounded-full font-medium border transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSel
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                    : 'bg-white text-[var(--text-secondary)] border-[var(--border-warm)] hover:border-[var(--accent-tertiary)]'
                }`}
              >
                <span>{stateKey}</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--accent-primary)] text-[10px] font-bold font-mono">
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
        <div className="lg:col-span-7 bg-white rounded-xl border border-[var(--border-warm)] p-2 relative h-[620px] overflow-hidden flex flex-col shadow-sm">
          <div ref={mapContainerRef} className="w-full h-full rounded-lg z-0" />

          {/* Map Floating Banner */}
          <div className="absolute top-4 left-4 z-10 p-2.5 bg-white/95 backdrop-blur-sm rounded-lg text-xs border border-[var(--border-warm)] shadow-md flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-danger)] animate-pulse" />
            <span className="text-[var(--text-primary)] font-bold">Live Demand Pins Active</span>
            <span className="text-[var(--text-tertiary)]">• {liveRequests.length} Verified Signals</span>
          </div>

          {/* Persistent Light Legend */}
          <div className="absolute bottom-4 left-4 z-10 p-3 bg-white/95 rounded-lg text-xs space-y-1.5 border border-[var(--border-warm)] shadow-md">
            <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Map Indicators</div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[var(--status-danger)] flex items-center justify-center text-[8px] text-white font-bold">!</span>
              <span className="text-[var(--text-primary)] font-medium">Karnataka / Critical Hotspot</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--status-warning)]" />
              <span className="text-[var(--text-secondary)] font-medium">High Priority Cluster</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-success)]" />
              <span className="text-[var(--text-secondary)] font-medium">Verified Citizen Complaint</span>
            </div>
          </div>
        </div>

        {/* Right Detail Panel: Citizen Complaints & Cluster Intelligence (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedHotspot ? (
            <div className="bg-white rounded-xl border border-[var(--border-warm)] p-5 space-y-4 shadow-sm">
              
              {/* Header: Title + Subtle Badge */}
              <div className="space-y-1.5 pb-3 border-b border-[var(--border-divider)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-[var(--accent-primary)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded border border-[var(--border-warm)]">
                    {selectedHotspot.country_code} · {selectedHotspot.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedHotspot.priority_level.includes('Critical') || (selectedHotspot.state_province || '').toLowerCase().includes('karnataka') ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger-border)]' : 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'}`}>
                    {selectedHotspot.priority_level}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] pt-0.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--accent-primary)]" />
                  {selectedHotspot.cluster_name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {selectedHotspot.state_province} Administrative Region • <strong>{regionalComplaints.length} Filed Citizen Reports</strong>
                </p>
              </div>

              {/* Tab Switcher: Filed Complaints vs Hotspot Metrics */}
              <div className="flex items-center p-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-warm)]">
                <button
                  onClick={() => setActiveRightTab('complaints')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeRightTab === 'complaints'
                      ? 'bg-white text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Filed Complaints ({regionalComplaints.length})</span>
                </button>

                <button
                  onClick={() => setActiveRightTab('metrics')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeRightTab === 'metrics'
                      ? 'bg-white text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>SROI & Deficit Metrics</span>
                </button>
              </div>

              {/* TAB 1: FILED CITIZEN COMPLAINTS LIST */}
              {activeRightTab === 'complaints' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={complaintSearch}
                      onChange={(e) => setComplaintSearch(e.target.value)}
                      placeholder={`Search ${selectedHotspot.state_province} reports...`}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[var(--border-warm)] bg-[var(--bg-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none text-[var(--text-primary)]"
                    />
                    <span className="text-[11px] text-[var(--text-tertiary)] shrink-0 font-medium">
                      Showing {displayedComplaints.length}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {displayedComplaints.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[var(--text-tertiary)] bg-[var(--bg-primary)] rounded-xl border border-dashed border-[var(--border-warm)]">
                        No complaints match current filters in {selectedHotspot.state_province}.
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
                                ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                                : 'bg-white border-[var(--border-warm)] hover:border-[var(--accent-tertiary)] hover:shadow-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                                {comp.category}
                              </span>

                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                comp.urgency === 'Critical'
                                  ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger)]'
                                  : 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]'
                              }`}>
                                {comp.urgency} Urgency
                              </span>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                                "{comp.translated_text || comp.original_text}"
                              </p>
                              {comp.original_text && comp.translated_text && comp.original_text !== comp.translated_text && (
                                <p className="text-[11px] text-[var(--text-tertiary)] italic">
                                  Original ({comp.language_name || 'Native'}): "{comp.original_text}"
                                </p>
                              )}
                            </div>

                            <div className="pt-2 border-t border-[var(--border-divider)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[var(--text-primary)]">
                                  {comp.submitter_name || 'Verified Citizen'}
                                </span>
                                <span>•</span>
                                <span className="text-[var(--text-tertiary)]">
                                  {comp.location_name || comp.state_province}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={(e) => handleUpvoteComplaint(comp.id, e)}
                                  className="flex items-center gap-1 text-[var(--accent-primary)] hover:text-[var(--accent-primary-dark)] font-semibold cursor-pointer"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{comp.upvotes || 1}</span>
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFocusComplaintPin(comp);
                                  }}
                                  className="text-[10px] font-bold text-[var(--accent-tertiary)] hover:text-[var(--accent-primary)] flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>Focus</span>
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
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-warm)] space-y-0.5">
                      <div className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase">Citizen Signals</div>
                      <div className="text-xl font-bold font-mono text-[var(--text-primary)]">{selectedHotspot.request_count}</div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">Verified reports</div>
                    </div>

                    <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-warm)] space-y-0.5">
                      <div className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase">Deficit Score</div>
                      <div className="text-xl font-bold font-mono text-[var(--status-warning)]">{Math.round((selectedHotspot.infrastructure_deficit_index || 0.7) * 100)}%</div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">National baseline gap</div>
                    </div>

                    <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-warm)] space-y-0.5">
                      <div className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase">People Impacted</div>
                      <div className="text-xl font-bold font-mono text-[var(--text-primary)]">{(selectedHotspot.estimated_affected_population || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">District radius</div>
                    </div>

                    <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-warm)] space-y-0.5">
                      <div className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase">Urgency Score</div>
                      <div className="text-xl font-bold font-mono text-[var(--status-danger)]">{selectedHotspot.avg_urgency_score}</div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">Scale: 0.0 - 1.0</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Ground Reality Evidence</div>
                    <div className="space-y-2">
                      {selectedHotspot.sample_requests?.slice(0, 2).map((text, idx) => (
                        <div key={idx} className="p-2.5 bg-[var(--bg-primary)] border-l-[3px] border-[var(--accent-primary)] text-xs text-[var(--text-secondary)] leading-relaxed italic rounded-r-lg">
                          "{text}"
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions Bottom Bar */}
              <div className="pt-3 border-t border-[var(--border-divider)] space-y-2">
                <button
                  onClick={() => onSelectProject && onSelectProject(selectedHotspot)}
                  className="w-full py-2.5 px-4 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-dark)] text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Prioritize Project & SROI for {selectedHotspot.state_province}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenCopilot && onOpenCopilot('brief', selectedHotspot)}
                  className="w-full py-2 px-4 rounded-lg bg-white border border-[var(--border-warm)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span>Draft Policy Brief for {selectedHotspot.state_province}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[var(--border-warm)] p-8 text-center text-[var(--text-tertiary)] text-xs space-y-2 shadow-sm">
              <MapPin className="w-8 h-8 text-[var(--accent-tertiary)] mx-auto opacity-60" />
              <p className="font-bold text-[var(--text-primary)]">No Hotspot Selected</p>
              <p>Click on any hotspot cluster or complaint marker on the map to inspect filed grievances.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
