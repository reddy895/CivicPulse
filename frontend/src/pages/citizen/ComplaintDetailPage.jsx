import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Image, Sparkles, CheckCircle2, AlertCircle, Loader2, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRequests } from '../../services/api';
import { StatusBadge } from '../../components/ui/StatusBadge';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const STATUS_STEPS = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'];

function Lightbox({ images, index, onClose }) {
  const [cur, setCur] = useState(index);
  useEffect(() => {
    const h = (e) => { if (e.key==='Escape') onClose(); if (e.key==='ArrowLeft') setCur(v=>(v-1+images.length)%images.length); if (e.key==='ArrowRight') setCur(v=>(v+1)%images.length); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [images.length, onClose]);
  const src = images[cur].storage_url ? `http://localhost:8000${images[cur].storage_url}` : images[cur].preview;
  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal>
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer z-10"><X className="w-5 h-5"/></button>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/10 rounded-full text-white text-sm">{cur+1} / {images.length}</div>
      {images.length>1 && <>
        <button onClick={e=>{e.stopPropagation();setCur(v=>(v-1+images.length)%images.length)}} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer"><ChevronLeft className="w-6 h-6"/></button>
        <button onClick={e=>{e.stopPropagation();setCur(v=>(v+1)%images.length)}} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer"><ChevronRight className="w-6 h-6"/></button>
      </>}
      <img src={src} alt={`Evidence ${cur+1}`} className="lightbox-image" onClick={e=>e.stopPropagation()}/>
    </div>
  );
}

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    const all = await getRequests(user?.country_code || 'IND');
    const found = all.find(r => r.id === id || String(r.id) === id);
    setComplaint(found || null);
    if (found) {
      try {
        const r = await fetch(`${API_BASE}/complaints/${id}/evidence`);
        if (r.ok) setEvidence(await r.json());
      } catch {}
    }
    setLoading(false);
  }

  if (loading) return <div className="container-md py-16 flex justify-center gap-3 text-[var(--text-tertiary)]"><Loader2 className="w-5 h-5 animate-spin"/> Loading...</div>;
  if (!complaint) return (
    <div className="container-md py-16 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="text-xl font-bold text-[var(--text-primary)]">Report not found</h2>
      <Link to="/dashboard" className="btn-primary mt-6 inline-flex"><ArrowLeft className="w-4 h-4"/> Back to Dashboard</Link>
    </div>
  );

  const active = STATUS_STEPS.findIndex(s => (complaint.resolution_stage||complaint.status||'').toLowerCase().includes(s.toLowerCase()));
  const cur = active >= 0 ? active : 0;

  return (
    <div className="container-md py-10">
      <Link to="/dashboard" className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4"/> Back to My Reports
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div className="card-coffee p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div>
              <div className="font-mono text-xs text-[var(--text-tertiary)]">#{String(complaint.id).slice(-8).toUpperCase()}</div>
              <h1 className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{complaint.category}</h1>
            </div>
            <StatusBadge status={complaint.urgency||'Medium'}/>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{complaint.translated_text||complaint.original_text}</p>
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/>{complaint.location_name}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/>{new Date(complaint.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="card-coffee p-6">
          <h2 className="font-bold text-sm text-[var(--text-primary)] mb-4">Complaint Status</h2>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < cur ? 'bg-[var(--status-success)] text-white' : i === cur ? 'bg-[var(--accent-primary)] text-white ring-2 ring-[var(--accent-primary)]/30' : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] border border-[var(--border-warm)]'}`}>
                    {i < cur ? '✓' : i + 1}
                  </div>
                  <span className="text-[9px] font-medium text-[var(--text-tertiary)] mt-1 hidden sm:block whitespace-nowrap">{s}</span>
                </div>
                {i < STATUS_STEPS.length-1 && <div className={`flex-1 h-0.5 mb-3 ${i < cur ? 'bg-[var(--status-success)]' : 'bg-[var(--border-warm)]'}`}/>}
              </React.Fragment>
            ))}
          </div>
          {complaint.official_notes && (
            <div className="mt-4 p-3 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)]">
              <strong>Government Note:</strong> {complaint.official_notes}
            </div>
          )}
          {complaint.assigned_agency && (
            <div className="mt-2 text-xs text-[var(--text-tertiary)]">Assigned to: <strong className="text-[var(--text-primary)]">{complaint.assigned_agency}</strong></div>
          )}
        </div>

        {/* Evidence */}
        <div className="card-coffee p-6">
          <h2 className="font-bold text-sm text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Image className="w-4 h-4 text-[var(--accent-tertiary)]"/> Evidence ({evidence.length} photo{evidence.length!==1?'s':''})
          </h2>
          {evidence.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {evidence.map((ev, i) => (
                <div key={ev.id||i} className="evidence-thumbnail" onClick={()=>setLightbox(i)}>
                  <img src={`http://localhost:8000${ev.storage_url}`} alt={`Evidence ${i+1}`} loading="lazy"/>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded-[var(--radius-md)]">
                    <ZoomIn className="w-5 h-5 text-white"/>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-[var(--text-tertiary)]">No photos were uploaded with this report.</div>
          )}
        </div>

        {/* AI Assessment */}
        <div className="card-coffee p-6 border-l-4 border-l-[var(--status-info)]">
          <div className="flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-[var(--status-info)]"/><span className="font-bold text-sm text-[var(--text-primary)]">AI Assessment</span><span className="badge-pill badge-pill-info text-[10px]">Requires verification</span></div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div><div className="text-[var(--text-tertiary)] mb-1">Severity</div><div className="font-bold text-[var(--text-primary)]">{complaint.urgency||'High'}</div></div>
            <div><div className="text-[var(--text-tertiary)] mb-1">Confidence</div><div className="font-bold text-[var(--text-primary)]">{((complaint.urgency_score||0.8)*100).toFixed(0)}%</div></div>
            <div><div className="text-[var(--text-tertiary)] mb-1">Category</div><div className="font-bold text-[var(--text-primary)] truncate">{complaint.category?.split('&')[0]}</div></div>
          </div>
        </div>
      </div>

      {lightbox !== null && evidence.length > 0 && <Lightbox images={evidence} index={lightbox} onClose={()=>setLightbox(null)}/>}
    </div>
  );
}
