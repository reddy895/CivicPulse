import React from 'react';
import { Sparkles, Command, User, Building2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

const BRICS_NATIONS = [
  { code: 'IND', name: 'India (भारत - National)', flag: '🇮🇳' },
  { code: 'ALL', name: 'All Global Regions', flag: '🌐' },
  { code: 'USA', name: 'USA (Disability Data)', flag: '🇺🇸' },
  { code: 'BRA', name: 'Brazil (Brasil)', flag: '🇧🇷' },
  { code: 'ZAF', name: 'South Africa', flag: '🇿🇦' },
  { code: 'CHN', name: 'China (中国)', flag: '🇨🇳' },
  { code: 'RUS', name: 'Russia (Россия)', flag: '🇷🇺' }
];

const UI_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'pt', label: 'Português' },
  { code: 'zh', label: '中文' },
  { code: 'ru', label: 'Русский' },
  { code: 'zu', label: 'isiZulu' }
];

export default function Navbar({ 
  selectedCountry, 
  setSelectedCountry,
  uiLang,
  setUiLang,
  onOpenCopilot,
  onOpenPalette
}) {
  const { user, role, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E8E0D5] px-8 py-3 flex items-center justify-between gap-4 shadow-[0_1px_3px_rgba(44,24,16,0.02)]">
      
      {/* Left: Brand Circle Logo & Telemetry & Portal Indicator */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-black p-0.5 shadow-sm border border-[#D4A373]/60 flex items-center justify-center shrink-0 overflow-hidden">
          <img 
            src={logoImg} 
            alt="CivicPulse" 
            className="w-full h-full rounded-full object-cover" 
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5A8F6E] animate-pulse" />
          <span className="text-xs font-bold text-[#2C1810]">
            {role === 'government' ? 'Government Command Center' : 'Citizen Grievance Portal'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        
        {/* Quick Search Shortcut */}
        <button
          onClick={onOpenPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FDFBF7] border border-[#E8E0D5] text-xs text-[#5C4A42] hover:text-[#2C1810] hover:border-[#D4A373] transition-colors cursor-pointer"
        >
          <Command className="w-3.5 h-3.5 text-[#6F4E37]" />
          <span className="text-xs">Search...</span>
          <kbd className="font-mono text-[10px] bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E8E0D5] text-[#9C8C84]">⌘K</kbd>
        </button>

        {/* BRICS Country Selector */}
        <div className="relative">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="form-input py-1.5 px-3 text-xs font-medium cursor-pointer"
          >
            {BRICS_NATIONS.map((n) => (
              <option key={n.code} value={n.code}>
                {n.flag} {n.name}
              </option>
            ))}
          </select>
        </div>

        {/* User Profile Badge */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-[#E8E0D5]">
            <div className="w-7 h-7 rounded-full bg-[#2C1810] text-[#FDFBF7] flex items-center justify-center font-bold text-xs">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden lg:block text-left text-[11px]">
              <span className="font-bold text-[#2C1810] block truncate max-w-[120px]">{user.name}</span>
              <span className="text-[#8C7A70] block capitalize">{user.role}</span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-[#8C7A70] hover:text-[#B54A4A] transition rounded-lg hover:bg-[#FAF6F0]"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

    </header>
  );
}
