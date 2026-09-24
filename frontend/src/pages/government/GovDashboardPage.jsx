import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, AlertTriangle, CheckCircle2, Clock, 
  ArrowRight, ShieldCheck, Flame, Users, Sparkles, Filter,
  RefreshCw, TrendingUp, Layers, ChevronRight, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRequests, getHotspots, getLiveEvents } from '../../services/api';
import AICopilotModal from '../../components/AICopilotModal';

export default function GovDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotMode, setCopilotMode] = useState('brief');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadLiveEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [reqData, hotData, eventsData] = await Promise.all([
        getRequests('ALL'),
        getHotspots('ALL'),
        getLiveEvents(8)
      ]);
      setRequests(reqData || []);
      setHotspots(hotData || []);
      setLiveEvents(eventsData || []);
    } catch (err) {
      console.error('Error loading gov dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadLiveEvents() {
    try {
      const events = await getLiveEvents(8);
      if (events && events.length) setLiveEvents(events);
    } catch (err) {
      // quiet poll
    }
  }

  // Calculate Metrics
  const totalCount = requests.length;
  const criticalCount = requests.filter(r => r.urgency === 'Critical').length;
  const highCount = requests.filter(r => r.urgency === 'High').length;
  const resolvedCount = requests.filter(r => (r.status || '').toLowerCase().includes('resolved')).length;
  const inProgressCount = requests.filter(r => 
    (r.status || '').toLowerCase().includes('dispatched') || 
    (r.status || '').toLowerCase().includes('progress') ||
    (r.status || '').toLowerCase().includes('action')
  ).length;
  const pendingCount = Math.max(0, totalCount - resolvedCount - inProgressCount);

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">Critical</span>;
      case 'High':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">High</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Medium</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-500/20 text-gray-300 border border-gray-500/30">Low</span>;
    }
  };

  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('resolved')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Resolved</span>;
    }
    if (s.includes('dispatched') || s.includes('progress') || s.includes('action')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">In Progress</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Pending</span>;
  };

  return (
    <div className="text-white space-y-8 pb-16">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-tertiary)]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-[var(--accent-tertiary)] uppercase">
                Official Government Command Console
              </span>
              <span className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-md font-mono">
                {user?.clearance_level || 'Level 4 Clearance'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {user?.name || 'Administrator'}
            </h1>
            
            <p className="text-xs sm:text-sm text-white/60 flex items-center gap-3 flex-wrap">
              <span>Dept: <strong className="text-white">{user?.department || 'Ministry of Housing & Urban Affairs'}</strong></span>
              <span>•</span>
              <span>Jurisdiction: <strong className="text-white">{user?.country_name || 'India'}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Live GIS Sync: Active</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => { setCopilotMode('brief'); setIsCopilotOpen(true); }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Executive Briefing</span>
            </button>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#162030] border border-white/10 rounded-xl p-4 shadow-sm hover:border-white/20 transition-all">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>Total Grievances</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalCount}</div>
          <div className="text-[11px] text-white/40 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" /> All-channel intake
          </div>
        </div>

        <div className="bg-[#162030] border border-red-500/20 rounded-xl p-4 shadow-sm hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>Critical Severity</span>
            <Flame className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-red-400">{criticalCount}</div>
          <div className="text-[11px] text-red-400/70 mt-1">Requires immediate dispatch</div>
        </div>

        <div className="bg-[#162030] border border-amber-500/20 rounded-xl p-4 shadow-sm hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>High Severity</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{highCount}</div>
          <div className="text-[11px] text-amber-400/70 mt-1">Urgent SLA 24-48h</div>
        </div>

        <div className="bg-[#162030] border border-cyan-500/20 rounded-xl p-4 shadow-sm hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{inProgressCount}</div>
          <div className="text-[11px] text-cyan-400/70 mt-1">Work order issued</div>
        </div>

        <div className="bg-[#162030] border border-emerald-500/20 rounded-xl p-4 shadow-sm hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{resolvedCount}</div>
          <div className="text-[11px] text-emerald-400/70 mt-1">Citizen confirmed</div>
        </div>

        <div className="bg-[#162030] border border-purple-500/20 rounded-xl p-4 shadow-sm hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>GIS Hotspots</span>
            <MapPin className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{hotspots.length}</div>
          <div className="text-[11px] text-purple-400/70 mt-1">Clustered regions</div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 Cols): Priority Grievance Stream */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#162030] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--accent-tertiary)]" />
                  Priority Grievance Queue
                </h2>
                <p className="text-xs text-white/50">Ranked by AI Severity & Citizen Upvotes</p>
              </div>
              <Link 
                to="/gov-demo/complaints" 
                className="text-xs text-[var(--accent-tertiary)] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View All ({requests.length})</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-white/40 text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--accent-tertiary)]" />
                Loading grievances queue...
              </div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center text-white/40 text-sm">
                No citizen grievances found.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {requests.slice(0, 6).map((req) => (
                  <div 
                    key={req.id} 
                    onClick={() => navigate(`/gov-demo/complaints/${req.id}`)}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] -mx-4 px-4 rounded-xl transition cursor-pointer group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-[var(--accent-tertiary)] font-bold">{req.id}</span>
                        {getUrgencyBadge(req.urgency)}
                        <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-white/70">
                          {req.category}
                        </span>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-xs text-white/80 line-clamp-1 group-hover:text-white transition">
                        {req.translated_text || req.original_text}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-white/40">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-white/30" />
                          {req.location_name || 'Geo-Coordinates'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-white/30" />
                          {req.upvotes || 1} citizen votes
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/gov-demo/complaints/${req.id}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[var(--accent-tertiary)] hover:text-slate-950 text-white text-xs font-semibold transition"
                      >
                        Action →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 Cols): Live Events + Hotspots Shortcut */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* GIS Command Shortcut Card */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                Live GIS Map Command
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                {hotspots.length} Clusters
              </span>
            </div>
            
            <p className="text-xs text-white/60 mb-4 leading-relaxed">
              Spatial clustering algorithms aggregated citizen reports into actionable infrastructure deficit zones.
            </p>

            <Link
              to="/gov-demo/map"
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Open GIS Command Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Real-Time Event Feed */}
          <div className="bg-[#162030] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Ingestion Stream
              </h3>
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono">Real-Time</span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {liveEvents.length === 0 ? (
                <div className="text-xs text-white/40 text-center py-6">Listening for live telemetry...</div>
              ) : (
                liveEvents.map((evt, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--accent-tertiary)] text-[11px]">{evt.event_type || 'INCIDENT'}</span>
                      <span className="text-[10px] text-white/40">{evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'Just now'}</span>
                    </div>
                    <p className="text-white/80 text-[11px] line-clamp-1">{evt.message || 'Telemetry event received'}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Analytics & MCDA Link */}
          <div className="bg-[#162030] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Policy & Budget Decisioning
            </h3>
            <p className="text-xs text-white/60">
              Run MCDA multi-criteria project ranking, inspect spend gaps, and simulate infrastructure budget impact.
            </p>
            <Link
              to="/gov-demo/analytics"
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition flex items-center justify-center gap-2 border border-white/10"
            >
              <span>Access Analytics Studio</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

      {/* AI Copilot Briefing Modal */}
      {isCopilotOpen && (
        <AICopilotModal 
          isOpen={isCopilotOpen} 
          onClose={() => setIsCopilotOpen(false)} 
          initialMode={copilotMode}
          selectedCountry={user?.country_code || 'ALL'}
        />
      )}

    </div>
  );
}
