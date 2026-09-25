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
      const searchMatch = !searchTerm || (
        (item.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.original_text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.translated_text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.state_province || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

      const catMatch = selectedCategory === 'ALL' || item.category === selectedCategory;
      const urgMatch = selectedUrgency === 'ALL' || item.urgency === selectedUrgency;

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
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[var(--accent-primary)]" />
            Citizen Grievance Records
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Search, triage, and issue official agency work orders across jurisdictions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchComplaints}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-semibold border border-[var(--border-warm)] transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[var(--border-warm)] rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Input (5 Cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, keyword, district, or citizen complaint..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-warm)] rounded-lg pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent-primary)] transition"
            />
          </div>

          {/* Category Dropdown (3 Cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-warm)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition cursor-pointer"
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
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-warm)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition cursor-pointer"
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
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-warm)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition cursor-pointer"
            >
              <option value="urgency_desc">Highest Urgency</option>
              <option value="upvotes_desc">Most Endorsements</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[var(--border-divider)] text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[var(--text-primary)]">Status:</span>
            {STATUSES.map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  selectedStatus === st 
                    ? 'bg-[var(--accent-primary)] text-white shadow-xs' 
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-[var(--text-tertiary)]">
            Showing <strong className="text-[var(--text-primary)]">{filteredRequests.length}</strong> of {requests.length} records
          </div>
        </div>
      </div>

      {/* Grievances Table / Cards View */}
      <div className="bg-white border border-[var(--border-warm)] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-[var(--text-tertiary)] text-sm">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[var(--accent-primary)]" />
            Loading records from database...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-20 text-center text-[var(--text-tertiary)] text-sm space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-[var(--text-placeholder)]" />
            <p>No complaints match the selected filter criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedUrgency('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-xs text-[var(--accent-primary)] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-warm)] text-[var(--text-tertiary)] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">ID</th>
                  <th className="py-3 px-4 font-bold">Urgency</th>
                  <th className="py-3 px-4 font-bold">Sector / Category</th>
                  <th className="py-3 px-4 font-bold">Complaint Description</th>
                  <th className="py-3 px-4 font-bold">Location</th>
                  <th className="py-3 px-4 font-bold">Endorsements</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-divider)]">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => navigate(`/gov-demo/complaints/${req.id}`)}
                    className="hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--accent-primary)] whitespace-nowrap">
                      {req.id}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getUrgencyBadge(req.urgency)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-warm)] text-[var(--text-secondary)] text-[11px] font-medium">
                        {req.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition leading-relaxed">
                        {req.translated_text || req.original_text}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                        <span className="truncate max-w-[140px]">{req.location_name || req.state_province || 'GPS Location'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-[var(--text-primary)]">
                      <div className="flex items-center gap-1 font-semibold">
                        <Users className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
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
                        className="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--accent-primary)] hover:text-white text-[var(--text-primary)] text-xs font-semibold transition inline-flex items-center gap-1 border border-[var(--border-warm)] cursor-pointer"
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
