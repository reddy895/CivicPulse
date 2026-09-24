import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, Loader2, MapPin, Image, Clock, ChevronRight, CheckCircle2, AlertTriangle, Building2, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getRequests, updateComplaintStatus } from '../services/api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { toast } from '../components/ui/Toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const CATEGORIES = ['ALL','Roads & Public Transport','Water & Sanitation','Clean Energy & Grid','Healthcare & Clinics','Education & Schools','Digital Public Infrastructure','Flood & Climate Resilience'];
const SEVERITIES = ['ALL','Critical','High','Medium','Low'];
const STATUSES = ['ALL','Submitted','Verified','Assigned','In Progress','Resolved','Rejected'];

function EvidenceGallery({ complaintId, onOpenLightbox }) {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!complaintId) return;
    fetch(`${API_BASE}/complaints/${complaintId}/evidence`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setEvidence(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [complaintId]);

  if (loading) return <div className="flex gap-2">{[1,2,3].map(i=><div key={i} className="w-16 h-16 skeleton rounded-lg"/>)}</div>;
  if (!evidence.length) return <div className="text-xs text-[var(--text-tertiary)]">No photos uploaded</div>;

  return (
    <div className="flex gap-2 flex-wrap">
      {evidence.map((ev, i) => (
        <div key={ev.id} className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => onOpenLightbox(evidence, i)}>
          <img src={`http://localhost:8000${ev.storage_url}`} alt={`Evidence ${i+1}`} className="w-full h-full object-cover" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

export default function GovernmentPortal({ selectedCountry }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterCat, setFilterCat] = useState('ALL');
  const [filterSev, setFilterSev] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [statusInput, setStatusInput] = useState('Verified');
  const [notesInput, setNotesInput] = useState('');
  const [agencyInput, setAgencyInput] = useState('');
  const [updating, setUpdating] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => { loadComplaints(); }, [selectedCountry, filterCat, filterSev]);

  async function loadComplaints() {
    setLoading(true);
    const data = await getRequests(
      selectedCountry === 'ALL' ? null : selectedCountry,
      filterCat === 'ALL' ? null : filterCat,
      filterSev === 'ALL' ? null : filterSev
    );
    setComplaints(data);
    if (data.length && !selected) setSelected(data[0]);
    setLoading(false);
  }

  const filtered = complaints.filter(c => filterStatus === 'ALL' || (c.resolution_stage || c.status)?.includes(filterStatus));

  async function handleUpdateStatus(e) {
    e.preventDefault();
    if (!selected) return;
    setUpdating(true);
    try {
      const updated = await updateComplaintStatus(selected.id, statusInput, notesInput, agencyInput);
      setComplaints(prev => prev.map(c => c.id === selected.id ? { ...c, ...updated } : c));
      setSelected(prev => ({ ...prev, ...updated }));
      toast.success('Status updated successfully');
      setNotesInput('');
    } catch {
      toast.error(t('common.error'));
    }
    setUpdating(false);
  }

  return (
    <div className="container-xl py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{t('gov.dashboard')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Welcome, {user?.name} · {user?.department}</p>
        </div>
        <button onClick={loadComplaints} className="btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('gov.total_complaints'), value: complaints.length, color:'var(--accent-primary)', icon:'📋' },
          { label: t('gov.critical'), value: complaints.filter(c=>c.urgency==='Critical').length, color:'var(--status-danger)', icon:'🚨' },
          { label: t('gov.pending'), value: complaints.filter(c=>!['Resolved','Rejected'].some(s=>c.resolution_stage?.includes(s))).length, color:'var(--status-warning)', icon:'⏳' },
          { label: t('gov.resolved'), value: complaints.filter(c=>c.resolution_stage?.includes('Resolved')).length, color:'var(--status-success)', icon:'✅' },
        ].map((kpi, i) => (
          <div key={i} className="metric-card flex items-center gap-4">
            <div className="text-3xl">{kpi.icon}</div>
            <div>
              <div className="text-kpi" style={{fontSize:'1.8rem', color: kpi.color}}>{kpi.value}</div>
              <div className="text-kpi-sub">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-coffee p-4 mb-6 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="form-input w-auto text-sm" style={{width:'auto'}}>
          {CATEGORIES.map(c=><option key={c} value={c}>{c==='ALL'?t('map.all_categories'):c}</option>)}
        </select>
        <select value={filterSev} onChange={e=>setFilterSev(e.target.value)} className="form-input w-auto text-sm" style={{width:'auto'}}>
          {SEVERITIES.map(s=><option key={s} value={s}>{s==='ALL'?t('map.all_severities'):s}</option>)}
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="form-input w-auto text-sm" style={{width:'auto'}}>
          {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-[var(--text-tertiary)] ml-auto">{filtered.length} complaints</span>
      </div>

      {/* Split Panel */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Complaint List */}
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            Array(5).fill(0).map((_,i)=><div key={i} className="h-24 skeleton rounded-xl"/>)
          ) : filtered.map(complaint => (
            <button
              key={complaint.id}
              onClick={() => setSelected(complaint)}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                selected?.id === complaint.id
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 shadow-md'
                  : 'border-[var(--border-warm)] bg-white hover:border-[var(--accent-tertiary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-xs text-[var(--text-tertiary)]">#{complaint.id?.slice(-8)}</span>
                <StatusBadge status={complaint.urgency} />
              </div>
              <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 leading-snug">
                {complaint.translated_text || complaint.original_text}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--text-tertiary)]">
                <span>📍 {complaint.location_name}</span>
                <span>🏷️ {complaint.category?.split('&')[0]}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        {selected ? (
          <div className="lg:col-span-3 space-y-5">
            {/* Complaint header */}
            <div className="card-coffee p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="font-mono text-xs text-[var(--text-tertiary)]">#{selected.id}</div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mt-1">{selected.category}</h2>
                </div>
                <StatusBadge status={selected.urgency} />
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selected.translated_text || selected.original_text}</p>
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                  <MapPin className="w-3.5 h-3.5"/> {selected.location_name}
                </div>
                <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                  <Clock className="w-3.5 h-3.5"/> {new Date(selected.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* AI Assessment */}
            <div className="card-coffee p-5 border-l-4 border-l-[var(--status-info)]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[var(--status-info)]"/>
                <span className="font-bold text-sm text-[var(--text-primary)]">{t('ai.assessment')}</span>
                <span className="badge-pill badge-pill-info text-[10px]">{t('ai.requires_verification')}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-[var(--text-tertiary)] mb-1">{t('ai.severity')}</div>
                  <div className="font-bold text-[var(--text-primary)]">{selected.urgency}</div>
                </div>
                <div>
                  <div className="text-[var(--text-tertiary)] mb-1">{t('ai.confidence')}</div>
                  <div className="font-bold text-[var(--text-primary)]">{((selected.urgency_score||0.8)*100).toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-[var(--text-tertiary)] mb-1">{t('ai.category')}</div>
                  <div className="font-bold text-[var(--text-primary)] truncate">{selected.category?.split('&')[0]}</div>
                </div>
              </div>
            </div>

            {/* Evidence Gallery */}
            <div className="card-coffee p-5">
              <div className="font-bold text-sm text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Image className="w-4 h-4 text-[var(--accent-tertiary)]"/>
                {t('gov.evidence_gallery')}
              </div>
              <EvidenceGallery
                complaintId={selected.id}
                onOpenLightbox={(imgs, idx) => setLightbox({ images: imgs, index: idx })}
              />
            </div>

            {/* Status Update Form */}
            <div className="card-coffee p-5">
              <div className="font-bold text-sm text-[var(--text-primary)] mb-4">Update Complaint</div>
              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="form-label">{t('gov.change_status')}</label>
                  <select value={statusInput} onChange={e=>setStatusInput(e.target.value)} className="form-input">
                    {['Submitted','Verified','Assigned','In Progress','Resolved','Rejected'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">{t('gov.assign_dept')}</label>
                  <input type="text" value={agencyInput} onChange={e=>setAgencyInput(e.target.value)} className="form-input" placeholder="e.g., Municipal Works Department"/>
                </div>
                <div>
                  <label className="form-label">Official Notes</label>
                  <textarea value={notesInput} onChange={e=>setNotesInput(e.target.value)} rows={3} className="form-input resize-none" placeholder="Add resolution notes..."/>
                </div>
                <button type="submit" disabled={updating} className="btn-primary w-full justify-center">
                  {updating ? <><Loader2 className="w-4 h-4 animate-spin"/> Updating...</> : <><CheckCircle2 className="w-4 h-4"/> Update Status</>}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-3 flex items-center justify-center p-20 text-center">
            <div>
              <div className="text-4xl mb-3">📋</div>
              <div className="text-[var(--text-secondary)]">Select a complaint to review</div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer z-10">
            <X className="w-5 h-5"/>
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/10 rounded-full text-white text-sm">
            Evidence {lightbox.index + 1} / {lightbox.images.length}
          </div>
          <img
            src={`http://localhost:8000${lightbox.images[lightbox.index].storage_url}`}
            alt="Evidence"
            className="lightbox-image"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
