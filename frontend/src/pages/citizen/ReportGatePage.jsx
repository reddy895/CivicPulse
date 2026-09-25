import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, LogIn, UserPlus, ClipboardList, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function ReportGatePage() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Already authenticated citizen → go straight to report
  if (isAuthenticated && role === 'citizen') {
    navigate('/report/new', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-white border border-[var(--border-warm)] shadow-xs flex items-center justify-center mx-auto mb-2">
          <ClipboardList className="w-8 h-8 text-[var(--accent-primary)]" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Report an Infrastructure Issue</h1>
          <p className="text-[var(--text-secondary)] mt-2 leading-relaxed text-sm">
            Sign in or create a citizen account to submit, verify, and track your infrastructure grievances with municipal authorities.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border-warm)] p-8 shadow-sm space-y-4">
          <div className="text-left space-y-2.5 mb-6">
            {[
              'Submit verified photo evidence with your report',
              'Track your complaint resolution stage in real-time',
              'Get notified when official work orders are issued',
              'Full multilingual translation and classification'
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
                <div className="w-5 h-5 rounded-full bg-[var(--status-success-bg)] flex items-center justify-center shrink-0 border border-[var(--status-success-border)]">
                  <Check className="w-3 h-3 text-[var(--status-success)]" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <Link to="/login" state={{ returnTo: '/report/new' }} className="w-full py-2.5 px-4 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-dark)] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer">
            <LogIn className="w-4 h-4" /> 
            <span>{t('auth.login')}</span> 
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/signup" state={{ returnTo: '/report/new' }} className="w-full py-2.5 px-4 rounded-lg bg-[var(--bg-secondary)] hover:bg-white text-[var(--text-primary)] border border-[var(--border-warm)] text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer">
            <UserPlus className="w-4 h-4" /> 
            <span>{t('auth.register')}</span>
          </Link>
        </div>

        <Link to="/" className="inline-block text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors">
          ← Back to NagarMithra
        </Link>
      </div>
    </div>
  );
}
