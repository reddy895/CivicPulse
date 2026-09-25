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
      let evItems = [];
      try {
        const evRes = await fetch(`/api/complaints/${id}/evidence`);
        if (evRes.ok) {
          const evData = await evRes.json();
          evItems = Array.isArray(evData) ? evData : (evData.evidence || evData.items || []);
        }
      } catch (e) {
        console.warn('Could not fetch evidence:', e);
      }

      // Check fallback to data.evidence or data.image_url if API returned empty
      if (evItems.length === 0 && data) {
        if (data.evidence && data.evidence.length > 0) {
          evItems = data.evidence;
        } else if (data.image_url) {
          evItems = [{
            id: 'primary',
            file_id: 'primary',
            storage_url: data.image_url,
            url: data.image_url,
            filename: 'evidence.jpg'
          }];
        }
      }
      setEvidenceList(evItems);
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
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger-border)]">Critical Urgency</span>;
      case 'High':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">High Urgency</span>;
      case 'Medium':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--status-info-bg)] text-[var(--status-info)] border border-[var(--status-info-border)]">Medium Urgency</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-warm)]">Standard Urgency</span>;
    }
  };

  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('resolved')) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--status-success-bg)] text-[var(--status-success)] border border-[var(--status-success-border)]">Resolved & Verified</span>;
    }
    if (s.includes('dispatched') || s.includes('progress') || s.includes('action')) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--status-info-bg)] text-[var(--status-info)] border border-[var(--status-info-border)]">Work Order Dispatched</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">Pending Review</span>;
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[var(--text-tertiary)] text-sm space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--accent-primary)]" />
        <p>Loading grievance record {id}...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="py-24 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-[var(--status-warning)] mx-auto" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Grievance Not Found</h2>
        <p className="text-[var(--text-secondary)] text-xs">The record "{id}" does not exist in the municipal registry.</p>
        <Link to="/gov-demo/complaints" className="inline-block px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-semibold">
          Return to Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/gov-demo/complaints')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Complaints</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <span>Grievance Record:</span>
          <span className="font-mono text-[var(--text-primary)] font-bold">{complaint.id}</span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white border border-[var(--border-warm)] rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[var(--border-divider)]">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-[var(--accent-primary)] px-2.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-warm)]">
                {complaint.id}
              </span>
              {getUrgencyBadge(complaint.urgency)}
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-warm)]">
                {complaint.category}
              </span>
              {getStatusBadge(complaint.status)}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight leading-snug">
              {complaint.translated_text || complaint.original_text}
            </h1>

            <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] flex-wrap">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                Submitted {complaint.created_at ? new Date(complaint.created_at).toLocaleString() : 'Recently'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                {complaint.location_name || 'Geo-Coordinates'} ({complaint.state_province || complaint.country_name})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                {complaint.upvotes || 1} Citizen Endorsements
              </span>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-lg bg-[var(--status-success-bg)] border border-[var(--status-success-border)] text-[var(--status-success)] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (7 Cols): Details, Evidence, AI Diagnostic */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Citizen Statement */}
          <div className="bg-white border border-[var(--border-warm)] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
              Citizen Grievance Statement
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-warm)]">
                <div className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider mb-1">
                  English / Standard Translation
                </div>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed font-medium">
                  {complaint.translated_text || complaint.original_text}
                </p>
              </div>

              {complaint.original_text && complaint.original_text !== complaint.translated_text && (
                <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-warm)]">
                  <div className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider mb-1">
                    Original Citizen Submission ({complaint.language_name || complaint.language || 'Native'})
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                    "{complaint.original_text}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Photo Evidence Gallery */}
          <div className="bg-white border border-[var(--border-warm)] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[var(--accent-primary)]" />
                Physical Evidence & Field Documentation
              </h3>
              <span className="text-xs text-[var(--text-tertiary)] font-mono">
                {evidenceList.length} Attached
              </span>
            </div>

            {evidenceList.length === 0 ? (
              <div className="py-8 text-center bg-[var(--bg-primary)] rounded-lg border border-[var(--border-warm)] text-[var(--text-tertiary)] text-xs space-y-1">
                <ImageIcon className="w-6 h-6 mx-auto text-[var(--text-placeholder)]" />
                <p>No external photo attachments submitted for this record.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {evidenceList.map((item, idx) => {
                  const rawSrc = item.storage_url || item.url || (item.filename ? `/api/evidence/${id}/${item.filename}` : `/api/evidence/${item.file_id}`);
                  const displaySrc = rawSrc.startsWith('http') || rawSrc.startsWith('data:') ? rawSrc : rawSrc;
                  return (
                    <div 
                      key={idx}
                      onClick={() => setActiveLightboxImg(displaySrc)}
                      className="relative group rounded-lg overflow-hidden aspect-video bg-[var(--bg-secondary)] border border-[var(--border-warm)] cursor-pointer"
                    >
                      <img
                        src={displaySrc}
                        alt={`Evidence ${idx + 1}`}
                        onError={(e) => {
                          if (!e.target.src.includes('localhost:8000') && !e.target.src.startsWith('data:')) {
                            e.target.src = `http://localhost:8000${rawSrc.startsWith('/') ? rawSrc : '/' + rawSrc}`;
                          }
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <ZoomIn className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Diagnostic Assessment Panel */}
          <div className="bg-white border border-[var(--border-warm)] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
              Automated Triage Diagnostics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-warm)] space-y-1">
                <div className="text-[10px] text-[var(--text-tertiary)] font-semibold uppercase">Urgency Score</div>
                <div className="text-base font-bold font-mono text-[var(--status-danger)]">
                  {Math.round((complaint.urgency_score || 0.85) * 100)} / 100
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-warm)] space-y-1">
                <div className="text-[10px] text-[var(--text-tertiary)] font-semibold uppercase">Sentiment Index</div>
                <div className="text-base font-bold font-mono text-[var(--status-warning)]">
                  {complaint.sentiment_score !== undefined ? `${complaint.sentiment_score}` : '-0.75'}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-warm)] space-y-1">
                <div className="text-[10px] text-[var(--text-tertiary)] font-semibold uppercase">Est. Affected</div>
                <div className="text-base font-bold font-mono text-[var(--text-primary)]">
                  {complaint.extracted_entities?.affected_count_estimate ? `${complaint.extracted_entities.affected_count_estimate}+` : '200+ Citizens'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-warm)] text-xs text-[var(--text-secondary)] space-y-1.5 leading-relaxed">
              <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[var(--status-success)]" />
                AI Triage Recommendation
              </div>
              <p>
                Issue prioritized for rapid dispatch due to verified infrastructure deficit metrics and community density in this municipal grid.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column (5 Cols): Government Action Center & Status Dispatch */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Action Center Card */}
          <div className="bg-white border-2 border-[var(--accent-tertiary)]/50 rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--border-divider)]">
              <Building2 className="w-5 h-5 text-[var(--accent-primary)]" />
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Government Action Center</h3>
                <p className="text-[11px] text-[var(--text-secondary)]">Issue work order & update public resolution status</p>
              </div>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              
              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Resolution Status Stage
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-warm)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition cursor-pointer"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Agency Assignment */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Assigned Executing Agency
                </label>
                <select
                  value={agencyInput}
                  onChange={(e) => setAgencyInput(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-warm)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition cursor-pointer"
                >
                  {AGENCIES.map(agency => (
                    <option key={agency} value={agency}>{agency}</option>
                  ))}
                </select>
              </div>

              {/* Budget Allocation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Allocated Emergency Budget ($ USD)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-warm)] rounded-lg pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition"
                  />
                </div>
              </div>

              {/* Official Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-primary)]">
                  Official Directive / Engineering Directive
                </label>
                <textarea
                  rows={4}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Enter official resolution directive, assigned contractor, or inspection findings for citizen audit..."
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-warm)] rounded-lg p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-dark)] text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="bg-white border border-[var(--border-warm)] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--accent-primary)]" />
              Deployment Coordinates
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[var(--border-divider)]">
                <span className="text-[var(--text-tertiary)]">District / Zone:</span>
                <span className="font-semibold text-[var(--text-primary)]">{complaint.location_name || 'District Center'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-divider)]">
                <span className="text-[var(--text-tertiary)]">State / Region:</span>
                <span className="font-semibold text-[var(--text-primary)]">{complaint.state_province || 'Karnataka'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-divider)]">
                <span className="text-[var(--text-tertiary)]">Latitude:</span>
                <span className="font-mono text-[var(--accent-primary)] font-bold">{complaint.latitude?.toFixed(4) || '12.9716'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[var(--text-tertiary)]">Longitude:</span>
                <span className="font-mono text-[var(--accent-primary)] font-bold">{complaint.longitude?.toFixed(4) || '77.5946'}</span>
              </div>
            </div>

            <Link
              to="/gov-demo/map"
              className="w-full py-2 px-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--accent-primary)] hover:text-white text-[var(--text-primary)] text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-[var(--border-warm)]"
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
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setActiveLightboxImg(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 p-2"
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
