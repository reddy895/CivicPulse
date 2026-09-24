import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, AlertTriangle, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
    // Check demo credentials
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
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: '#0F1923' }}>
      <div className="w-full max-w-md">
        {/* Back */}
        <Link to="/" className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 mb-8 transition-colors">
          ← Back to CivicPulse
        </Link>

        {/* Demo Banner */}
        <div className="mb-6 p-4 rounded-[var(--radius-lg)] border border-yellow-500/30 bg-yellow-500/10 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-yellow-400">DEMO ENVIRONMENT</div>
            <div className="text-xs text-yellow-300/70 mt-1">
              This is a government portal simulation for demonstration only.
              Not connected to any real government systems.
            </div>
          </div>
        </div>

        <div className="bg-[#162030] border border-white/10 rounded-[var(--radius-xl)] p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-tertiary)]/20 border border-[var(--accent-tertiary)]/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[var(--accent-tertiary)]" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white">Government Portal</h1>
              <p className="text-xs text-white/40">Sign in to access the operations dashboard</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-5 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/30 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input id="gov-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[var(--accent-tertiary)]/60 focus:ring-1 focus:ring-[var(--accent-tertiary)]/30 transition-all"
                  placeholder="govdemo@civicpulse.local" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input id="gov-password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-[var(--radius-md)] bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[var(--accent-tertiary)]/60 focus:ring-1 focus:ring-[var(--accent-tertiary)]/30 transition-all"
                  placeholder="Demo@123" required />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Demo credentials hint */}
            <div className="p-3 rounded-[var(--radius-md)] bg-white/5 border border-white/10 text-xs text-white/40 space-y-1">
              <div><span className="text-white/60">Demo Email:</span> {DEMO_EMAIL}</div>
              <div><span className="text-white/60">Demo Password:</span> {DEMO_PASS}</div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-[var(--radius-md)] bg-[var(--accent-tertiary)] text-[var(--text-primary)] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--accent-secondary)] transition-colors cursor-pointer disabled:opacity-50 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : <>Sign In to Government Portal <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-[#162030] text-xs text-white/30">or</span></div>
          </div>

          <button onClick={handleQuickDemo}
            className="w-full py-2.5 rounded-[var(--radius-md)] bg-white/5 border border-white/10 text-white/70 font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
            <Shield className="w-4 h-4" /> Quick Demo Access (No credentials needed)
          </button>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Return to public website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
