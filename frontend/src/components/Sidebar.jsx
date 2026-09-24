import React from 'react';
import { 
  MapPin, Activity, Sparkles, Layers, Radio, Database, Users, Building2, ShieldCheck, LogOut, FileText, BarChart3, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

const GOV_SECTIONS = [
  {
    group: 'COMMAND & GIS',
    items: [
      { id: 'map', label: 'Real-Time GIS Command Map', icon: MapPin },
      { id: 'stream', label: 'Live Grievances Stream', icon: Activity }
    ]
  },
  {
    group: 'DECISION ENGINE',
    items: [
      { id: 'recommendations', label: 'AI Project Ranking (MCDA)', icon: BarChart3 },
      { id: 'complaints', label: 'Disability & Grievances Data', icon: Users }
    ]
  },
  {
    group: 'POLICY & AUDIT',
    items: [
      { id: 'misalignment', label: 'Spend Gap Matrix', icon: AlertTriangle },
      { id: 'simulator', label: 'Policy Scenario Sandbox', icon: Sparkles }
    ]
  },
  {
    group: 'DATA & STANDARDS',
    items: [
      { id: 'dpg', label: 'DPG Open Registry', icon: Database }
    ]
  }
];

const CITIZEN_SECTIONS = [
  {
    group: 'CITIZEN SERVICES',
    items: [
      { id: 'citizen', label: 'File Grievance Gateway', icon: Radio },
      { id: 'map', label: 'National Demand Map', icon: MapPin },
      { id: 'complaints', label: 'Community Signals & Issues', icon: Users },
      { id: 'dpg', label: 'DPG Standards & Open Data', icon: Database }
    ]
  }
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, role, logout, switchRoleDemo } = useAuth();

  return (
    <aside className="w-[270px] bg-[#FFFFFF] border-r border-[#E8E0D5] flex flex-col justify-between p-5 h-screen sticky top-0 z-40 flex-shrink-0 select-none shadow-[1px_0_3px_rgba(44,24,16,0.02)]">
      
      {/* Top Brand & Navigation */}
      <div className="space-y-6 overflow-y-auto pr-1">
        
        {/* Brand Header */}
        <div 
          onClick={() => setActiveTab('map')}
          className="flex items-center gap-3 px-1 py-1 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-black p-0.5 shadow-md border-2 border-[#D4A373]/60 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
            <img 
              src={logoImg} 
              alt="CivicPulse Logo" 
              className="w-full h-full rounded-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2 leading-none">
              <span className="text-base font-extrabold text-[#2C1810] tracking-tight">CivicPulse</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7] font-semibold">
                DPG
              </span>
            </div>
            <div className="text-[11px] text-[#8C7A70] font-medium leading-none mt-1">
              National Infrastructure OS
            </div>
          </div>
        </div>

        {/* Authenticated Government / Citizen Profile Banner */}
        {user && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FAF6F0] via-[#F5EBE0] to-[#FAF6F0] border border-[#D4A373]/40 shadow-sm space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2C1810] text-[#FDFBF7] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {user.role === 'government' ? <Building2 className="w-4 h-4 text-[#D4A373]" /> : <Users className="w-4 h-4 text-[#D4A373]" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-[#2C1810] block truncate">
                  {user.name}
                </span>
                <span className="text-[10px] font-semibold text-[#5A8F6E] block truncate">
                  {user.role === 'government' ? (user.department || 'Ministry Authority') : (user.district || 'Verified Citizen')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#8C7A70] pt-1.5 border-t border-[#E8E0D5]">
              <span className="font-mono">{user.country_name || 'India'}</span>
              <span className="px-1.5 py-0.5 rounded bg-[#2C1810] text-[#FDFBF7] font-bold">
                {user.role === 'government' ? 'GOV ADMIN' : 'CITIZEN'}
              </span>
            </div>
          </div>
        )}

        {/* Grouped Navigation */}
        <nav className="space-y-5">
          {(role === 'government' ? GOV_SECTIONS : CITIZEN_SECTIONS).map((sec) => (
            <div key={sec.group} className="space-y-1.5">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#9C8C84]">
                {sec.group}
              </div>

              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#2C1810] text-[#FDFBF7] font-bold shadow-md'
                          : 'text-[#5C4A42] hover:text-[#2C1810] hover:bg-[#FAF6F0]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#D4A373]' : 'text-[#8C7A70]'}`} strokeWidth={1.8} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

      </div>

      {/* Sidebar Footer - Status & Logout */}
      <div className="pt-3 border-t border-[#E8E0D5]">
        <div className="flex items-center justify-between text-xs text-[#8C7A70]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5A8F6E] animate-pulse" />
            <span className="text-[#5C4A42] font-semibold text-[11px]">System Live</span>
          </div>

          <button
            onClick={logout}
            className="text-[11px] font-bold text-[#B54A4A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

    </aside>
  );
}
