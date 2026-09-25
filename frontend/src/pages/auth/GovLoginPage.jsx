import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, AlertTriangle, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, Building2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import brandLogo from '../../assets/civicpulse-logo.png';

const DEMO_EMAIL = 'govdemo@civicpulse.local';
const DEMO_PASS = 'Demo@123';

export default function GovLoginPage() {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASS);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    if (email === DEMO_EMAIL && password === DEMO_PASS) {
      loginAsDemo('government');
      navigate('/gov-demo');
      return;
    }
    const res = await login(email, password, 'government');
    setLoading(false);
    if (res.success) {
      navigate('/gov-demo');
    } else {
      setError(res.error || 'Invalid credentials. Use demo credentials shown below.');
    }
  };

  const handleQuickDemo = () => {
    loginAsDemo('government');
    navigate('/gov-demo');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[var(--bg-primary)]">
      <div className="w-full max-w-md space-y-6">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to NagarMithra Public</span>
        </Link>

        {/* Demo Banner */}
        <div className="p-4 rounded-xl border border-[#F59E0B]/30 bg-[#FEF3C7] flex items-start gap-3 text-xs text-[#92400E]">
          <AlertTriangle className="w-4 h-4 text-[#B8720A] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[#B8720A]">AUTHORIZED SIMULATION ENVIRONMENT</div>
            <div className="mt-0.5 leading-relaxed text-[#92400E]">
              This is an authenticated government command portal demonstration for evaluation and policy simulation.
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-[var(--border-warm)] p-8 shadow-sm space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <img 
              src={brandLogo} 
              alt="NagarMithra" 
              className="h-16 w-16 mx-auto object-contain mb-3 rounded-full shadow-sm" 
            />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--bg-secondary)] text-[var(--accent-primary)] border border-[var(--border-warm)]">
              <Building2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Government Portal Login</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              Agency Officer Sign-In
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Enter your official administrative credentials to access command tools
            </p>
          </div>

          {/* Quick Demo Fill Button */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-warm)] flex items-center justify-between gap-3">
            <div className="text-xs">
              <div className="font-bold text-[var(--text-primary)]">Fast Evaluator Demo</div>
              <div className="text-[11px] text-[var(--text-tertiary)]">One-click auto authenticate</div>
            </div>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-dark)] text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Sign In Instantly
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">Official Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.gov"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-warm)] rounded-lg pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">Clearance Key / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-warm)] rounded-lg pl-9 pr-9 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-dark)] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Government Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
