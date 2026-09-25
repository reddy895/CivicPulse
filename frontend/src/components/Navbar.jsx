import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe2, Bell, User, LogOut, ChevronDown, Building2, 
  Menu, X, Home, FileText, Map, BarChart3, Settings,
  Users, Shield, Layers, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n, { SUPPORTED_LANGUAGES } from '../i18n/index.js';
import logoImg from '../assets/logo.png';
import brandLogo from '../assets/civicpulse-logo.png';

const CITIZEN_NAV = [
  { id: 'home', labelKey: 'nav.home', icon: Home },
  { id: 'citizen', labelKey: 'nav.report', icon: FileText },
  { id: 'complaints', labelKey: 'nav.explore', icon: Layers },
  { id: 'map', labelKey: 'nav.map', icon: Map },
  { id: 'insights', labelKey: 'nav.insights', icon: BarChart3 },
];

const GOV_NAV = [
  { id: 'stream', labelKey: 'nav.overview', icon: Home },
  { id: 'complaints', labelKey: 'nav.complaints', icon: FileText },
  { id: 'map', labelKey: 'nav.map', icon: Map },
  { id: 'recommendations', labelKey: 'nav.analytics', icon: BarChart3 },
  { id: 'misalignment', labelKey: 'nav.departments', icon: Building2 },
];

export default function Navbar({ 
  activeTab, 
  setActiveTab,
  selectedCountry, 
  setSelectedCountry,
  onOpenPalette 
}) {
  const { user, role, logout, switchRoleDemo } = useAuth();
  const { t } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const langRef = useRef(null);
  const profileRef = useRef(null);

  const navItems = role === 'government' ? GOV_NAV : CITIZEN_NAV;
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLangChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('civicpulse_lang', code);
    setCurrentLang(code);
    setLangOpen(false);
  };

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ---- DESKTOP NAVBAR ---- */}
      <header className="sticky top-0 z-50 bg-white border-b border-[var(--border-warm)] shadow-[var(--shadow-xs)]">
        <div className="container-xl flex items-center justify-between h-16 gap-4">
          
          {/* Brand */}
          <button 
            onClick={() => handleNavClick('map')}
            className="flex items-center gap-2.5 shrink-0 group cursor-pointer"
            aria-label="CivicPulse Home"
          >
            <img 
              src={brandLogo} 
              alt="CivicPulse" 
              className="h-10 w-10 sm:h-11 sm:w-11 object-contain transition-transform duration-200 group-hover:scale-105 rounded-full" 
            />
            <div className="flex flex-col text-left">
              <span className="text-lg sm:text-xl font-black tracking-tight text-[var(--text-primary)] leading-tight flex items-center">
                <span>Civic</span><span className="text-[var(--accent-primary)]">Pulse</span>
              </span>
              <span className="text-[9px] tracking-wider uppercase text-[var(--text-tertiary)] font-bold leading-none hidden sm:block">
                People • Issues • Better Cities
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[var(--accent-primary)] text-white shadow-[var(--shadow-accent)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--accent-tertiary)]' : ''}`} />
                  {t(item.labelKey)}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">

            {/* Language Selector */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all border border-transparent hover:border-[var(--border-warm)] cursor-pointer"
                aria-label="Select language"
                aria-expanded={langOpen}
              >
                <Globe2 className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">{currentLangObj.nativeLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-[var(--radius-lg)] border border-[var(--border-warm)] shadow-[var(--shadow-xl)] py-1.5 z-50 min-w-[180px]"
                  role="listbox" aria-label="Language options">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-[var(--bg-secondary)] transition-colors text-left cursor-pointer"
                      role="option"
                      aria-selected={currentLang === lang.code}
                    >
                      <div>
                        <span className="font-semibold text-[var(--text-primary)]">{lang.nativeLabel}</span>
                        <span className="ml-2 text-[var(--text-tertiary)] text-xs">{lang.label}</span>
                      </div>
                      {currentLang === lang.code && (
                        <Check className="w-4 h-4 text-[var(--accent-primary)]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications (demo badge) */}
            <button 
              className="relative w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" style={{width:'18px',height:'18px'}} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--status-danger)] ring-2 ring-white" aria-hidden="true" />
            </button>

            {/* Role Switcher (Demo) */}
            <button
              onClick={() => switchRoleDemo(role === 'government' ? 'citizen' : 'government')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold border border-[var(--border-warm)] text-[var(--text-secondary)] hover:border-[var(--accent-tertiary)] hover:text-[var(--accent-primary)] transition-all cursor-pointer"
              title="Switch role (demo)"
            >
              {role === 'government' ? (
                <><User className="w-3.5 h-3.5" /> Citizen View</>
              ) : (
                <><Building2 className="w-3.5 h-3.5" /> Gov View</>
              )}
            </button>

            {/* Profile */}
            {user && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--bg-secondary)] transition-all cursor-pointer border border-transparent hover:border-[var(--border-warm)]"
                  aria-expanded={profileOpen}
                  aria-label="Profile menu"
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--text-primary)] text-[var(--text-inverse)] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-[var(--text-primary)] leading-none">{user.name}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5 capitalize">{user.role}</div>
                  </div>
                  <ChevronDown className={`hidden lg:block w-3.5 h-3.5 text-[var(--text-tertiary)] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-[var(--radius-lg)] border border-[var(--border-warm)] shadow-[var(--shadow-xl)] py-1.5 z-50 min-w-[200px]">
                    <div className="px-4 py-3 border-b border-[var(--border-warm)]">
                      <div className="font-bold text-sm text-[var(--text-primary)]">{user.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{user.email}</div>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all cursor-pointer"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ---- MOBILE MENU ---- */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-[var(--bg-primary)] overflow-y-auto">
          <nav className="p-4 space-y-1" role="navigation" aria-label="Mobile navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-md)] text-base font-medium transition-all cursor-pointer text-left ${
                    isActive 
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t(item.labelKey)}
                </button>
              );
            })}
            
            <div className="pt-4 border-t border-[var(--border-warm)] mt-4">
              <div className="px-4 mb-3 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                {t('nav.language')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { handleLangChange(lang.code); setMobileMenuOpen(false); }}
                    className={`px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all cursor-pointer ${
                      currentLang === lang.code
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-warm)]'
                    }`}
                  >
                    {lang.nativeLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-warm)]">
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-md)] text-base font-medium text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] transition-all cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                {t('nav.logout')}
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
