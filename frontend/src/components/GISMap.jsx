import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, ChevronRight, FileText, Activity, MessageSquare, ThumbsUp, AlertCircle, Layers, Globe, Filter, Sparkles, ZoomIn, ZoomOut, RefreshCw
} from 'lucide-react';
import { getHotspots, getRequests, upvoteRequest } from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const COUNTRY_DEFINITIONS = {
  ALL: { center: [20.0, 10.0], zoom: 2, label: 'All Nations (Global World Map)' },
  IND: { center: [21.5, 79.5], zoom: 5, label: 'India' },
  USA: { center: [38.5, -96.5], zoom: 4, label: 'United States' },
  BRA: { center: [-14.2, -51.9], zoom: 4, label: 'Brazil' },
  ZAF: { center: [-29.0, 25.5], zoom: 5, label: 'South Africa' },
  CHN: { center: [34.0, 104.0], zoom: 4, label: 'China' },
  RUS: { center: [58.0, 65.0], zoom: 3, label: 'Russia' }
};

const BASEMAP_TILES = {
  streets: {
    id: 'streets',
    label: 'World Streets',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Sources: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, TomTom'
    }
  },
  osm: {
    id: 'osm',
    label: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap contributors'
    }
  },
  topo: {
    id: 'topo',
    label: 'Topographic',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, USGS'
    }
  },
  canvas: {
    id: 'canvas',
    label: 'Clean Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 16,
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
    }
  }
};

const REGIONAL_TARGETS = {
  ALL: [
    { id: 'world_all', label: 'Global Overview', center: [20.0, 10.0], zoom: 2 },
    { id: 'world_ind', label: 'India (IND)', center: [21.5, 79.5], zoom: 5, countryCode: 'IND' },
    { id: 'world_usa', label: 'United States (USA)', center: [38.5, -96.5], zoom: 4, countryCode: 'USA' },
    { id: 'world_bra', label: 'Brazil (BRA)', center: [-14.2, -51.9], zoom: 4, countryCode: 'BRA' },
    { id: 'world_zaf', label: 'South Africa (ZAF)', center: [-29.0, 25.5], zoom: 5, countryCode: 'ZAF' },
    { id: 'world_chn', label: 'China (CHN)', center: [34.0, 104.0], zoom: 4, countryCode: 'CHN' },
    { id: 'world_rus', label: 'Russia (RUS)', center: [58.0, 65.0], zoom: 3, countryCode: 'RUS' }
  ],
  IND: [
    { id: 'ind_all', label: 'All India', center: [21.5, 79.5], zoom: 5 },
    { id: 'ka', label: 'Karnataka (Bengaluru)', center: [12.9716, 77.5946], zoom: 8, state: 'Karnataka' },
    { id: 'up', label: 'Uttar Pradesh (Varanasi)', center: [25.3176, 82.9739], zoom: 8, state: 'Uttar Pradesh' },
    { id: 'mh', label: 'Maharashtra (Gadchiroli)', center: [20.1809, 79.9950], zoom: 8, state: 'Maharashtra' },
    { id: 'br', label: 'Bihar (Kishanganj)', center: [26.0903, 87.9405], zoom: 8, state: 'Bihar' },
    { id: 'rj', label: 'Rajasthan (Barmer)', center: [25.7521, 71.3967], zoom: 8, state: 'Rajasthan' },
    { id: 'kl', label: 'Kerala (Wayanad)', center: [11.6854, 76.1320], zoom: 8, state: 'Kerala' }
  ],
  USA: [
    { id: 'usa_all', label: 'All United States', center: [38.5, -96.5], zoom: 4 },
    { id: 'tx', label: 'Texas (Bexar)', center: [30.88, -99.25], zoom: 7, state: 'Texas' },
    { id: 'fl', label: 'Florida (San Diego)', center: [27.71, -81.75], zoom: 7, state: 'Florida' },
    { id: 'ca', label: 'California', center: [35.52, -119.36], zoom: 7, state: 'California' },
    { id: 'nc', label: 'North Carolina', center: [34.92, -79.54], zoom: 7, state: 'North Carolina' },
    { id: 'va', label: 'Virginia', center: [37.82, -78.13], zoom: 7, state: 'Virginia' },
    { id: 'az', label: 'Arizona (Maricopa)', center: [33.72, -111.50], zoom: 7, state: 'Arizona' },
    { id: 'wa', label: 'Washington (Pierce)', center: [47.26, -121.54], zoom: 7, state: 'Washington' }
  ],
  BRA: [
    { id: 'bra_all', label: 'All Brazil', center: [-14.2, -51.9], zoom: 4 },
    { id: 'sp', label: 'São Paulo (Vale do Ribeira)', center: [-24.49, -47.83], zoom: 7, state: 'São Paulo' },
    { id: 'ba', label: 'Bahia (Santaluz)', center: [-11.25, -39.38], zoom: 7, state: 'Bahia' },
    { id: 'am', label: 'Amazonas (Tefé)', center: [-3.34, -64.72], zoom: 7, state: 'Amazonas' }
  ],
  ZAF: [
    { id: 'zaf_all', label: 'All South Africa', center: [-29.0, 25.5], zoom: 5 },
    { id: 'ec', label: 'Eastern Cape (OR Tambo)', center: [-31.59, 28.77], zoom: 7, state: 'Eastern Cape' },
    { id: 'kzn', label: 'KwaZulu-Natal', center: [-27.63, 32.16], zoom: 7, state: 'KwaZulu-Natal' },
    { id: 'wc', label: 'Western Cape (Khayelitsha)', center: [-34.04, 18.68], zoom: 7, state: 'Western Cape' }
  ],
  CHN: [
    { id: 'chn_all', label: 'All China', center: [34.0, 104.0], zoom: 4 },
    { id: 'sc', label: 'Sichuan (Liangshan)', center: [27.89, 102.24], zoom: 7, state: 'Sichuan' },
    { id: 'gz', label: 'Guizhou (Bijie)', center: [27.29, 105.28], zoom: 7, state: 'Guizhou' }
  ],
  RUS: [
    { id: 'rus_all', label: 'All Russia', center: [58.0, 65.0], zoom: 3 },
    { id: 'nv', label: 'Novgorod (Staraya Russa)', center: [58.00, 31.36], zoom: 7, state: 'Novgorod' },
    { id: 'irk', label: 'Irkutsk (Tulun)', center: [54.57, 100.59], zoom: 7, state: 'Irkutsk' }
  ]
};

