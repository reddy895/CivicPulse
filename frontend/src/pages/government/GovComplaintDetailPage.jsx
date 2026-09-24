import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Clock, Image as ImageIcon, Sparkles, 
  CheckCircle2, AlertTriangle, Shield, Send, Loader2, 
  ExternalLink, Building2, DollarSign, FileText, ChevronRight,
  ZoomIn, X, Users
} from 'lucide-react';
import { getRequestById, updateComplaintStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AGENCIES = [
  'Municipal Public Works & Infrastructure Dept',
  'State Water Supply & Sewerage Board',
  'Urban Power Transmission & Grid Corp',
  'Department of Health & Family Welfare',
  'State Disaster Management Authority',
  'District Collector & Magistrate Office',
  'Road Transport & Highway Authority'
];

const STATUS_OPTIONS = [
  'Under Official Review',
  'Work Order Dispatched',
  'Contractor On-Site Inspection',
  'Engineering Remediation In Progress',
  'Resolved & Verified',
  'Rejected / Outside Jurisdiction'
];

export default function GovComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  // Form states
  const [statusInput, setStatusInput] = useState('Work Order Dispatched');
  const [agencyInput, setAgencyInput] = useState(AGENCIES[0]);
  const [notesInput, setNotesInput] = useState('');
  const [budgetInput, setBudgetInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadDetails();
  }, [id]);

  async function loadDetails() {
    setLoading(true);
    try {
      const data = await getRequestById(id);
      setComplaint(data);
      if (data) {
        if (data.status) setStatusInput(data.status);
        if (data.assigned_agency) setAgencyInput(data.assigned_agency);
        if (data.official_notes) setNotesInput(data.official_notes);
        if (data.allocated_budget_usd) setBudgetInput(data.allocated_budget_usd);
      }

      // Fetch evidence list
      try {
        const evRes = await fetch(`/api/complaints/${id}/evidence`);
        if (evRes.ok) {
          const evData = await evRes.json();
          setEvidenceList(evData.evidence || []);
        }
      } catch (e) {
        console.warn('Could not fetch evidence:', e);
      }
    } catch (err) {
      console.error('Failed to load complaint:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!complaint) return;

    setIsSubmitting(true);
    try {
      const budgetVal = budgetInput ? parseFloat(budgetInput) : null;
      const updated = await updateComplaintStatus(
        complaint.id,
        statusInput,
        notesInput || 'Official work order dispatched for field resolution.',
        agencyInput,
        budgetVal
      );

      if (updated) {
        setComplaint(prev => ({
          ...prev,
          ...updated,
          status: statusInput,
          assigned_agency: agencyInput,
          official_notes: notesInput,
          allocated_budget_usd: budgetVal
        }));
        setSuccessMessage('Status updated successfully! Work order logged in public audit ledger.');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">Critical Urgency</span>;
      case 'High':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">High Urgency</span>;
      case 'Medium':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Medium Urgency</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-300 border border-gray-500/30">Standard Urgency</span>;
    }
  };

  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('resolved')) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Resolved & Verified</span>;
    }
    if (s.includes('dispatched') || s.includes('progress') || s.includes('action')) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Work Order Dispatched</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Pending Review</span>;
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-white/50 text-sm space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--accent-tertiary)]" />
        <p>Loading grievance record {id}...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="py-24 text-center text-white space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold">Grievance Not Found</h2>
        <p className="text-white/60 text-xs">The record "{id}" does not exist in the municipal registry.</p>
        <Link to="/gov-demo/complaints" className="inline-block px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold">
          Return to Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="text-white space-y-6 pb-20">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/gov-demo/complaints')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Complaints</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-white/40">
          <span>Grievance Record:</span>
          <span className="font-mono text-white font-bold">{complaint.id}</span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-[#162030] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-sm font-bold text-[var(--accent-tertiary)] px-2.5 py-0.5 rounded bg-[var(--accent-tertiary)]/10 border border-[var(--accent-tertiary)]/30">
                {complaint.id}
              </span>
              {getUrgencyBadge(complaint.urgency)}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/80">
                {complaint.category}
              </span>
              {getStatusBadge(complaint.status)}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {complaint.translated_text || complaint.original_text}
            </h1>

            <div className="flex items-center gap-4 text-xs text-white/50 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/40" />
                Submitted {complaint.created_at ? new Date(complaint.created_at).toLocaleString() : 'Recently'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/40" />
                {complaint.location_name || 'Geo-Coordinates'} ({complaint.state_province || complaint.country_name})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-white/40" />
                {complaint.upvotes || 1} Citizen Upvotes
              </span>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 Cols): Details, Evidence, AI Diagnostic */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Citizen Statement */}
          <div className="bg-[#162030] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accent-tertiary)]" />
              Citizen Grievance Statement
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#0F1923] border border-white/10">
                <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1">
                  English / Standard Translation
                </div>
                <p className="text-xs text-white/90 leading-relaxed">
                  {complaint.translated_text || complaint.original_text}
                </p>
              </div>

              {complaint.original_text && complaint.original_text !== complaint.translated_text && (
                <div className="p-4 rounded-xl bg-[#0F1923] border border-white/10">
                  <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1">
                    Original Citizen Input ({complaint.language_name || complaint.language || 'Native'})
                  </div>
                  <p className="text-xs text-white/70 italic leading-relaxed">
                    "{complaint.original_text}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Photo Evidence Gallery */}
          <div className="bg-[#162030] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                Physical Evidence & Field Photos
              </h3>
              <span className="text-xs text-white/40 font-mono">
                {evidenceList.length} Attached
              </span>
            </div>

            {evidenceList.length === 0 ? (
              <div className="py-8 text-center bg-[#0F1923] rounded-xl border border-white/5 text-white/40 text-xs space-y-1">
                <ImageIcon className="w-6 h-6 mx-auto text-white/20" />
                <p>No photo evidence was attached to this complaint submission.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {evidenceList.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveLightboxImg(item.url || `/api/evidence/${item.file_id}`)}
                    className="relative group rounded-xl overflow-hidden aspect-video bg-[#0F1923] border border-white/10 cursor-pointer"
                  >
                    <img
                      src={item.url || `/api/evidence/${item.file_id}`}
                      alt={`Evidence ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Diagnostic Assessment Panel */}
          <div className="bg-[#162030] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Automated Triage Diagnostics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#0F1923] border border-white/5 space-y-1">
                <div className="text-[10px] text-white/40 uppercase">Urgency Score</div>
                <div className="text-base font-bold text-red-400">
                  {Math.round((complaint.urgency_score || 0.85) * 100)} / 100
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0F1923] border border-white/5 space-y-1">
                <div className="text-[10px] text-white/40 uppercase">Sentiment Index</div>
                <div className="text-base font-bold text-amber-400">
                  {complaint.sentiment_score !== undefined ? `${complaint.sentiment_score}` : '-0.75'} (Distressed)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0F1923] border border-white/5 space-y-1">
                <div className="text-[10px] text-white/40 uppercase">Est. Affected</div>
                <div className="text-base font-bold text-cyan-400">
                  {complaint.extracted_entities?.affected_count_estimate ? `${complaint.extracted_entities.affected_count_estimate}+` : '200+ Citizens'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0F1923] border border-white/5 text-xs text-white/70 space-y-1.5 leading-relaxed">
              <div className="font-semibold text-white/90 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                AI Triage Recommendation
              </div>
              <p>
                Issue prioritized for immediate site investigation due to high infrastructure vulnerability and citizen clustering in this municipal grid.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column (5 Cols): Government Action Center & Status Dispatch */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Action Center Card */}
          <div className="bg-[#162030] border-2 border-[var(--accent-tertiary)]/30 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
              <Building2 className="w-5 h-5 text-[var(--accent-tertiary)]" />
              <div>
                <h3 className="text-sm font-bold text-white">Government Action Center</h3>
                <p className="text-[11px] text-white/50">Issue work order & update public resolution status</p>
              </div>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              
              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">
                  Resolution Status Stage
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full bg-[#0F1923] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--accent-tertiary)] transition"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Agency Assignment */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">
                  Assigned Executing Agency
                </label>
                <select
                  value={agencyInput}
                  onChange={(e) => setAgencyInput(e.target.value)}
                  className="w-full bg-[#0F1923] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--accent-tertiary)] transition"
                >
                  {AGENCIES.map(agency => (
                    <option key={agency} value={agency}>{agency}</option>
                  ))}
                </select>
              </div>

              {/* Budget Allocation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">
                  Allocated Emergency Budget ($ USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full bg-[#0F1923] border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--accent-tertiary)] transition"
                  />
                </div>
              </div>

              {/* Official Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">
                  Official Directive / Engineering Notes
                </label>
                <textarea
                  rows={4}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Enter official resolution directive, assigned contractor, or inspection findings for citizen audit..."
                  className="w-full bg-[#0F1923] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[var(--accent-tertiary)] transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting Directive...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Issue Work Order & Update Status</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Location & GPS Info */}
          <div className="bg-[#162030] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              Geographic Deployment Coordinates
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">District / Zone:</span>
                <span className="font-semibold text-white">{complaint.location_name || 'Varanasi District'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">State / Region:</span>
                <span className="font-semibold text-white">{complaint.state_province || 'Uttar Pradesh'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/40">Latitude:</span>
                <span className="font-mono text-[var(--accent-tertiary)]">{complaint.latitude?.toFixed(4) || '25.3176'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-white/40">Longitude:</span>
                <span className="font-mono text-[var(--accent-tertiary)]">{complaint.longitude?.toFixed(4) || '82.9739'}</span>
              </div>
            </div>

            <Link
              to="/gov-demo/map"
              className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <span>View On Live GIS Command Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

      {/* Lightbox Modal */}
      {activeLightboxImg && (
        <div 
          onClick={() => setActiveLightboxImg(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setActiveLightboxImg(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activeLightboxImg}
              alt="Enlarged Evidence"
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}

    </div>
  );
}
