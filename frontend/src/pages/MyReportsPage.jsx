import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Image, ChevronRight, FileText, Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getRequests, upvoteRequest } from '../services/api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { toast } from '../components/ui/Toast';

const STATUS_TIMELINE = ['submitted', 'verified', 'assigned', 'in_progress', 'resolved'];

function ComplaintTimeline({ status }) {
  const { t } = useTranslation();
  const currentIndex = STATUS_TIMELINE.findIndex(s =>
    status?.toLowerCase().includes(s.replace('_', ' ')) || status?.toLowerCase().includes(s)
  );
  const active = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="flex items-center gap-0 mt-3">
      {STATUS_TIMELINE.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
              i < active ? 'bg-[var(--status-success)] text-white' :
              i === active ? 'bg-[var(--accent-primary)] text-white ring-2 ring-[var(--accent-primary)]/30' :
              'bg-[var(--bg-secondary)] text-[var(--text-tertiary)] border border-[var(--border-warm)]'
            }`}>
              {i < active ? '✓' : i + 1}
            </div>
            <span className="text-[8px] font-medium text-[var(--text-tertiary)] capitalize hidden sm:block whitespace-nowrap">
              {t(`status.${s}`)}
            </span>
          </div>
          {i < STATUS_TIMELINE.length - 1 && (
            <div className={`flex-1 h-0.5 mb-3 sm:mb-4 ${i < active ? 'bg-[var(--status-success)]' : 'bg-[var(--border-warm)]'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function MyReportsPage({ onNavigate }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReports(); }, [user]);

  async function loadReports() {
    setLoading(true);
    const reqs = await getRequests(user?.country_code || 'IND');
    const mine = reqs.filter(r => r.submitter_id === user?.id || r.submitter_name === user?.name);
    setReports(mine.length > 0 ? mine : reqs.slice(0, 5));
    setLoading(false);
  }

  if (loading) return (
    <div className="container-xl py-16 flex items-center justify-center gap-3 text-[var(--text-tertiary)]">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>{t('common.loading')}</span>
    </div>
  );

  if (reports.length === 0) return (
    <div className="container-md py-20 text-center">
      <div className="text-5xl mb-4">📋</div>
      <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('myReports.no_reports')}</h2>
      <p className="text-[var(--text-secondary)] mt-2 max-w-sm mx-auto">{t('myReports.no_reports_desc')}</p>
      <button onClick={() => onNavigate('citizen')} className="btn-primary mt-6">
        <FileText className="w-4 h-4" />
        {t('myReports.report_first')}
      </button>
    </div>
  );

  return (
    <div className="container-xl py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{t('myReports.title')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{reports.length} reports found</p>
        </div>
        <button onClick={loadReports} className="btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {reports.map((req, i) => (
          <article key={req.id || i} className="card-coffee p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[var(--text-tertiary)]">#{req.id}</span>
                  <span className="badge-pill badge-pill-neutral text-xs">{req.category}</span>
                </div>
                <p className="font-semibold text-sm text-[var(--text-primary)] mt-1.5 leading-snug line-clamp-2">
                  {req.translated_text || req.original_text}
                </p>
              </div>
              <StatusBadge status={req.urgency || 'Medium'} />
            </div>

            <ComplaintTimeline status={req.resolution_stage || req.status} />

            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-tertiary)] pt-2 border-t border-[var(--border-warm)]">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{req.location_name}</span>
              {req.evidence_count > 0 && <span className="flex items-center gap-1"><Image className="w-3.5 h-3.5" />{req.evidence_count} {t('myReports.evidence_photos')}</span>}
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(req.created_at).toLocaleDateString()}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
