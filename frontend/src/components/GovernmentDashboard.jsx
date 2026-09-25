import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Activity, Sparkles, Filter, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, FileText, CheckCircle, Clock, ChevronRight, BarChart3
} from 'lucide-react';
import GISMap from './GISMap';
import RecommendationView from './RecommendationView';
import MisalignmentView from './MisalignmentView';
import PolicySimulator from './PolicySimulator';
import DPGHub from './DPGHub';
import DisabilityComplaintsView from './DisabilityComplaintsView';
import { useAuth } from '../context/AuthContext';
import { getRequests, updateComplaintStatus, getLiveEvents } from '../services/api';

export default function GovernmentDashboard({ 
  selectedCountry, 
  setSelectedCountry, 
  onOpenCopilot,
  externalActiveTab,
  onSelectTab
}) {
  const { user } = useAuth();

  const [internalTab, setInternalTab] = useState('map');
  const activeTab = externalActiveTab || internalTab;
  const setActiveTab = onSelectTab || setInternalTab;

  const [liveStreamRequests, setLiveStreamRequests] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const [latestAlert, setLatestAlert] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusInput, setStatusInput] = useState('Work Order Dispatched');
  const [notesInput, setNotesInput] = useState('');
  const [agencyInput, setAgencyInput] = useState('Municipal Public Works & Infrastructure Dept');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    loadStreamData();
    const interval = setInterval(() => {
      fetchRealTimeUpdates();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedCountry, filterCategory]);

  async function loadStreamData() {
    const reqs = await getRequests(selectedCountry === 'ALL' ? null : selectedCountry, filterCategory);
    setLiveStreamRequests(reqs);
    if (reqs.length > 0 && !selectedRequest) {
      setSelectedRequest(reqs[0]);
    }
  }

  async function fetchRealTimeUpdates() {
    const events = await getLiveEvents(10);
    if (events.length > 0) {
      setLiveEvents(events);
      const latest = events[0];
      if (latest && latest.event_type === 'NEW_COMPLAINT' && (!latestAlert || latestAlert.timestamp !== latest.timestamp)) {
        setLatestAlert(latest);
        loadStreamData();
      }
    }
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsUpdatingStatus(true);
    const updated = await updateComplaintStatus(
      selectedRequest.id,
      statusInput,
      notesInput || 'Dispatched official work order team for site engineering audit.',
      agencyInput
    );
    setIsUpdatingStatus(false);
    if (updated) {
      setLiveStreamRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, ...updated } : r));
      setSelectedRequest(prev => prev ? { ...prev, ...updated } : null);
      setNotesInput('');
    }
  };

  const officialName = user?.name || 'Dr. Sunita Rao (Director General)';
  const officialDept = user?.department || 'Ministry of Housing & Urban Infrastructure';
  const officialClearance = user?.clearance_level || 'Level 4 - National Infrastructure Director';

  return (
    <div className="max-w-[1440px] mx-auto px-8 space-y-8">
      
      {/* 1. Official Government Authority Badge Banner */}
      <div className="card-coffee p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br from-[#2C1810] via-[#3E2723] to-[#2C1810] text-[#FDFBF7] shadow-xl border-l-4 border-l-[#D4A373]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#A67B5B] flex items-center justify-center text-[#2C1810] font-extrabold text-2xl shadow-lg shrink-0 border-2 border-white/20">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-3 h-3 rounded-full bg-[#5A8F6E] animate-ping" />
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#D4A373]">Authorized Government Official</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4A373]/20 text-[#E6CCB2] text-[11px] font-bold border border-[#D4A373]/40">
                {officialClearance}
              </span>
            </div>
            
            <h2 className="text-2xl font-black text-[#FDFBF7] tracking-tight mt-1">
              {officialName}
            </h2>

            <p className="text-xs text-[#D4C3B7] mt-1 flex items-center gap-2 flex-wrap">
              <span>Department: <strong className="text-[#FDFBF7]">{officialDept}</strong></span>
              <span>•</span>
              <span>Jurisdiction: <strong className="text-[#FDFBF7]">{user?.country_name || 'India'} Sovereign Command</strong></span>
              <span>•</span>
              <span className="text-[#5A8F6E] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>Real-Time Live Sync Active</span>
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onOpenCopilot('brief')}
            className="btn-primary text-xs py-3 px-5 bg-[#D4A373] hover:bg-[#C78D3F] text-[#2C1810] font-extrabold shadow-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Executive Briefing Studio</span>
          </button>
        </div>
      </div>

      {/* 2. Live Real-Time Grievance Notification Alert Banner */}
      {latestAlert && (
        <div className="p-4 rounded-2xl bg-[#FFF8E1] border-2 border-[#FFE082] text-[#8C6D00] shadow-md flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#F57F17] animate-ping" />
            <div>
              <h4 className="text-xs font-bold text-[#2C1810]">
                {latestAlert.message}
              </h4>
              <p className="text-[11px] text-[#5C4A42]">
                Coordinates: [{latestAlert.request?.latitude}, {latestAlert.request?.longitude}] • Auto-transmited from Citizen Portal in real time!
              </p>
            </div>
          </div>

          <button
            onClick={() => { setActiveTab('map'); setLatestAlert(null); }}
            className="btn-secondary text-xs py-1.5 px-3 bg-[#FFFFFF] hover:bg-[#FAF6F0] text-[#2C1810] border border-[#E8E0D5] font-bold shrink-0"
          >
            Inspect on Live GIS Map
          </button>
        </div>
      )}

      {/* 3. Sub-Navigation Command Bar */}
      <div className="flex items-center gap-2 border-b border-[#E8E0D5] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'map' ? 'bg-[#2C1810] text-[#FDFBF7] shadow-sm' : 'bg-[#FAF6F0] text-[#5C4A42] hover:bg-[#E8E0D5]/50'
          }`}
        >
          <MapPin className="w-4 h-4 text-[#D4A373]" />
          <span>Real-Time GIS Command Map</span>
        </button>

        <button
          onClick={() => setActiveTab('stream')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'stream' ? 'bg-[#2C1810] text-[#FDFBF7] shadow-sm' : 'bg-[#FAF6F0] text-[#5C4A42] hover:bg-[#E8E0D5]/50'
          }`}
        >
          <Activity className="w-4 h-4 text-[#D4A373]" />
          <span>Live Grievances Stream ({liveStreamRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mcda')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'mcda' ? 'bg-[#2C1810] text-[#FDFBF7] shadow-sm' : 'bg-[#FAF6F0] text-[#5C4A42] hover:bg-[#E8E0D5]/50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#D4A373]" />
          <span>MCDA Project Ranking</span>
        </button>

        <button
          onClick={() => setActiveTab('misalignment')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'misalignment' ? 'bg-[#2C1810] text-[#FDFBF7] shadow-sm' : 'bg-[#FAF6F0] text-[#5C4A42] hover:bg-[#E8E0D5]/50'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-[#D4A373]" />
          <span>Spend Gap Auditor</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'simulator' ? 'bg-[#2C1810] text-[#FDFBF7] shadow-sm' : 'bg-[#FAF6F0] text-[#5C4A42] hover:bg-[#E8E0D5]/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#D4A373]" />
          <span>Policy Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('disability')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'disability' ? 'bg-[#2C1810] text-[#FDFBF7] shadow-sm' : 'bg-[#FAF6F0] text-[#5C4A42] hover:bg-[#E8E0D5]/50'
          }`}
        >
          <FileText className="w-4 h-4 text-[#D4A373]" />
          <span>Disability Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('dpg')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dpg' ? 'bg-[#2C1810] text-[#FDFBF7] shadow-sm' : 'bg-[#FAF6F0] text-[#5C4A42] hover:bg-[#E8E0D5]/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
          <span>DPG Standards Hub</span>
        </button>
      </div>

      {/* MODULE TAB 1: REAL-TIME GIS MAP */}
      {activeTab === 'map' && (
        <GISMap
          selectedCountry={selectedCountry}
          onSelectProject={(h) => setActiveTab('mcda')}
          onOpenCopilot={onOpenCopilot}
        />
      )}

      {/* MODULE TAB 2: LIVE GRIEVANCE STREAM & STATUS MANAGEMENT */}
      {activeTab === 'stream' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Complaints Table (8 Cols) */}
          <div className="lg:col-span-8 card-coffee p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#2C1810]">Live Citizen Grievance Stream</h3>
                <p className="text-xs text-[#5C4A42]">Real-time incoming petitions auto-localized by GPS & AI analytics.</p>
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E8E0D5] bg-[#FAF6F0] text-xs font-semibold text-[#2C1810]"
              >
                <option value="ALL">All Sectors</option>
                <option value="Water & Sanitation">Water & Sanitation</option>
                <option value="Roads & Public Transport">Roads & Public Transport</option>
                <option value="Clean Energy & Grid">Clean Energy & Grid</option>
                <option value="Healthcare & Clinics">Healthcare & Clinics</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6F0] text-[#5C4A42] font-bold border-b border-[#E8E0D5]">
                  <tr>
                    <th className="p-3">ID & Location</th>
                    <th className="p-3">Sector & Urgency</th>
                    <th className="p-3">Grievance Summary</th>
                    <th className="p-3">Resolution Stage</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D5]">
                  {liveStreamRequests.map((req, i) => (
                    <tr 
                      key={i}
                      onClick={() => setSelectedRequest(req)}
                      className={`hover:bg-[#FAF6F0]/80 cursor-pointer transition ${
                        selectedRequest?.id === req.id ? 'bg-[#FAF6F0] font-semibold' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-mono font-bold text-[#2C1810]">{req.id}</div>
                        <div className="text-[10px] text-[#8C7A70]">{req.location_name} ({req.latitude}°, {req.longitude}°)</div>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-[#2C1810] block">{req.category}</span>
                        <span className={`text-[10px] font-bold ${
                          req.urgency_score > 0.7 ? 'text-[#B54A4A]' : 'text-[#A67B5B]'
                        }`}>
                          {(req.urgency_score * 100).toFixed(0)}/100 {req.urgency}
                        </span>
                      </td>
                      <td className="p-3 text-[#5C4A42] max-w-xs truncate">
                        "{req.translated_text || req.original_text}"
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold border border-[#A5D6A7]">
                          {req.resolution_stage || 'Transmitted to Gov Map'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button className="btn-secondary text-[11px] py-1 px-2.5">
                          Inspect & Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Action & Resolution Inspector Panel (4 Cols) */}
          <div className="lg:col-span-4 card-coffee p-6 space-y-6">
            <h3 className="text-sm font-bold text-[#2C1810] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#D4A373]" />
              Official Resolution & Dispatch Terminal
            </h3>

            {selectedRequest ? (
              <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E8E0D5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#2C1810]">{selectedRequest.id}</span>
                    <span className="text-[10px] text-[#8C7A70]">{selectedRequest.created_at?.slice(0, 10)}</span>
                  </div>
                  <p className="text-xs text-[#2C1810] font-semibold">
                    "{selectedRequest.translated_text}"
                  </p>
                  <div className="text-[10px] text-[#5C4A42] flex items-center gap-2 pt-1 border-t border-[#E8E0D5]">
                    <span>Coordinates: [{selectedRequest.latitude}, {selectedRequest.longitude}]</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#2C1810] mb-1">
                    Update Official Resolution Stage
                  </label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8E0D5] bg-[#FFFFFF] font-semibold text-[#2C1810] outline-none"
                  >
                    <option value="Under Municipal Review">Under Municipal Review</option>
                    <option value="Field Inspection Scheduled">Field Inspection Scheduled</option>
                    <option value="Work Order Dispatched">Work Order Dispatched</option>
                    <option value="Budget Allocated (₹ Cr)">Capital Budget Allocated</option>
                    <option value="Infrastructure Resolved">Infrastructure Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#2C1810] mb-1">
                    Assigned Execution Agency
                  </label>
                  <input
                    type="text"
                    value={agencyInput}
                    onChange={(e) => setAgencyInput(e.target.value)}
                    placeholder="Public Works Department"
                    className="w-full p-2.5 rounded-xl border border-[#E8E0D5] bg-[#FFFFFF] text-[#2C1810] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2C1810] mb-1">
                    Official Executive Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Dispatching structural engineering team for repair assessment..."
                    className="w-full p-2.5 rounded-xl border border-[#E8E0D5] bg-[#FFFFFF] text-[#2C1810] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="btn-primary w-full text-xs py-3 justify-center"
                >
                  {isUpdatingStatus ? 'Updating Dispatch Record...' : 'Publish Official Status & Update Citizen'}
                </button>
              </form>
            ) : (
              <div className="p-8 text-center text-xs text-[#5C4A42]">
                Select a grievance from the live stream to inspect details and issue official resolution updates.
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODULE TAB 3: MCDA PROJECT RANKING */}
      {activeTab === 'mcda' && (
        <RecommendationView
          selectedCountry={selectedCountry}
          onOpenTenderModal={(proj) => onOpenCopilot('tender', proj)}
          onOpenCopilot={onOpenCopilot}
        />
      )}

      {/* MODULE TAB 4: SPEND MISALIGNMENT */}
      {activeTab === 'misalignment' && (
        <MisalignmentView
          selectedCountry={selectedCountry}
          onGoToSimulator={() => setActiveTab('simulator')}
        />
      )}

      {/* MODULE TAB 5: POLICY SIMULATOR */}
      {activeTab === 'simulator' && (
        <PolicySimulator
          selectedCountry={selectedCountry}
          onOpenCopilot={onOpenCopilot}
        />
      )}

      {/* MODULE TAB 6: DISABILITY MATRIX */}
      {activeTab === 'disability' && (
        <DisabilityComplaintsView
          onOpenCopilot={onOpenCopilot}
          onSelectCounty={(c) => setActiveTab('map')}
        />
      )}

      {/* MODULE TAB 7: DPG OPEN DATA HUB */}
      {activeTab === 'dpg' && (
        <DPGHub
          selectedCountry={selectedCountry}
        />
      )}

    </div>
  );
}
