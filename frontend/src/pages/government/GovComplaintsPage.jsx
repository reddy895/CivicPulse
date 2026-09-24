import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, ArrowUpDown, ChevronRight, MapPin, 
  Clock, Users, AlertCircle, RefreshCw, Layers, CheckCircle2,
  AlertTriangle, FileText, ArrowRight
} from 'lucide-react';
import { getRequests } from '../../services/api';

const CATEGORIES = [
  'ALL',
  'Water & Sanitation',
  'Roads & Public Transport',
  'Clean Energy & Grid',
  'Healthcare & Clinics',
  'Education & Schools',
  'Flood & Climate Resilience',
  'Digital Public Infrastructure'
];

const URGENCIES = ['ALL', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['ALL', 'Pending', 'In Progress', 'Resolved'];

export default function GovComplaintsPage() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('urgency_desc');

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    setLoading(true);
    try {
      const data = await getRequests('ALL');
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredRequests = useMemo(() => {
    return requests.filter(item => {
      // Search
      const searchMatch = !searchTerm || (
        (item.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.original_text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.translated_text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.state_province || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Category
      const catMatch = selectedCategory === 'ALL' || item.category === selectedCategory;

      // Urgency
      const urgMatch = selectedUrgency === 'ALL' || item.urgency === selectedUrgency;

      // Status
      let statusMatch = true;
      if (selectedStatus !== 'ALL') {
        const s = (item.status || '').toLowerCase();
        if (selectedStatus === 'Resolved') statusMatch = s.includes('resolved');
        else if (selectedStatus === 'In Progress') statusMatch = s.includes('dispatched') || s.includes('progress') || s.includes('action');
        else if (selectedStatus === 'Pending') statusMatch = !s.includes('resolved') && !s.includes('dispatched') && !s.includes('progress') && !s.includes('action');
      }

      return searchMatch && catMatch && urgMatch && statusMatch;
    }).sort((a, b) => {
      if (sortBy === 'urgency_desc') return (b.urgency_score || 0) - (a.urgency_score || 0);
      if (sortBy === 'upvotes_desc') return (b.upvotes || 0) - (a.upvotes || 0);
      if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      return 0;
    });
  }, [requests, searchTerm, selectedCategory, selectedUrgency, selectedStatus, sortBy]);

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
    <div className="text-white space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[var(--accent-tertiary)]" />
            Citizen Grievance Records
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Search, triage, and issue official agency work orders across sovereign jurisdictions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchComplaints}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-xs font-semibold border border-white/10 transition flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#162030] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Input (5 Cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, keyword, district, or citizen complaint..."
              className="w-full bg-[#0F1923] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent-tertiary)] transition"
            />
          </div>

          {/* Category Dropdown (3 Cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#0F1923] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--accent-tertiary)] transition"
            >
              <option value="ALL">All Sectors / Categories</option>
              {CATEGORIES.filter(c => c !== 'ALL').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Urgency Dropdown (2 Cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full bg-[#0F1923] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--accent-tertiary)] transition"
            >
              <option value="ALL">All Urgency</option>
              {URGENCIES.filter(u => u !== 'ALL').map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown (2 Cols) */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#0F1923] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--accent-tertiary)] transition"
            >
              <option value="urgency_desc">Highest Urgency</option>
              <option value="upvotes_desc">Most Upvotes</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/5 text-xs text-white/50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white/70">Status:</span>
            {STATUSES.map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  selectedStatus === st 
                    ? 'bg-[var(--accent-tertiary)] text-slate-950 shadow-sm' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-white/40">
            Showing <strong className="text-white">{filteredRequests.length}</strong> of {requests.length} records
          </div>
        </div>
      </div>

      {/* Grievances Table / Cards View */}
      <div className="bg-[#162030] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 text-center text-white/40 text-sm">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[var(--accent-tertiary)]" />
            Loading records from database...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-20 text-center text-white/40 text-sm space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-white/20" />
            <p>No complaints match the selected filter criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedUrgency('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-xs text-[var(--accent-tertiary)] hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0F1923] border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Sector / Category</th>
                  <th className="py-3 px-4">Complaint Description</th>
                  <th className="py-3 px-4">Jurisdiction & Location</th>
                  <th className="py-3 px-4">Citizen Votes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => navigate(`/gov-demo/complaints/${req.id}`)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--accent-tertiary)] whitespace-nowrap">
                      {req.id}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getUrgencyBadge(req.urgency)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-[11px]">
                        {req.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-white/80 group-hover:text-white transition leading-relaxed">
                        {req.translated_text || req.original_text}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-white/60">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0" />
                        <span className="truncate max-w-[140px]">{req.location_name || req.state_province || 'GPS Location'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-white/70">
                      <div className="flex items-center gap-1 font-semibold">
                        <Users className="w-3.5 h-3.5 text-white/40" />
                        {req.upvotes || 1}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/gov-demo/complaints/${req.id}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[var(--accent-tertiary)] hover:text-slate-950 text-white text-xs font-semibold transition inline-flex items-center gap-1"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
