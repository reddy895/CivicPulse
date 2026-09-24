import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Map, BarChart3, Building2, LogOut, AlertTriangle, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import brandLogo from '../assets/civicpulse-logo.png';

const GOV_NAV = [
  { to: '/gov-demo', icon: Home, label: 'Overview', exact: true },
  { to: '/gov-demo/complaints', icon: FileText, label: 'Complaints' },
  { to: '/gov-demo/map', icon: Map, label: 'Map' },
  { to: '/gov-demo/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function GovLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item) => item.exact
    ? location.pathname === item.to
    : location.pathname === item.to || location.pathname.startsWith(item.to + '/');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0F1923' }}>
      {/* Demo Banner */}
      <div className="bg-[#92400E]/90 text-white text-xs font-semibold py-2 px-4 flex items-center justify-center gap-2 text-center z-50">
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
        DEMO ENVIRONMENT — Government Simulation Only. Not real credentials or real government data.
      </div>

      {/* Gov Topbar */}
      <header className="bg-[#162030] border-b border-white/10 sticky top-0 z-40">
        <div className="container-xl flex items-center h-14 gap-4">
          {/* Logo */}
          <Link to="/gov-demo" className="flex items-center shrink-0" aria-label="CivicPulse Government">
            <img 
              src={brandLogo} 
              alt="CivicPulse - Citizen Data • Stronger Communities" 
              className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 hover:scale-105 rounded-md" 
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {GOV_NAV.map(item => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link key={item.to} to={item.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all ${
                    active ? 'bg-[var(--accent-tertiary)] text-[var(--text-primary)]' : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 ml-auto">
            {user && (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-white">{user.name}</div>
                  <div className="text-[10px] text-white/40">{user.department || 'Government Official'}</div>
                </div>
                <div className="w-7 h-7 rounded-full bg-[var(--accent-tertiary)] flex items-center justify-center font-bold text-xs text-[var(--text-primary)]">
                  {user.name?.charAt(0)}
                </div>
                <button onClick={() => { logout(); navigate('/'); }}
                  className="text-white/40 hover:text-white transition-colors p-1 cursor-pointer ml-1">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            <button onClick={() => setSidebarOpen(v => !v)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-white/60 hover:bg-white/10 cursor-pointer">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {sidebarOpen && (
          <div className="md:hidden bg-[#162030] border-t border-white/10 py-2">
            <div className="container-xl space-y-1">
              {GOV_NAV.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium ${isActive(item) ? 'bg-[var(--accent-tertiary)]/20 text-[var(--accent-tertiary)]' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
                    <Icon className="w-4 h-4" /> {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>
    </div>
  );
}
