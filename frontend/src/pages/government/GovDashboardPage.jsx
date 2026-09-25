import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, AlertTriangle, CheckCircle2, Clock, 
  ArrowRight, ShieldCheck, Flame, Users, Sparkles, Filter,
  RefreshCw, TrendingUp, Layers, ChevronRight, Activity, ArrowUpRight
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

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger-border)]">Critical</span>;
      case 'High':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">High</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--status-info-bg)] text-[var(--status-info)] border border-[var(--status-info-border)]">Medium</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-warm)]">Low</span>;
    }
  };

  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('resolved')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--status-success-bg)] text-[var(--status-success)] border border-[var(--status-success-border)]">Resolved</span>;
    }
    if (s.includes('dispatched') || s.includes('progress') || s.includes('action')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--status-info-bg)] text-[var(--status-info)] border border-[var(--status-info-border)]">In Progress</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">Pending</span>;
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Header Banner - Executive Authority Card */}
      <div className="bg-[#1E110A] text-white rounded-2xl p-6 sm:p-8 border border-[#D4A373]/30 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-[#D4A373] uppercase">
                Official Command Console
              </span>
              <span className="text-xs bg-white/10 text-white/90 px-2.5 py-0.5 rounded-md font-mono border border-white/15">
                {user?.clearance_level || 'Tier 1 Clearance'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome, {user?.name || 'Director of Urban Infrastructure'}
            </h1>
            
            <p className="text-xs sm:text-sm text-white/70 flex items-center gap-3 flex-wrap">
              <span>Department: <strong className="text-white">{user?.department || 'Ministry of Housing & Urban Affairs'}</strong></span>
              <span>•</span>
              <span>Jurisdiction: <strong className="text-white">{user?.country_name || 'India'}</strong></span>
              <span>•</span>
              <span className="text-[#D4A373] font-semibold">Live GIS Sync: Operational</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => { setCopilotMode('brief'); setIsCopilotOpen(true); }}
              className="px-4 py-2.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-light)] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer border border-[#D4A373]/40"
            >
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
              <span>AI Executive Briefing</span>
            </button>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metric Cards - Unified Line & Baseline Alignment */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white rounded-xl border border-[var(--border-warm)] p-4 shadow-sm hover:border-[var(--accent-tertiary)] transition-all">
          <div className="flex items-center justify-between text-[var(--text-tertiary)] text-xs mb-1.5">
            <span className="font-semibold uppercase text-[10px] tracking-wider">Total Grievances</span>
            <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{totalCount}</div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[var(--status-success)]" /> All-channel intake
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border-warm)] border-l-4 border-l-[var(--status-danger)] p-4 shadow-sm hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-[var(--text-tertiary)] text-xs mb-1.5">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-[var(--status-danger)]">Critical Severity</span>
            <Flame className="w-4 h-4 text-[var(--status-danger)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--status-danger)]">{criticalCount}</div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">Requires dispatch</div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border-warm)] border-l-4 border-l-[var(--status-warning)] p-4 shadow-sm hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-[var(--text-tertiary)] text-xs mb-1.5">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-[var(--status-warning)]">High Priority</span>
            <AlertTriangle className="w-4 h-4 text-[var(--status-warning)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--status-warning)]">{highCount}</div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">SLA 24-48h window</div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border-warm)] border-l-4 border-l-[var(--status-info)] p-4 shadow-sm hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-[var(--text-tertiary)] text-xs mb-1.5">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-[var(--status-info)]">In Progress</span>
            <Clock className="w-4 h-4 text-[var(--status-info)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--status-info)]">{inProgressCount}</div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">Work order issued</div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border-warm)] border-l-4 border-l-[var(--status-success)] p-4 shadow-sm hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-[var(--text-tertiary)] text-xs mb-1.5">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-[var(--status-success)]">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--status-success)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--status-success)]">{resolvedCount}</div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">Citizen verified</div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border-warm)] border-l-4 border-l-[var(--accent-primary)] p-4 shadow-sm hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-[var(--text-tertiary)] text-xs mb-1.5">
            <span className="font-semibold uppercase text-[10px] tracking-wider text-[var(--accent-primary)]">GIS Hotspots</span>
            <MapPin className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--accent-primary)]">{hotspots.length}</div>
          <div className="text-[11px] text-[var(--text-secondary)] mt-1">Clustered zones</div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 Cols): Priority Grievance Stream */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-[var(--border-warm)] p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-divider)]">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--accent-primary)]" />
                  Priority Grievance Queue
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Ranked by AI Severity & Citizen Endorsements</p>
              </div>
              <Link 
                to="/gov-demo/complaints" 
                className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-primary-dark)] flex items-center gap-1 font-semibold"
              >
                <span>View All ({requests.length})</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-[var(--text-tertiary)] text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--accent-primary)]" />
                Loading grievances queue...
              </div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center text-[var(--text-tertiary)] text-sm">
                No citizen grievances found.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-divider)]">
                {requests.slice(0, 6).map((req) => (
                  <div 
                    key={req.id} 
                    onClick={() => navigate(`/gov-demo/complaints/${req.id}`)}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg-secondary)] -mx-4 px-4 rounded-xl transition cursor-pointer group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-[var(--accent-primary)] font-bold">{req.id}</span>
                        {getUrgencyBadge(req.urgency)}
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-warm)] font-medium">
                          {req.category}
                        </span>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-xs text-[var(--text-primary)] font-medium line-clamp-1 group-hover:text-[var(--accent-primary)] transition">
                        {req.translated_text || req.original_text}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-[var(--text-tertiary)]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[var(--accent-primary)]" />
                          {req.location_name || 'Geo-Coordinates Verified'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-[var(--text-tertiary)]" />
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
                        className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--accent-primary)] hover:text-white text-[var(--text-primary)] text-xs font-semibold transition border border-[var(--border-warm)] cursor-pointer"
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
          <div className="bg-white border border-[var(--border-warm)] rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--accent-primary)]" />
                GIS Command Map
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--accent-primary)] font-bold font-mono border border-[var(--border-warm)]">
                {hotspots.length} Clusters
              </span>
            </div>
            
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Spatial clustering algorithms aggregated citizen reports into actionable infrastructure deficit zones.
            </p>

            <Link
              to="/gov-demo/map"
              className="w-full py-2.5 px-4 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-dark)] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Launch GIS Command Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Real-Time Telemetry Feed */}
          <div className="bg-white border border-[var(--border-warm)] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-divider)] mb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
                Live Telemetry Ingestion
              </h3>
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono">Stream Active</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {liveEvents.length === 0 ? (
                <div className="text-xs text-[var(--text-tertiary)] text-center py-6">Listening for live telemetry...</div>
              ) : (
                liveEvents.map((evt, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-warm)] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--accent-primary)] text-[11px]">{evt.event_type || 'INCIDENT'}</span>
                      <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'Just now'}</span>
                    </div>
                    <p className="text-[var(--text-primary)] text-[11px] line-clamp-1">{evt.message || 'Telemetry event received'}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Analytics & MCDA Link */}
          <div className="bg-white border border-[var(--border-warm)] rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--status-success)]" />
              Policy & Budget Decisioning
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Run MCDA multi-criteria project ranking, inspect spend gaps, and simulate infrastructure budget impact.
            </p>
            <Link
              to="/gov-demo/analytics"
              className="w-full py-2.5 px-4 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--accent-primary)] hover:text-white text-[var(--text-primary)] text-xs font-semibold transition flex items-center justify-center gap-2 border border-[var(--border-warm)]"
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
