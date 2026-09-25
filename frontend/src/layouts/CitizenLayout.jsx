import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Map, BarChart3, Home, ChevronDown, LogOut, Globe2, Check, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n, { SUPPORTED_LANGUAGES } from '../i18n/index.js';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import brandLogo from '../assets/civicpulse-logo.png';

const CITIZEN_NAV = [
  { to: '/dashboard', icon: Home, label: 'My Reports' },
  { to: '/report/new', icon: FileText, label: 'New Report' },
];

export default function CitizenLayout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLangChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('civicpulse_lang', code);
    setCurrentLang(code);
    setLangOpen(false);
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-50 bg-[#1E110A] border-b border-[#D4A373]/20 shadow-[var(--shadow-xs)]">
        <div className="container-xl flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="NagarMithra">
            <img 
              src={brandLogo} 
              alt="NagarMithra - Citizen Data • Stronger Communities" 
              className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105 rounded-full" 
            />
            <span className="font-extrabold text-base tracking-tight text-white hidden sm:inline-block">
              NagarMithra
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {CITIZEN_NAV.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
              return (
                <Link key={item.to} to={item.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all ${
                    active ? 'bg-[var(--accent-primary)] text-white shadow-[var(--shadow-accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            {/* Language */}
            <div className="relative">
              <button onClick={() => setLangOpen(v => !v)} className="flex items-center gap-1.5 px-2.5 py-2 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all cursor-pointer">
                <Globe2 className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-medium">{currentLangObj.nativeLabel}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-[var(--radius-lg)] border border-[var(--border-warm)] shadow-[var(--shadow-xl)] py-1.5 min-w-[170px] z-50">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button key={lang.code} onClick={() => handleLangChange(lang.code)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[var(--bg-secondary)] cursor-pointer">
                      <span className="font-medium text-[var(--text-primary)]">{lang.nativeLabel}</span>
                      {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User */}
            {user && (
              <div className="flex items-center gap-2.5 pl-3 border-l border-[var(--border-warm)]">
                <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="hidden lg:block text-sm font-semibold text-[var(--text-primary)]">{user.name}</span>
                <button onClick={() => { logout(); navigate('/'); }} className="text-[var(--text-tertiary)] hover:text-[var(--status-danger)] transition-colors p-1 cursor-pointer">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <button onClick={() => setMobileOpen(v => !v)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] cursor-pointer">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-[var(--border-warm)] py-2">
            <div className="container-xl space-y-1">
              {CITIZEN_NAV.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]">
                    <Icon className="w-4 h-4" /> {item.label}
                  </Link>
                );
              })}
              <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)]">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>
    </div>
  );
}
