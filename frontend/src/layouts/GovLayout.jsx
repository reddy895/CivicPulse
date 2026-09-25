import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Map, BarChart3, Building2, LogOut, AlertTriangle, Menu, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import brandLogo from '../assets/civicpulse-logo.png';

const GOV_NAV = [
  { to: '/gov-demo', icon: Home, label: 'Overview', exact: true },
  { to: '/gov-demo/complaints', icon: FileText, label: 'Complaints' },
  { to: '/gov-demo/map', icon: Map, label: 'GIS Command Map' },
  { to: '/gov-demo/analytics', icon: BarChart3, label: 'Decision Analytics' },
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
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Official Simulation Notice Banner */}
      <div className="bg-[#FEF3C7] border-b border-[#F59E0B]/30 text-[#92400E] text-xs font-semibold py-2 px-4 flex items-center justify-center gap-2 text-center z-50">
        <ShieldAlert className="w-4 h-4 text-[#B8720A] shrink-0" />
        <span>OFFICIAL SIMULATION — Government Decision Intelligence Console. Authenticated for authorized personnel only.</span>
      </div>

      {/* Gov Executive Topbar */}
      <header className="sticky top-0 z-40 bg-[#1E110A] border-b border-[#D4A373]/20 shadow-[var(--shadow-xs)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-6">
          
          {/* Brand Logo & Authority Label */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/gov-demo" className="flex items-center shrink-0" aria-label="CivicPulse Government">
              <img 
                src={brandLogo} 
                alt="CivicPulse - Citizen Data • Stronger Communities" 
                className="h-10 sm:h-11 w-auto object-contain transition-transform duration-200 hover:scale-105 rounded-md" 
              />
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#D4A373]/15 text-[#D4A373] border border-[#D4A373]/30">
              Government Portal
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4 flex-1">
            {GOV_NAV.map(item => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link 
                  key={item.to} 
                  to={item.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    active 
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User & Actions Controls */}
          <div className="flex items-center gap-3 ml-auto">
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-bold text-white leading-tight">{user.name}</div>
                  <div className="text-[10px] text-[#D4A373] font-medium leading-tight">{user.department || 'Ministry Administrator'}</div>
                </div>
                
                <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] text-white border border-[#D4A373]/40 flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>

                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  title="Sign out of Government Portal"
                  className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <button 
              onClick={() => setSidebarOpen(v => !v)} 
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/70 hover:bg-white/10 cursor-pointer"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {sidebarOpen && (
          <div className="md:hidden bg-[#1E110A] border-t border-white/10 py-3 px-4 shadow-xl">
            <div className="space-y-1">
              {GOV_NAV.map(item => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link 
                    key={item.to} 
                    to={item.to} 
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      active 
                        ? 'bg-[var(--accent-primary)] text-white' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> 
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              <button 
                onClick={() => { logout(); navigate('/'); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-900/30 transition-all cursor-pointer mt-2 pt-2 border-t border-white/10"
              >
                <LogOut className="w-4 h-4" /> 
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Government Content Area with aligned maximum container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
