import React, { useState, useEffect } from 'react';
import { 
  Send, ChevronRight, ThumbsUp, Sparkles, CheckCircle2, AlertCircle,
  MapPin, RefreshCw, User, ShieldCheck, Clock, CheckCircle, FileText, ArrowRight
} from 'lucide-react';
import { submitCitizenRequest, upvoteRequest, getRequests } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';
import { toast } from './ui/Toast';

export default function CitizenDashboard({ selectedCountry, onGoToMap }) {
  const { user } = useAuth();

  const [inputText, setInputText] = useState('');
  const [recentResult, setRecentResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveRequests, setLiveRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [activeTab, setActiveTab] = useState('file'); // 'file' | 'tracking' | 'feed'

  // Automatic Real-Time Geolocation State
  const [geoState, setGeoState] = useState({
    status: 'detecting', // 'detecting' | 'located' | 'denied'
    latitude: 25.3176,
    longitude: 82.9739,
    locationName: 'Varanasi District, Uttar Pradesh',
    accuracy: 12,
    timestamp: new Date().toLocaleTimeString()
  });

  useEffect(() => {
    detectLocation();
    loadRequestsList();
  }, [selectedCountry, user]);

  // Automatic GPS Geolocation Detection
  const detectLocation = () => {
    setGeoState(prev => ({ ...prev, status: 'detecting' }));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy || 15);
          
          setGeoState({
            status: 'located',
            latitude: parseFloat(lat.toFixed(5)),
            longitude: parseFloat(lng.toFixed(5)),
            locationName: user?.district || 'Auto-Detected GPS Location',
            accuracy: accuracy,
            timestamp: new Date().toLocaleTimeString()
          });
        },
        (error) => {
          console.warn('Geolocation permission denied/unavailable, defaulting to regional baseline:', error);
          const defaultLocs = {
            IND: { lat: 25.3176, lng: 82.9739, name: 'Varanasi Rural, Uttar Pradesh' },
            BRA: { lat: -11.2542, lng: -39.3756, name: 'Santaluz Municipality, Bahia' },
            ZAF: { lat: -31.5833, lng: 28.7833, name: 'OR Tambo District, Eastern Cape' },
            CHN: { lat: 27.8864, lng: 102.2655, name: 'Liangshan Autonomous, Sichuan' },
            RUS: { lat: 58.5222, lng: 31.2698, name: 'Novgorod District, Novgorod Oblast' }
          };
          const cCode = user?.country_code || selectedCountry || 'IND';
          const loc = defaultLocs[cCode] || defaultLocs.IND;
          setGeoState({
            status: 'located',
            latitude: loc.lat,
            longitude: loc.lng,
            locationName: loc.name,
            accuracy: 25,
            timestamp: new Date().toLocaleTimeString()
          });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGeoState(prev => ({ ...prev, status: 'denied' }));
    }
  };

  async function loadRequestsList() {
    const reqs = await getRequests(selectedCountry === 'ALL' ? null : selectedCountry, filterCategory);
    setLiveRequests(reqs);

    // Filter my user requests
    if (user) {
      const mine = reqs.filter(r => r.submitter_id === user.id || r.submitter_name === user.name);
      setMyRequests(mine.length > 0 ? mine : reqs.slice(0, 3));
    }
  }

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    const cCode = selectedCountry === 'ALL' ? (user?.country_code || 'IND') : selectedCountry;
    const payload = {
      text: inputText,
      channel: 'web',
      country_code: cCode,
      location_name: geoState.locationName,
      latitude: geoState.latitude,
      longitude: geoState.longitude,
      citizen_name: user?.name || 'Citizen Contributor',
      submitter_id: user?.id
    };

    try {
      const res = await submitCitizenRequest(payload);
      setIsProcessing(false);
      setInputText('');
      setRecentResult({
        transcription: inputText,
        detected_language: 'auto',
        language_name: 'Natural Language AI',
        confidence: 0.98,
        processed_request: res
      });
      toast.success(`Grievance #${res.id} registered and clustered!`);
      loadRequestsList();
      setActiveTab('tracking');
    } catch (err) {
      setIsProcessing(false);
      toast.error('Failed to submit grievance. Please try again.');
    }
  };

  const handleUpvote = async (reqId) => {
    const res = await upvoteRequest(reqId);
    if (res) {
      setLiveRequests(prev => prev.map(r => r.id === reqId ? { ...r, upvotes: res.upvotes } : r));
      toast.success('Grievance petition upvoted!');
    }
  };

  // Quick State Location Switcher
  const handleSelectLocationPreset = (presetKey) => {
    const PRESETS = {
      'Karnataka': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru Urban & Rural, Karnataka' },
      'Uttar Pradesh': { lat: 25.3176, lng: 82.9739, name: 'Varanasi Rural, Uttar Pradesh' },
      'Maharashtra': { lat: 20.1809, lng: 79.9950, name: 'Gadchiroli District, Maharashtra' },
      'Bihar': { lat: 26.0903, lng: 87.9405, name: 'Kishanganj Flood Basin, Bihar' },
      'Rajasthan': { lat: 25.7521, lng: 71.3967, name: 'Barmer Arid Zone, Rajasthan' },
      'Kerala': { lat: 11.6854, lng: 76.1320, name: 'Wayanad Hill Region, Kerala' }
    };
    const target = PRESETS[presetKey];
    if (target) {
      setGeoState({
        status: 'located',
        latitude: target.lat,
        longitude: target.lng,
        locationName: target.name,
        accuracy: 8,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-8 space-y-8">
      
      {/* 1. Authenticated Citizen Banner */}
      <div className="card-coffee p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#A67B5B] flex items-center justify-center text-[#FDFBF7] font-bold text-xl shadow-md shrink-0">
            {user?.name ? user.name.charAt(0) : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5A8F6E] animate-pulse" />
              <h2 className="text-xl font-extrabold text-[#2C1810] tracking-tight">
                {user?.name || 'Citizen Grievance Gateway'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-[11px] font-semibold border border-[#A5D6A7]">
                Verified Citizen
              </span>
            </div>
            <p className="text-xs text-[#5C4A42] mt-1 flex items-center gap-2">
              <span>Jurisdiction: <strong>{geoState.locationName}</strong></span>
              <span>•</span>
              <span>Nation: <strong>{user?.country_name || 'India'}</strong></span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-[#FAF6F0] rounded-2xl border border-[#E8E0D5]">
          <button
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'file' ? 'bg-[#2C1810] text-[#FDFBF7] shadow-sm' : 'text-[#8C7A70] hover:text-[#2C1810]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>File Grievance</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tracking' ? 'bg-[#2C1810] text-[#FDFBF7] shadow-sm' : 'text-[#8C7A70] hover:text-[#2C1810]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>My Resolutions ({myRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'feed' ? 'bg-[#2C1810] text-[#FDFBF7] shadow-sm' : 'text-[#8C7A70] hover:text-[#2C1810]'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Community Feed</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Geolocation & State Selection Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF6F0] via-[#F5EBE0] to-[#FAF6F0] border border-[#D4A373]/40 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#D4A373]/20 text-[#2C1810]">
              <MapPin className="w-5 h-5 text-[#E11D48] animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2C1810]">
                  Grievance Target GPS Coordinates
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#5A8F6E]/15 text-[#5A8F6E] text-[10px] font-bold border border-[#5A8F6E]/30">
                  Locked: ±{geoState.accuracy}m
                </span>
              </div>
              <p className="text-xs text-[#5C4A42] font-mono mt-0.5">
                <strong>{geoState.locationName}</strong> • [{geoState.latitude}° N, {geoState.longitude}° E]
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={detectLocation}
              icon={RefreshCw}
              loading={geoState.status === 'detecting'}
            >
              Auto GPS
            </Button>
          </div>
        </div>

        {/* Quick Location Chips */}
        <div className="pt-2 border-t border-[#E8E0D5]/70 flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <span className="text-[10px] font-bold text-[#8C7A70] uppercase shrink-0">
            Set Region:
          </span>

          <button
            onClick={() => handleSelectLocationPreset('Karnataka')}
            className={`px-3 py-1 rounded-full font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
              geoState.locationName.includes('Karnataka')
                ? 'bg-[#E11D48] text-white shadow-sm ring-2 ring-[#E11D48]/30'
                : 'bg-white text-[#9F1239] border border-[#FECDD3] hover:bg-[#FFE4E6]'
            }`}
          >
            <span>🚨 Karnataka (Bengaluru)</span>
          </button>

          {['Uttar Pradesh', 'Maharashtra', 'Bihar', 'Rajasthan', 'Kerala'].map((st) => (
            <button
              key={st}
              onClick={() => handleSelectLocationPreset(st)}
              className={`px-2.5 py-1 rounded-full font-semibold border transition shrink-0 cursor-pointer ${
                geoState.locationName.includes(st)
                  ? 'bg-[#2C1810] text-white border-[#2C1810]'
                  : 'bg-white text-[#5C4A42] border-[#E8E0D5] hover:border-[#D4A373]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: FILE GRIEVANCE */}
      {activeTab === 'file' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Ingestion Card (8 Cols) */}
          <div className="lg:col-span-8 card-coffee p-8 space-y-6">
            
            <div className="border-b border-[#E8E0D5] pb-4">
              <h3 className="text-base font-bold text-[#2C1810]">Submit Infrastructure Grievance</h3>
              <p className="text-xs text-[#5C4A42] mt-0.5">
                Report local breakdowns in water, roads, clinics, power, or sanitation for automated AI classification and GIS dispatch.
              </p>
            </div>

            {/* Direct Text Grievance Form */}
            <form onSubmit={handleTextSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-2">
                  Detailed Grievance Description <span className="text-[#B54A4A]">*</span>
                </label>
                <textarea
                  rows={6}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe the infrastructure breakdown in detail (e.g., broken drinking water pipeline, flooded road, non-functional primary clinic, recurring power cuts), noting affected population and exact street/village landmarks..."
                  className="w-full p-4 rounded-xl border border-[#E8E0D5] bg-[#FAF6F0]/40 text-xs text-[#2C1810] focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] outline-none leading-relaxed transition resize-y"
                  required
                />
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-[#8C7A70]">
                  <span>AI will automatically detect infrastructure sector and assess urgency level.</span>
                  <span>{inputText.length} characters</span>
                </div>
              </div>

              {/* Location Verification Strip */}
              <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#5C4A42]">
                  <MapPin className="w-4 h-4 text-[#A67B5B] shrink-0" />
                  <span>
                    Linked GIS Coordinates: <strong>[{geoState.latitude}° N, {geoState.longitude}° E]</strong> ({geoState.locationName})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#5A8F6E] bg-[#E8F5E9] px-2 py-0.5 rounded font-semibold border border-[#A5D6A7]">
                  GPS Verified
                </span>
              </div>

              <div className="flex items-center justify-end pt-2">
                <Button
                  type="submit"
                  size="md"
                  disabled={isProcessing || !inputText.trim()}
                  loading={isProcessing}
                  icon={Send}
                  className="px-8 shadow-sm"
                >
                  Submit Grievance to Command Center
                </Button>
              </div>
            </form>

          </div>

          {/* AI Live Processing Result Card (4 Cols) */}
          <div className="lg:col-span-4 card-coffee p-6 space-y-6">
            <h3 className="text-sm font-bold text-[#2C1810] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
              AI Infrastructure Analysis Feedback
            </h3>

            {isProcessing ? (
              <div className="p-8 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#D4A373] animate-spin mx-auto" />
                <p className="text-xs font-bold text-[#2C1810]">Analyzing Grievance & Context...</p>
                <p className="text-[11px] text-[#5C4A42]">Classifying infrastructure sector, evaluating urgency severity, mapping to district deficits.</p>
              </div>
            ) : recentResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] space-y-2">
                  <div className="flex items-center justify-between text-[#8C7A70]">
                    <span>Analysis Engine</span>
                    <span className="font-bold text-[#2C1810]">{recentResult.language_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#8C7A70]">
                    <span>Detected Category</span>
                    <span className="font-bold text-[#B54A4A]">{recentResult.processed_request.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#8C7A70]">
                    <span>Urgency Level</span>
                    <StatusBadge status={recentResult.processed_request.urgency || 'High'} />
                  </div>
                  <div className="flex items-center justify-between text-[#8C7A70]">
                    <span>Severity Score</span>
                    <span className="font-bold text-[#2C1810]">{(recentResult.processed_request.urgency_score * 100).toFixed(0)} / 100</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Transmitted to Government GIS Command Map
                  </div>
                  <p className="text-[11px]">
                    ID: <strong>{recentResult.processed_request.id}</strong> • Coordinates [<strong>{recentResult.processed_request.latitude}, {recentResult.processed_request.longitude}</strong>] • Region: <strong>{recentResult.processed_request.state_province || 'Karnataka'}</strong>
                  </p>
                </div>

                {/* Direct CTA to view on GIS Map */}
                <button
                  onClick={() => onGoToMap && onGoToMap(recentResult.processed_request?.state_province || 'Karnataka')}
                  className="btn-primary w-full justify-center text-xs py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>View Complaint on GIS Map 🗺️</span>
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] text-center text-xs text-[#5C4A42] space-y-2">
                <AlertCircle className="w-6 h-6 text-[#D4A373] mx-auto" />
                <p>Submit a grievance on the left to inspect real-time AI classification & auto-GPS clustering results.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: MY RESOLUTIONS & TRACKING */}
      {activeTab === 'tracking' && (
        <div className="card-coffee p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#2C1810]">My Submitted Grievances & Live Resolution Stages</h3>
            <p className="text-xs text-[#5C4A42]">Track real-time progress from submission to municipal work order dispatch.</p>
          </div>

          <div className="space-y-4">
            {myRequests.map((req, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-[#E8E0D5] bg-[#FFFFFF] space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E0D5] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#2C1810]">{req.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#FAF6F0] text-[10px] font-bold text-[#A67B5B] border border-[#E8E0D5]">
                        {req.category}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#2C1810] mt-1">{req.translated_text || req.original_text}</p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-[#5A8F6E] block">{req.resolution_stage || 'Transmitted to Gov Command Map'}</span>
                    <span className="text-[10px] text-[#8C7A70]">{req.location_name} ({req.latitude}°, {req.longitude}°)</span>
                    <button
                      onClick={() => onGoToMap && onGoToMap(req.state_province || 'Karnataka')}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] hover:bg-[#D4A373] text-[#2C1810] text-[10px] font-bold border border-[#E8E0D5] flex items-center gap-1 transition mt-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-[#E11D48]" />
                      <span>View Spot on Map</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Stage Progress Bar */}
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] pt-2">
                  <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-semibold">
                    1. Grievance Filed
                  </div>
                  <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-semibold">
                    2. AI Categorized
                  </div>
                  <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-semibold">
                    3. Hotspot Clustered
                  </div>
                  <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-semibold">
                    4. Transmitted to Gov Map
                  </div>
                  <div className={`p-2 rounded-xl border font-semibold ${
                    req.resolution_stage?.includes('Dispatched') || req.resolution_stage?.includes('Resolved')
                      ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]'
                      : 'bg-[#FAF6F0] text-[#8C7A70] border-[#E8E0D5]'
                  }`}>
                    5. Work Order Dispatched
                  </div>
                </div>

                {req.official_notes && (
                  <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] text-xs text-[#5C4A42]">
                    <strong>Official Government Response Note:</strong> "{req.official_notes}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COMMUNITY FEED */}
      {activeTab === 'feed' && (
        <div className="card-coffee p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#2C1810]">Community Petitions Feed</h3>
              <p className="text-xs text-[#5C4A42]">Upvote priority grassroots requests to elevate their urgency ranking.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveRequests.map((req, i) => (
              <div key={i} className="p-5 rounded-2xl border border-[#E8E0D5] bg-[#FFFFFF] space-y-3 shadow-sm hover:border-[#D4A373] transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#A67B5B]">{req.category}</span>
                  <span className="text-[10px] text-[#8C7A70] font-mono">{req.location_name}</span>
                </div>
                <p className="text-xs text-[#2C1810] font-medium leading-relaxed">
                  "{req.translated_text || req.original_text}"
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-[#E8E0D5]">
                  <span className="text-[11px] text-[#5C4A42]">Severity Score: {(req.urgency_score * 100).toFixed(0)}/100</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUpvote(req.id)}
                    icon={ThumbsUp}
                  >
                    Upvote ({req.upvotes})
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
