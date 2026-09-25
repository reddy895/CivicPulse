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
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[var(--border-warm)] rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--status-info)] animate-pulse" />
            <span className="text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider">
              Strategic Decision Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[var(--accent-primary)]" />
            Public Infrastructure Analytics Studio
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Multi-Criteria Decision Analysis (MCDA), spend misalignment audit, and policy simulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-warm)] rounded-lg px-3 py-2 text-xs">
            <Globe className="w-4 h-4 text-[var(--accent-primary)]" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] font-semibold focus:outline-none cursor-pointer"
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
            className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-dark)] text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#D4A373]" />
            <span>AI Copilot Briefing</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-divider)] pb-2 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                  : 'bg-white text-[var(--text-secondary)] border border-[var(--border-warm)] hover:text-[var(--text-primary)] hover:border-[var(--accent-tertiary)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Panel */}
      <div className="bg-white border border-[var(--border-warm)] rounded-xl p-5 sm:p-6 shadow-sm">
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
