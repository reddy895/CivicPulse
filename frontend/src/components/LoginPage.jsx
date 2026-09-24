import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, User, Building2, Globe2, Sparkles, ArrowRight, CheckCircle2, AlertCircle, KeyRound, MapPin, Radio
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

export default function LoginPage() {
  const { login, register, switchRoleDemo } = useAuth();
  
  const [activeRoleTab, setActiveRoleTab] = useState('citizen'); // 'citizen' | 'government'
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('IND');
  const [district, setDistrict] = useState('');
  const [department, setDepartment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickDemoLogin = (demoRole) => {
    switchRoleDemo(demoRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    if (isRegisterMode) {
      if (!name || !email || !password) {
        setErrorMsg('Please fill in all required fields.');
        setIsSubmitting(false);
        return;
      }
      const res = await register({
        name,
        email,
        password,
        role: activeRoleTab,
        country_code: countryCode,
        district,
        department
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } else {
      if (!email || !password) {
        setErrorMsg('Please enter your email and password.');
        setIsSubmitting(false);
        return;
      }
      const res = await login(email, password, activeRoleTab);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials or unauthorized role.');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2C1810] flex flex-col justify-between selection:bg-[#D4A373]/30">
      
      {/* Top Header Bar */}
      <header className="bg-[#FFFFFF] border-b border-[#E8E0D5] py-3.5 px-8 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-black p-0.5 shadow-md border-2 border-[#D4A373]/60 flex items-center justify-center shrink-0 overflow-hidden">
              <img 
                src={logoImg} 
                alt="CivicPulse Logo" 
                className="w-full h-full rounded-full object-cover" 
              />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#2C1810] flex items-center gap-2">
                CivicPulse DPG
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]">
                  DPGA Standard v1.4.0
                </span>
              </h1>
              <p className="text-xs text-[#5C4A42]">Multilingual AI Infrastructure Alignment & Real-Time GIS Command Gateway</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs text-[#5C4A42]">
            <span className="flex items-center gap-1.5 text-[#5A8F6E] font-medium">
              <ShieldCheck className="w-4 h-4" />
              100% Differential Privacy Compliant
            </span>
            <span>•</span>
            <span>BRICS Sovereign AI Engine</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Feature & Persona Banner (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#2C1810] via-[#3E2723] to-[#4E342E] rounded-3xl p-8 text-[#FDFBF7] flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-[#D4A373]/10 blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A373]/20 border border-[#D4A373]/30 text-[#E6CCB2] text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Select Portal Access Mode
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight leading-tight text-[#FDFBF7] mb-4">
                Dual Authenticated Infrastructure Gateway
              </h2>

              <p className="text-sm text-[#D4C3B7] leading-relaxed mb-8">
                CivicPulse provides tailored, role-secured portals connecting citizen grassroots demands directly with national government planning maps in real time.
              </p>

              <div className="space-y-4">
                <div 
                  onClick={() => setActiveRoleTab('citizen')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    activeRoleTab === 'citizen'
                      ? 'bg-[#FFFFFF]/15 border-[#D4A373] shadow-md ring-2 ring-[#D4A373]/50'
                      : 'bg-[#FFFFFF]/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#D4A373]/30 text-[#FDFBF7] mt-0.5">
                      <User className="w-5 h-5 text-[#E6CCB2]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#FDFBF7] flex items-center justify-between">
                        1. Citizen Grievance Portal
                        {activeRoleTab === 'citizen' && <span className="text-xs text-[#E6CCB2] font-normal">Active Mode</span>}
                      </h3>
                      <p className="text-xs text-[#D4C3B7] mt-1 leading-normal">
                        Auto-detects GPS coordinates, AI grievance categorization, tracks resolution stages live.
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveRoleTab('government')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    activeRoleTab === 'government'
                      ? 'bg-[#FFFFFF]/15 border-[#D4A373] shadow-md ring-2 ring-[#D4A373]/50'
                      : 'bg-[#FFFFFF]/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#D4A373]/30 text-[#FDFBF7] mt-0.5">
                      <Building2 className="w-5 h-5 text-[#E6CCB2]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#FDFBF7] flex items-center justify-between">
                        2. Government Command Center
                        {activeRoleTab === 'government' && <span className="text-xs text-[#E6CCB2] font-normal">Active Mode</span>}
                      </h3>
                      <p className="text-xs text-[#D4C3B7] mt-1 leading-normal">
                        Real-time GIS map, live incoming complaint radar, MCDA project prioritizer, policy simulator & tender studio.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Credentials Footer Card */}
            <div className="mt-8 pt-6 border-t border-white/15">
              <div className="flex items-center justify-between text-xs text-[#D4C3B7] mb-3">
                <span className="font-semibold text-[#E6CCB2]">Instant 1-Click Evaluation Access:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('citizen')}
                  className="py-2.5 px-3 rounded-xl bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 text-[#FDFBF7] border border-white/15 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Demo Citizen</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('government')}
                  className="py-2.5 px-3 rounded-xl bg-[#D4A373] hover:bg-[#C78D3F] text-[#2C1810] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Demo Gov Official</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Authentication Form Card (7 Cols) */}
          <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E8E0D5] rounded-3xl p-8 shadow-sm flex flex-col justify-between">
            <div>
              {/* Role Selector Tabs */}
              <div className="flex items-center p-1 bg-[#FAF6F0] rounded-2xl border border-[#E8E0D5] mb-6">
                <button
                  type="button"
                  onClick={() => setActiveRoleTab('citizen')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeRoleTab === 'citizen'
                      ? 'bg-[#FFFFFF] text-[#2C1810] shadow-sm border border-[#E8E0D5]'
                      : 'text-[#8C7A70] hover:text-[#2C1810]'
                  }`}
                >
                  <User className="w-4 h-4 text-[#D4A373]" />
                  <span>Citizen Portal Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRoleTab('government')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeRoleTab === 'government'
                      ? 'bg-[#2C1810] text-[#FDFBF7] shadow-sm'
                      : 'text-[#8C7A70] hover:text-[#2C1810]'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#D4A373]" />
                  <span>Gov Command Login</span>
                </button>
              </div>

              {/* Header Title */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#2C1810]">
                  {isRegisterMode 
                    ? `Register New ${activeRoleTab === 'government' ? 'Government Official Account' : 'Citizen Profile'}`
                    : `Sign In to ${activeRoleTab === 'government' ? 'Government Command Center' : 'Citizen Grievance Gateway'}`
                  }
                </h3>
                <p className="text-xs text-[#5C4A42] mt-1">
                  {activeRoleTab === 'government' 
                    ? 'Authorized access for ministry directors, municipal engineers, and policy auditors.'
                    : 'Submit infrastructure grievances, auto-detect location, and monitor real-time resolution stages.'
                  }
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 mb-6 rounded-xl bg-[#FDF2F2] border border-[#F87171] text-[#B54A4A] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {isRegisterMode && (
                  <div>
                    <label className="block text-xs font-semibold text-[#5C4A42] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rajesh Sharma / Dr. Sunita Rao"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E0D5] bg-[#FAF6F0]/50 text-xs font-medium text-[#2C1810] focus:ring-2 focus:ring-[#D4A373] outline-none"
                      />
                      <User className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-3" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#5C4A42] mb-1.5">
                    {activeRoleTab === 'government' ? 'Government Email / ID' : 'Email Address / Phone Number'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeRoleTab === 'government' ? 'director.infra@gov.in' : 'citizen.india@civicpulse.org'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E0D5] bg-[#FAF6F0]/50 text-xs font-medium text-[#2C1810] focus:ring-2 focus:ring-[#D4A373] outline-none"
                    />
                    <KeyRound className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C4A42] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E0D5] bg-[#FAF6F0]/50 text-xs font-medium text-[#2C1810] focus:ring-2 focus:ring-[#D4A373] outline-none"
                    />
                    <Lock className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-3" />
                  </div>
                </div>

                {isRegisterMode && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#5C4A42] mb-1.5">
                        Target Nation
                      </label>
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#E8E0D5] bg-[#FAF6F0]/50 text-xs font-medium text-[#2C1810] focus:ring-2 focus:ring-[#D4A373] outline-none"
                      >
                        <option value="IND">🇮🇳 India</option>
                        <option value="BRA">🇧🇷 Brazil</option>
                        <option value="ZAF">🇿🇦 South Africa</option>
                        <option value="CHN">🇨🇳 China</option>
                        <option value="RUS">🇷🇺 Russia</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5C4A42] mb-1.5">
                        {activeRoleTab === 'government' ? 'Department' : 'District / City'}
                      </label>
                      <input
                        type="text"
                        value={activeRoleTab === 'government' ? department : district}
                        onChange={(e) => activeRoleTab === 'government' ? setDepartment(e.target.value) : setDistrict(e.target.value)}
                        placeholder={activeRoleTab === 'government' ? 'Ministry of Public Works' : 'Varanasi District'}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#E8E0D5] bg-[#FAF6F0]/50 text-xs font-medium text-[#2C1810] focus:ring-2 focus:ring-[#D4A373] outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                    activeRoleTab === 'government'
                      ? 'bg-[#2C1810] hover:bg-[#3E2723] text-[#FDFBF7]'
                      : 'bg-[#D4A373] hover:bg-[#C78D3F] text-[#2C1810]'
                  }`}
                >
                  {isSubmitting ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>{isRegisterMode ? 'Complete Registration & Access Portal' : `Authenticate & Launch ${activeRoleTab === 'government' ? 'Command Center' : 'Citizen Portal'}`}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

              {/* Demo Fill Helper Buttons */}
              <div className="mt-6 pt-4 border-t border-[#E8E0D5]">
                <div className="text-[11px] font-semibold text-[#8C7A70] mb-2 flex items-center justify-between">
                  <span>Quick-Fill Sample Credentials:</span>
                  <span className="text-[#5A8F6E] font-normal">Password: citizen123 / admin123</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeRoleTab === 'citizen' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => { setEmail('citizen.india@civicpulse.org'); setPassword('citizen123'); }}
                        className="py-1 px-2.5 rounded-lg bg-[#FAF6F0] border border-[#E8E0D5] text-[11px] font-medium text-[#5C4A42] hover:bg-[#E8E0D5]/50"
                      >
                        🇮🇳 Rajesh (India)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmail('citizen.brazil@civicpulse.org'); setPassword('citizen123'); }}
                        className="py-1 px-2.5 rounded-lg bg-[#FAF6F0] border border-[#E8E0D5] text-[11px] font-medium text-[#5C4A42] hover:bg-[#E8E0D5]/50"
                      >
                        🇧🇷 Maria (Brazil)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmail('citizen.safrica@civicpulse.org'); setPassword('citizen123'); }}
                        className="py-1 px-2.5 rounded-lg bg-[#FAF6F0] border border-[#E8E0D5] text-[11px] font-medium text-[#5C4A42] hover:bg-[#E8E0D5]/50"
                      >
                        🇿🇦 Sipho (South Africa)
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => { setEmail('director.infra@gov.in'); setPassword('admin123'); }}
                        className="py-1 px-2.5 rounded-lg bg-[#FAF6F0] border border-[#E8E0D5] text-[11px] font-medium text-[#5C4A42] hover:bg-[#E8E0D5]/50"
                      >
                        🏛️ Dr. Rao (India Director)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmail('minister.planning@gov.br'); setPassword('admin123'); }}
                        className="py-1 px-2.5 rounded-lg bg-[#FAF6F0] border border-[#E8E0D5] text-[11px] font-medium text-[#5C4A42] hover:bg-[#E8E0D5]/50"
                      >
                        🏛️ Santos (Brazil Minister)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmail('admin.brics@civicpulse.org'); setPassword('admin123'); }}
                        className="py-1 px-2.5 rounded-lg bg-[#FAF6F0] border border-[#E8E0D5] text-[11px] font-medium text-[#5C4A42] hover:bg-[#E8E0D5]/50"
                      >
                        🌐 BRICS Global Admin
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Mode Switcher Link */}
            <div className="mt-6 pt-4 border-t border-[#E8E0D5] text-center">
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-xs text-[#5C4A42] hover:text-[#2C1810] font-semibold underline underline-offset-4"
              >
                {isRegisterMode 
                  ? 'Already registered? Return to Login' 
                  : `Don't have an account? Create a new ${activeRoleTab === 'government' ? 'Official' : 'Citizen'} account`}
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#FFFFFF] border-t border-[#E8E0D5] py-4 px-8 text-center text-xs text-[#8C7A70]">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CivicPulse DPG • sovereign BRICS AI Multilingual Gateway & Decision Intelligence</span>
          <span className="text-[#5A8F6E] font-semibold">DPGA Standard v1.4.0 Certified</span>
        </div>
      </footer>

    </div>
  );
}
