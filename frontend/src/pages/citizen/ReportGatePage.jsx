import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, LogIn, UserPlus } from 'lucide-react';
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
      <div className="w-full max-w-lg text-center space-y-8">
        <div className="text-6xl mb-2">📋</div>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Report an Infrastructure Issue</h1>
          <p className="text-[var(--text-secondary)] mt-3 leading-relaxed text-sm">
            You need a citizen account to submit and track your infrastructure reports. Sign in or create a free account to continue.
          </p>
        </div>

        <div className="card-coffee p-8 space-y-4">
          <div className="text-left space-y-2 mb-6">
            {['Submit photo evidence with your report','Track your complaint status in real-time','Get notified when government takes action','Full multilingual support'].map((feat, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                <div className="w-5 h-5 rounded-full bg-[var(--status-success-bg)] flex items-center justify-center flex-shrink-0">
                  <span className="text-[var(--status-success)] text-xs">✓</span>
                </div>
                {feat}
              </div>
            ))}
          </div>

          <Link to="/login" state={{ returnTo: '/report/new' }} className="btn-primary w-full justify-center">
            <LogIn className="w-4 h-4" /> {t('auth.login')} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/signup" state={{ returnTo: '/report/new' }} className="btn-secondary w-full justify-center">
            <UserPlus className="w-4 h-4" /> {t('auth.register')}
          </Link>
        </div>

        <Link to="/" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors">
          ← Back to CivicPulse
        </Link>
      </div>
    </div>
  );
}
