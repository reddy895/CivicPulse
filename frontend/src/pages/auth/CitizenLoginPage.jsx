import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, User, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import logoImg from '../../assets/logo.png';
import brandLogo from '../../assets/civicpulse-logo.png';

export default function CitizenLoginPage() {
  const { login, loginAsDemo } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    const res = await login(email, password, 'citizen');
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Invalid credentials.');
    }
  };

  const handleDemo = () => {
    loginAsDemo('citizen');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Back to public */}
        <Link to="/" className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] mb-8 transition-colors">
          ← Back to NagarMithra
        </Link>

        <div className="card-coffee p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img src={brandLogo} alt="NagarMithra" className="h-16 w-16 mx-auto mb-4 object-contain rounded-full shadow-sm" />
            <h1 className="text-xl font-extrabold text-[var(--text-primary)]">{t('auth.login')}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Citizen Portal — Sign in to report infrastructure issues</p>
          </div>

          {/* Fast Evaluator Demo Banner */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-warm)] flex items-center justify-between gap-3 mb-6 shadow-xs">
            <div className="text-xs">
              <div className="font-bold text-[var(--text-primary)]">Fast Evaluator Demo</div>
              <div className="text-[11px] text-[var(--text-secondary)]">One-click instant authentication</div>
            </div>
            <button
              type="button"
              onClick={handleDemo}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-dark)] text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Sign In Instantly
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-5 rounded-[var(--radius-md)] bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-sm text-[var(--status-danger)]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">{t('auth.email')}</label>
                <button
                  type="button"
                  onClick={() => { setEmail('citizen@civicpulse.org'); setPassword('demo123'); }}
                  className="text-[11px] text-[var(--accent-primary)] hover:underline font-medium cursor-pointer"
                >
                  Prefill Demo
                </button>
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                <input 
                  id="citizen-email" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" 
                  className="form-input form-input-with-icon-left pl-11" 
                  style={{ paddingLeft: '44px' }}
                  autoComplete="email" 
                  required 
                />
              </div>
            </div>
            <div>
              <label className="form-label mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                <input 
                  id="citizen-password" 
                  type={showPw ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="form-input form-input-with-icon-left pl-11 pr-11" 
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  autoComplete="current-password" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] cursor-pointer hover:text-[var(--text-primary)] p-0.5"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : <>{t('auth.login')} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-warm)]" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-white text-xs text-[var(--text-tertiary)]">or</span></div>
          </div>

          <button 
            type="button"
            onClick={handleDemo} 
            className="btn-secondary w-full justify-center text-sm"
          >
            <User className="w-4 h-4" /> Quick Demo — Citizen Login
          </button>

          <p className="text-center text-sm text-[var(--text-tertiary)] mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-[var(--accent-primary)] hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
