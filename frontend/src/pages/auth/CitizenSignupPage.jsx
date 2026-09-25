import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, Globe2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import logoImg from '../../assets/logo.png';
import brandLogo from '../../assets/civicpulse-logo.png';

export default function CitizenSignupPage() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', country_code: 'IND', district: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Please fill in all required fields.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    const res = await register({ ...form, role: 'citizen' });
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] mb-8 transition-colors">
          ← Back to NagarMithra
        </Link>

        <div className="card-coffee p-8">
          <div className="text-center mb-8">
            <img src={brandLogo} alt="NagarMithra" className="h-16 w-16 mx-auto mb-4 object-contain rounded-full shadow-sm" />
            <h1 className="text-xl font-extrabold text-[var(--text-primary)]">{t('auth.register')}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Create your citizen account to submit reports</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-5 rounded-[var(--radius-md)] bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-sm text-[var(--status-danger)]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">{t('auth.name')} <span className="text-[var(--status-danger)]">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input id="signup-name" type="text" value={form.name} onChange={set('name')} placeholder="Your full name" className="form-input pl-10" required />
              </div>
            </div>
            <div>
              <label className="form-label">{t('auth.email')} <span className="text-[var(--status-danger)]">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                <input 
                  id="signup-email" 
                  type="email" 
                  value={form.email} 
                  onChange={set('email')} 
                  placeholder="you@example.com" 
                  className="form-input form-input-with-icon-left pl-11" 
                  style={{ paddingLeft: '44px' }}
                  required 
                />
              </div>
            </div>
            <div>
              <label className="form-label">{t('auth.password')} <span className="text-[var(--status-danger)]">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
                <input 
                  id="signup-password" 
                  type={showPw ? 'text' : 'password'} 
                  value={form.password} 
                  onChange={set('password')} 
                  placeholder="Min. 6 characters" 
                  className="form-input form-input-with-icon-left pl-11 pr-11" 
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  required 
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] cursor-pointer hover:text-[var(--text-primary)]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Country</label>
                <select value={form.country_code} onChange={set('country_code')} className="form-input">
                  <option value="IND">India</option>
                  <option value="BRA">Brazil</option>
                  <option value="ZAF">South Africa</option>
                  <option value="USA">USA</option>
                </select>
              </div>
              <div>
                <label className="form-label">District</label>
                <input type="text" value={form.district} onChange={set('district')} placeholder="Your district" className="form-input" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <>{t('auth.register')} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-tertiary)] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--accent-primary)] hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
