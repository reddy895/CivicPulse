import React, { useState } from 'react';
import { 
  BarChart3, AlertTriangle, Sparkles, FileText, 
  ShieldCheck, Globe, Sliders
} from 'lucide-react';
import RecommendationView from '../../components/RecommendationView';
import MisalignmentView from '../../components/MisalignmentView';
import PolicySimulator from '../../components/PolicySimulator';
import DisabilityComplaintsView from '../../components/DisabilityComplaintsView';
import DPGHub from '../../components/DPGHub';
import AICopilotModal from '../../components/AICopilotModal';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { id: 'mcda', label: 'MCDA Project Ranking', icon: BarChart3 },
  { id: 'misalignment', label: 'Spend Gap Auditor', icon: AlertTriangle },
  { id: 'simulator', label: 'Policy Simulator', icon: Sparkles },
  { id: 'disability', label: 'Disability Matrix', icon: FileText },
  { id: 'dpg', label: 'DPG Standards Hub', icon: ShieldCheck }
];

export default function GovAnalyticsPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('mcda');
  const [selectedCountry, setSelectedCountry] = useState(user?.country_code || 'IND');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotMode, setCopilotMode] = useState('brief');

  const handleOpenCopilot = (mode = 'brief') => {
    setCopilotMode(mode);
    setIsCopilotOpen(true);
  };

  return (
    <div className="text-white space-y-6 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#162030] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-[var(--accent-tertiary)] uppercase tracking-wider">
              Strategic Decision Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Public Infrastructure Analytics Studio
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Multi-Criteria Decision Analysis (MCDA), spend misalignment audit, and policy simulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0F1923] border border-white/15 rounded-xl px-3 py-2 text-xs">
            <Globe className="w-4 h-4 text-white/50" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Nations</option>
              <option value="IND">India (IND)</option>
              <option value="BRA">Brazil (BRA)</option>
              <option value="ZAF">South Africa (ZAF)</option>
              <option value="USA">United States (USA)</option>
            </select>
          </div>

          <button
            onClick={() => handleOpenCopilot('brief')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Copilot Briefing</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[var(--accent-tertiary)] text-slate-950 shadow-md font-extrabold'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Panel */}
      <div className="bg-[#162030] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl">
        {activeTab === 'mcda' && (
          <RecommendationView
            selectedCountry={selectedCountry}
            onOpenCopilot={handleOpenCopilot}
          />
        )}

        {activeTab === 'misalignment' && (
          <MisalignmentView
            selectedCountry={selectedCountry}
            onGoToSimulator={() => setActiveTab('simulator')}
          />
        )}

        {activeTab === 'simulator' && (
          <PolicySimulator
            selectedCountry={selectedCountry}
            onOpenCopilot={handleOpenCopilot}
          />
        )}

        {activeTab === 'disability' && (
          <DisabilityComplaintsView />
        )}

        {activeTab === 'dpg' && (
          <DPGHub />
        )}
      </div>

      {/* AI Copilot Modal */}
      {isCopilotOpen && (
        <AICopilotModal
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          initialMode={copilotMode}
          selectedCountry={selectedCountry}
        />
      )}

    </div>
  );
}
