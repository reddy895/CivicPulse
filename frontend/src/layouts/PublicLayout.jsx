import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe2, ChevronDown, Check, Menu, X, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n, { SUPPORTED_LANGUAGES } from '../i18n/index.js';
import logoImg from '../assets/logo.png';
import brandLogo from '../assets/civicpulse-logo.png';

const NAV_LINKS = [
  { to: '/#how', label: 'How It Works' },
  { to: '/#infrastructure', label: 'Infrastructure' },
  { to: '/#impact', label: 'Impact' },
  { to: '/explore', label: 'Explore' },
];

export default function PublicLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location]);

  const handleLangChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('civicpulse_lang', code);
    setCurrentLang(code);
    setLangOpen(false);
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* ── PUBLIC NAVBAR ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-[var(--border-warm)] shadow-[var(--shadow-sm)]'
            : 'bg-transparent'
        }`}
      >
        <div className="container-xl flex items-center h-16 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 group mr-2" aria-label="CivicPulse">
            <img 
              src={brandLogo} 
              alt="CivicPulse - Citizen Data • Stronger Communities" 
              className="h-10 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105 rounded-md" 
            />
          </Link>

          {/* Desktop Nav Center */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(link => (
              <a
                key={link.to}
                href={link.to}
                onClick={e => {
                  if (link.to.startsWith('/#')) {
                    e.preventDefault();
                    const id = link.to.slice(2);
                    if (location.pathname !== '/') {
                      navigate('/');
                      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 200);
                    } else {
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className={`px-3.5 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all cursor-pointer ${
                  scrolled
                    ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Language */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all cursor-pointer ${
                  scrolled
                    ? 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Globe2 className="w-4 h-4" />
                <span className="hidden sm:inline">{currentLangObj.nativeLabel}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-[var(--radius-lg)] border border-[var(--border-warm)] shadow-[var(--shadow-xl)] py-1.5 min-w-[180px] z-50">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button key={lang.code} onClick={() => handleLangChange(lang.code)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-[var(--bg-secondary)] cursor-pointer">
                      <div>
                        <span className="font-semibold text-[var(--text-primary)]">{lang.nativeLabel}</span>
                        <span className="ml-2 text-[var(--text-tertiary)] text-xs">{lang.label}</span>
                      </div>
                      {currentLang === lang.code && <Check className="w-4 h-4 text-[var(--accent-primary)]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Gov Demo button */}
            <Link
              to="/gov-demo/login"
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-md)] text-xs font-bold border transition-all cursor-pointer ${
                scrolled
                  ? 'border-[var(--border-warm)] text-[var(--text-secondary)] hover:border-[var(--accent-tertiary)] hover:text-[var(--accent-primary)] bg-white'
                  : 'border-white/30 text-white/90 hover:border-white/70 hover:bg-white/10'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>GOVERNMENT PORTAL</span>
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className={`md:hidden w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] transition-all cursor-pointer ${scrolled ? 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]' : 'text-white/80 hover:bg-white/10'}`}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-b border-[var(--border-warm)] shadow-lg">
            <nav className="container-xl py-3 space-y-1">
              {NAV_LINKS.map(link => (
                <a key={link.to} href={link.to}
                  className="block px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all">
                  {link.label}
                </a>
              ))}
              <Link to="/gov-demo/login" className="flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-md)] text-sm font-bold text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 text-center mt-2">
                <Building2 className="w-4 h-4" />
                <span>GOVERNMENT PORTAL</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
