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
      <header className="sticky top-0 z-40 bg-[#1E110A] border-b border-[#D4A373]/20 shadow-md">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Authority Label */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/gov-demo" className="flex items-center gap-2.5 shrink-0" aria-label="CivicPulse Government">
              <img 
                src={brandLogo} 
                alt="CivicPulse" 
                className="h-9 sm:h-10 w-9 sm:w-10 object-contain transition-transform duration-150 hover:scale-105 rounded-full" 
              />
              <div className="flex flex-col text-left">
                <span className="text-base sm:text-lg font-black tracking-tight text-white leading-tight flex items-center">
                  <span>Civic</span><span className="text-[#D4A373]">Pulse</span>
                </span>
                <span className="text-[9px] tracking-wider uppercase text-white/50 font-bold leading-none hidden sm:block">
                  Gov Command Console
                </span>
              </div>
            </Link>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#D4A373]/15 text-[#D4A373] border border-[#D4A373]/30 whitespace-nowrap">
              Gov Portal
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 xl:gap-2 shrink-0">
            {GOV_NAV.map(item => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link 
                  key={item.to} 
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-lg text-xs xl:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    active 
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm ring-1 ring-[#D4A373]/30' 
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user && (
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-white/15">
                <div className="hidden lg:block text-right max-w-[200px] xl:max-w-[240px]">
                  <div className="text-xs font-bold text-white leading-tight truncate">{user.name}</div>
                  <div className="text-[10px] text-[#D4A373] font-medium leading-tight truncate">{user.department || 'Ministry Administrator'}</div>
                </div>
                
                <div 
                  className="w-8 h-8 rounded-full bg-[var(--accent-primary)] text-white border border-[#D4A373]/50 flex items-center justify-center font-bold text-xs shadow-sm shrink-0"
                  title={`${user.name} (${user.department || 'Authorized Official'})`}
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>

                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  title="Sign out of Government Portal"
                  className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <button 
              onClick={() => setSidebarOpen(v => !v)} 
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/80 hover:bg-white/10 cursor-pointer shrink-0"
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