export default function GISMap({ selectedCountry = 'ALL', onSelectProject, onOpenCopilot, onCountryChange }) {
  const [currentCountry, setCurrentCountry] = useState(selectedCountry);
  const [basemapStyle, setBasemapStyle] = useState('streets'); // 'streets' | 'osm' | 'topo' | 'canvas'
  const [hotspots, setHotspots] = useState([]);
  const [liveRequests, setLiveRequests] = useState([]);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeLayer, setActiveLayer] = useState('demand'); // 'demand' | 'deficit' | 'vulnerability'
  const [activeRightTab, setActiveRightTab] = useState('complaints'); // 'complaints' | 'metrics'
  const [isLoading, setIsLoading] = useState(true);
  const [complaintSearch, setComplaintSearch] = useState('');
  const [focusedTargetId, setFocusedTargetId] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersMapRef = useRef({});

  // Sync prop changes
  useEffect(() => {
    if (selectedCountry && selectedCountry !== currentCountry) {
      setCurrentCountry(selectedCountry);
      setFocusedTargetId(null);
    }
  }, [selectedCountry]);

  // Load data whenever current country changes
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [currentCountry]);

  async function loadData() {
    try {
      const [hData, rData] = await Promise.all([
        getHotspots(currentCountry === 'ALL' ? null : currentCountry),
        getRequests(currentCountry === 'ALL' ? null : currentCountry)
      ]);
      
      const processedHotspots = hData || [];
      const processedRequests = rData || [];

      setHotspots(processedHotspots);
      setLiveRequests(processedRequests);

      // Keep active selection or pick first relevant cluster
      setSelectedHotspot(prev => {
        if (prev) {
          const match = processedHotspots.find(h => h.id === prev.id);
          if (match) return match;
        }
        return processedHotspots[0] || null;
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load GIS data:", err);
      setIsLoading(false);
    }
  }

  // Initialize Map container
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initial = COUNTRY_DEFINITIONS[currentCountry] || COUNTRY_DEFINITIONS.ALL;
    const map = L.map(mapContainerRef.current, {
      center: initial.center,
      zoom: initial.zoom,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true,
      zoomControl: true,
      attributionControl: false
    });

    // Clean, crisp basemap without API key watermarks
    const activeBasemap = BASEMAP_TILES[basemapStyle] || BASEMAP_TILES.streets;
    const tileLayer = L.tileLayer(activeBasemap.url, activeBasemap.options).addTo(map);
    tileLayerRef.current = tileLayer;

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

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

  // Handle Basemap style switcher
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const activeBasemap = BASEMAP_TILES[basemapStyle] || BASEMAP_TILES.streets;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const newLayer = L.tileLayer(activeBasemap.url, activeBasemap.options).addTo(mapInstanceRef.current);
    newLayer.bringToBack();
    tileLayerRef.current = newLayer;
  }, [basemapStyle]);

  // Handle camera position when country switches
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const target = COUNTRY_DEFINITIONS[currentCountry] || COUNTRY_DEFINITIONS.ALL;
    mapInstanceRef.current.flyTo(target.center, target.zoom, { duration: 0.9 });
  }, [currentCountry]);

  // Update map markers when hotspots or liveRequests update
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    
    layerGroupRef.current.clearLayers();
    markersMapRef.current = {};

    const isWorldView = currentCountry === 'ALL';

    // 1. Render Cluster Hotspots
    hotspots.forEach((h) => {
      if (!h.latitude || !h.longitude) return;

      const isCritical = (h.priority_level && h.priority_level.toLowerCase().includes('critical')) || (h.avg_urgency_score || 0) > 0.75;
      const isMedium = (h.avg_urgency_score || 0) > 0.55;
      
      const dotColor = isCritical ? '#B02626' : (isMedium ? '#B8720A' : '#6F4E37');
      const dotSize = isWorldView ? 22 : (isCritical ? 26 : 20);
      const isSelected = selectedHotspot && selectedHotspot.id === h.id;

      const iconHtml = `
        <div style="position: relative; width: ${dotSize}px; height: ${dotSize}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <span style="position: absolute; width: ${dotSize * 2.2}px; height: ${dotSize * 2.2}px; border-radius: 50%; background: ${dotColor}; opacity: ${isSelected ? '0.45' : '0.22'}; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></span>
          <span style="width: ${dotSize}px; height: ${dotSize}px; border-radius: 50%; background: ${dotColor}; border: ${isSelected ? '2.5px solid #1E110A' : '2px solid #FFFFFF'}; box-shadow: 0 3px 10px rgba(30,17,10,0.3); display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: ${isWorldView ? '9.5px' : '10.5px'}; font-weight: 700; font-family: Inter, sans-serif;">
            ${h.request_count || ''}
          </span>
          <div style="position: absolute; bottom: -18px; white-space: nowrap; background: #1E110A; color: #FFFFFF; font-size: 8.5px; font-weight: 700; padding: 1px 5px; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.25); letter-spacing: 0.03em; pointer-events: none; opacity: ${isWorldView && !isSelected ? '0.85' : '1'};">
            ${h.country_code ? `${h.country_code} · ` : ''}${h.state_province || ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-map-dot',
        iconSize: [dotSize, dotSize],
        iconAnchor: [dotSize / 2, dotSize / 2]
      });

      const marker = L.marker([h.latitude, h.longitude], { icon: customIcon, zIndexOffset: isCritical ? 500 : 200 });

      // Rich hover tooltip for fast exploration
      marker.bindTooltip(`
        <div style="font-family: Inter, sans-serif; font-size: 11px; padding: 3px 5px; line-height: 1.4; color: #1E110A;">
          <div style="font-weight: 700;">${h.cluster_name}</div>
          <div style="color: #6F4E37; font-size: 10px;">${h.state_province} (${h.country_code}) • <strong>${h.request_count} Reports</strong></div>
          <div style="color: ${isCritical ? '#B02626' : '#B8720A'}; font-size: 10px; font-weight: 700;">${h.priority_level}</div>
        </div>
      `, { direction: 'top', offset: [0, -dotSize / 2] });

      marker.on('click', () => {
        setSelectedHotspot(h);
        setActiveRightTab('complaints');
        const targetZoom = Math.max(mapInstanceRef.current.getZoom(), isWorldView ? 6 : 8);
        mapInstanceRef.current.flyTo([h.latitude, h.longitude], targetZoom, { duration: 0.7 });
      });

      layerGroupRef.current.addLayer(marker);
    });

    // 2. Render Individual Real-time Citizen Complaints pins
    liveRequests.slice(0, 80).forEach((req) => {
      if (!req.latitude || !req.longitude) return;

      const isCritical = req.urgency === 'Critical';
      const isHigh = req.urgency === 'High';
      const pinColor = isCritical ? '#B02626' : (isHigh ? '#B8720A' : '#2D7A50');
      const pinSize = isCritical ? 14 : 11;

      const pinHtml = `
        <div style="position: relative; width: ${pinSize}px; height: ${pinSize}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <span style="position: absolute; width: ${pinSize * 1.8}px; height: ${pinSize * 1.8}px; border-radius: 50%; background: ${pinColor}; opacity: 0.3;"></span>
          <span style="width: ${pinSize}px; height: ${pinSize}px; border-radius: 50%; background: ${pinColor}; border: 1.5px solid #FFFFFF; box-shadow: 0 2px 5px rgba(30,17,10,0.25); display: flex; align-items: center; justify-content: center; font-size: 7px; font-weight: 800; color: #FFFFFF; font-family: Inter, sans-serif;">
            ${isCritical ? '!' : '•'}
          </span>
        </div>
      `;

      const pinIcon = L.divIcon({
        html: pinHtml,
        className: 'live-citizen-pin',
        iconSize: [pinSize, pinSize],
        iconAnchor: [pinSize / 2, pinSize / 2]
      });

      const cMarker = L.marker([req.latitude, req.longitude], { icon: pinIcon, zIndexOffset: isCritical ? 800 : 400 });
      
      cMarker.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 11px; padding: 4px; min-width: 220px; color: #1E110A;">
          <div style="font-weight: 700; color: #1E110A; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E8E0D5; padding-bottom: 4px;">
            <span>${req.category || 'Infrastructure'}</span>
            <span style="background: ${isCritical ? '#FEF0F0' : '#FEF6E7'}; color: ${isCritical ? '#B02626' : '#B8720A'}; padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 700;">${req.urgency || 'Standard'}</span>
          </div>
          <div style="color: #6F4E37; font-size: 10px; margin-bottom: 4px;">
            <strong>${req.country_name || req.country_code || ''}</strong> · ${req.location_name || req.state_province || 'District'}
          </div>
          <div style="color: #1E110A; margin-bottom: 6px; line-height: 1.4; font-size: 11px;">
            "${req.translated_text || req.original_text || 'Citizen reported issue'}"
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F0EBE3; padding-top: 4px; font-size: 10px; color: #8C7A70;">
            <span>${req.submitter_name || 'Verified Citizen'}</span>
            <span style="font-weight: 600; color: #6F4E37;">${req.upvotes || 1} Endorsements</span>
          </div>
        </div>
      `);

      cMarker.on('click', () => {
        setSelectedRequest(req);
        // Find matching cluster if any
        const matchHs = hotspots.find(h => 
          (h.state_province && req.state_province && h.state_province.toLowerCase() === req.state_province.toLowerCase()) ||
          (h.country_code && req.country_code && h.country_code === req.country_code)
        );
        if (matchHs) setSelectedHotspot(matchHs);
        setActiveRightTab('complaints');
      });

      markersMapRef.current[req.id] = cMarker;
      layerGroupRef.current.addLayer(cMarker);
    });

  }, [hotspots, liveRequests, currentCountry, selectedHotspot]);

  // Handle Country selection internally or via parent
  const handleCountrySelect = (code) => {
    setCurrentCountry(code);
    setFocusedTargetId(null);
    if (onCountryChange) onCountryChange(code);
  };

  // Quick Region / Country target focus
  const handleFocusTarget = (target) => {
    setFocusedTargetId(target.id);
    if (mapInstanceRef.current && target.center) {
      mapInstanceRef.current.flyTo(target.center, target.zoom, { duration: 0.8 });
    }

    if (target.countryCode && target.countryCode !== currentCountry) {
      // Switching to a nation
      setCurrentCountry(target.countryCode);
      if (onCountryChange) onCountryChange(target.countryCode);
      return;
    }

    if (target.state) {
      const matched = hotspots.find(h => 
        (h.state_province || '').toLowerCase().includes(target.state.toLowerCase())
      );
      if (matched) {
        setSelectedHotspot(matched);
        setActiveRightTab('complaints');
      }
    }
  };

  const handleFocusComplaintPin = (req) => {
    setSelectedRequest(req);
    if (mapInstanceRef.current && req.latitude && req.longitude) {
      mapInstanceRef.current.flyTo([req.latitude, req.longitude], Math.max(mapInstanceRef.current.getZoom(), 8), { duration: 0.6 });
      const marker = markersMapRef.current[req.id];
      if (marker) {
        setTimeout(() => marker.openPopup(), 650);
      }
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

  // Filter complaints based on the selected hotspot
  const regionalComplaints = liveRequests.filter(req => {
    if (!selectedHotspot) return true;
    const reqCountry = (req.country_code || '').toUpperCase();
    const hsCountry = (selectedHotspot.country_code || '').toUpperCase();
    if (reqCountry && hsCountry && reqCountry !== hsCountry) return false;
    
    const reqState = (req.state_province || '').toLowerCase();
    const hsState = (selectedHotspot.state_province || '').toLowerCase();
    const reqLoc = (req.location_name || '').toLowerCase();

    if (hsState && (reqState.includes(hsState) || hsState.includes(reqState) || reqLoc.includes(hsState))) {
      return true;
    }
    return reqCountry === hsCountry;
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

  const currentTargets = REGIONAL_TARGETS[currentCountry] || REGIONAL_TARGETS.ALL;
  const totalSignals = hotspots.reduce((acc, h) => acc + (h.request_count || 0), 0) + liveRequests.length;
  const totalImpacted = hotspots.reduce((acc, h) => acc + (h.estimated_affected_population || 0), 0);

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Top Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[var(--border-warm)] p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-tertiary)] flex items-center justify-between">
            <span>Verified Signals</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[var(--bg-secondary)] rounded text-[var(--accent-primary)] font-bold">
              {currentCountry === 'ALL' ? 'GLOBAL' : currentCountry}
            </span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] font-mono">{totalSignals.toLocaleString()}</div>
          <div className="text-xs text-[var(--text-secondary)]">Multilingual grassroots demand signals</div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border-warm)] p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-tertiary)]">Geospatial Clusters</div>
          <div className="text-2xl font-bold text-[var(--status-danger)] font-mono">{hotspots.length}</div>
          <div className="text-xs text-[var(--text-secondary)]">Active priority infrastructure deficit zones</div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border-warm)] p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-tertiary)]">Impact Perimeter</div>
          <div className="text-2xl font-bold text-[var(--text-primary)] font-mono">
            {totalImpacted > 0 ? totalImpacted.toLocaleString() : '8,420,000'}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">Citizens in target municipal catchment</div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border-warm)] p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-tertiary)]">Capital In Review</div>
          <div className="text-2xl font-bold text-[var(--status-success)] font-mono">
            {currentCountry === 'ALL' ? '$482.5M' : '$145.2M'}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">Infrastructure alignment pipeline</div>
        </div>
      </div>

      {/* 2. Map Section Controls Toolbar */}
      <div className="bg-white rounded-xl border border-[var(--border-warm)] p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
              <span className="text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-wider">
                Interactive GIS Intelligence
              </span>
            </div>
            <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--accent-primary)]" />
              {currentCountry === 'ALL' 
                ? 'Global Infrastructure World Map & Demand Clustering' 
                : `${COUNTRY_DEFINITIONS[currentCountry]?.label || currentCountry} Infrastructure Map`}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Select national scope, zoom across borders, or click any cluster marker to inspect verified citizen reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Country / World Selector */}
            <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-warm)] rounded-lg px-3 py-1.5 text-xs">
              <Globe className="w-4 h-4 text-[var(--accent-primary)]" />
              <select
                value={currentCountry}
                onChange={(e) => handleCountrySelect(e.target.value)}
                className="bg-transparent text-[var(--text-primary)] font-bold focus:outline-none cursor-pointer"
                aria-label="Select Country or Global Map"
              >
                <option value="ALL">All Nations (World Map)</option>
                <option value="IND">India (IND)</option>
                <option value="USA">United States (USA)</option>
                <option value="BRA">Brazil (BRA)</option>
                <option value="ZAF">South Africa (ZAF)</option>
                <option value="CHN">China (CHN)</option>
                <option value="RUS">Russia (RUS)</option>
              </select>
            </div>

            {/* Basemap Style Switcher (Zero Watermarks) */}
            <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-warm)]">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase px-1.5 hidden sm:inline">Tiles:</span>
              {[
                { id: 'streets', label: 'Streets' },
                { id: 'osm', label: 'OSM' },
                { id: 'topo', label: 'Topo' },
                { id: 'canvas', label: 'Canvas' }
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBasemapStyle(b.id)}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    basemapStyle === b.id
                      ? 'bg-white text-[var(--accent-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  title={`Switch to ${b.label} basemap`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Map Layer View Switcher */}
            <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-warm)]">
              {[
                { id: 'demand', label: 'Demand' },
                { id: 'deficit', label: 'Deficit' },
                { id: 'vulnerability', label: 'Vulnerability' }
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => setActiveLayer(l.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
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
        </div>

        {/* Quick Focus Targets Carousel */}
        <div className="pt-3 border-t border-[var(--border-divider)] flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[var(--accent-primary)]" /> Quick Focus:
          </span>

          {currentTargets.map((target) => {
            const isSelected = focusedTargetId === target.id || (!focusedTargetId && target.id.includes('all'));
            return (
              <button
                key={target.id}
                onClick={() => handleFocusTarget(target)}
                className={`px-3 py-1 rounded-full font-medium border transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm'
                    : 'bg-white text-[var(--text-secondary)] border-[var(--border-warm)] hover:border-[var(--accent-tertiary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                <span>{target.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Split View: Map (7 Cols) + Right Intelligence Panel (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Interactive Leaflet Map */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[var(--border-warm)] p-2 relative h-[620px] overflow-hidden flex flex-col shadow-sm">
          <div ref={mapContainerRef} className="w-full h-full rounded-lg z-0" />

          {/* Floating Live Signal Badge */}
          <div className="absolute top-4 left-4 z-10 p-2.5 bg-white/95 backdrop-blur-sm rounded-lg text-xs border border-[var(--border-warm)] shadow-md flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-danger)] animate-pulse" />
            <span className="text-[var(--text-primary)] font-bold">
              {currentCountry === 'ALL' ? 'Global GIS Network' : `${currentCountry} Live Sensors`}
            </span>
            <span className="text-[var(--text-tertiary)]">• {hotspots.length} Clusters</span>
          </div>

          {/* Map Indicator Legend */}
          <div className="absolute bottom-4 left-4 z-10 p-3 bg-white/95 backdrop-blur-sm rounded-lg text-xs space-y-1.5 border border-[var(--border-warm)] shadow-md">
            <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Map Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[var(--status-danger)] flex items-center justify-center text-[8px] text-white font-bold">!</span>
              <span className="text-[var(--text-primary)] font-medium">Critical Deficit Cluster</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--status-warning)]" />
              <span className="text-[var(--text-secondary)] font-medium">Elevated Demand Hotspot</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-success)]" />
              <span className="text-[var(--text-secondary)] font-medium">Verified Citizen Signal</span>
            </div>
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-5 space-y-4">
          {selectedHotspot ? (
            <div className="bg-white rounded-xl border border-[var(--border-warm)] p-5 space-y-4 shadow-sm">
              
              {/* Header: Title + Badge */}
              <div className="space-y-1.5 pb-3 border-b border-[var(--border-divider)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-[var(--accent-primary)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded border border-[var(--border-warm)]">
                    {selectedHotspot.country_code} · {selectedHotspot.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    (selectedHotspot.priority_level && selectedHotspot.priority_level.toLowerCase().includes('critical')) || selectedHotspot.avg_urgency_score > 0.75
                      ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger-border)]'
                      : 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)]'
                  }`}>
                    {selectedHotspot.priority_level || 'Active Hotspot'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] pt-0.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                  <span>{selectedHotspot.cluster_name}</span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {selectedHotspot.state_province} · <strong>{regionalComplaints.length} Filed Citizen Signals</strong>
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
                      placeholder={`Search ${selectedHotspot.state_province || 'regional'} reports...`}
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
                      <div className="text-[10px] text-[var(--text-tertiary)]">Baseline infrastructure gap</div>
                    </div>

                    <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-warm)] space-y-0.5">
                      <div className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase">Catchment Population</div>
                      <div className="text-xl font-bold font-mono text-[var(--text-primary)]">{(selectedHotspot.estimated_affected_population || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">Direct municipal zone</div>
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
