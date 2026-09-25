import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Loader2, MapPin, Clock, Image, FileText, Check, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getRequests } from '../../services/api';
import { StatusBadge } from '../../components/ui/StatusBadge';

const STATUS_STEPS = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'];

function Timeline({ status }) {
  const active = STATUS_STEPS.findIndex(s => (status||'').toLowerCase().includes(s.toLowerCase()));
  const cur = active >= 0 ? active : 0;
  return (
    <div className="flex items-center gap-0 mt-3">
      {STATUS_STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${i < cur ? 'bg-[var(--status-success)] text-white' : i === cur ? 'bg-[var(--accent-primary)] text-white ring-2 ring-[var(--accent-primary)]/30' : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] border border-[var(--border-warm)]'}`}>
              {i < cur ? <Check className="w-3 h-3 text-white" /> : i + 1}
            </div>
            <span className="text-[8px] font-medium text-[var(--text-tertiary)] mt-1 hidden sm:block whitespace-nowrap">{s}</span>
          </div>
          {i < STATUS_STEPS.length - 1 && <div className={`flex-1 h-0.5 mb-3 ${i < cur ? 'bg-[var(--status-success)]' : 'bg-[var(--border-warm)]'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function CitizenDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [user]);

  async function load() {
    setLoading(true);
    const all = await getRequests(user?.country_code || 'IND');
    const mine = all.filter(r => r.submitter_id === user?.id || r.submitter_email === user?.email || r.submitter_name === user?.name);
    setReports(mine.length > 0 ? mine : all.slice(0, 6));
    setLoading(false);
  }

  return (
    <div className="container-xl py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">My Reports</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-secondary text-xs"><RefreshCw className="w-3.5 h-3.5"/>Refresh</button>
          <Link to="/report/new" className="btn-primary text-sm"><Plus className="w-4 h-4"/>New Report</Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{Array(3).fill(0).map((_,i)=><div key={i} className="h-28 skeleton rounded-xl"/>)}</div>
      ) : reports.length === 0 ? (
        <div className="card-coffee p-16 text-center">
          <ClipboardList className="w-12 h-12 text-[var(--accent-primary)] mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">No reports yet</h2>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">Start by reporting an infrastructure issue in your community.</p>
          <Link to="/report/new" className="btn-primary mt-6 inline-flex"><Plus className="w-4 h-4"/>Report First Issue</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r, i) => (
            <Link key={r.id||i} to={`/dashboard/reports/${r.id||i}`} className="card-coffee p-6 block hover:shadow-[var(--shadow-lg)] transition-all group">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[var(--text-tertiary)]">#{String(r.id||i).slice(-8).toUpperCase()}</span>
                    <span className="badge-pill badge-pill-neutral text-xs">{r.category}</span>
                    {r.evidence_count > 0 && <span className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]"><Image className="w-3 h-3"/>{r.evidence_count} photos</span>}
                  </div>
                  <p className="font-semibold text-sm text-[var(--text-primary)] mt-1.5 leading-snug line-clamp-2">{r.translated_text||r.original_text}</p>
                </div>
                <StatusBadge status={r.urgency||'Medium'}/>
              </div>
              <Timeline status={r.resolution_stage||r.status}/>
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-[var(--text-tertiary)]">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/>{r.location_name}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/>{new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
