import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Globe, Sparkles, Filter, ChevronRight, Layers } from 'lucide-react';
import GISMap from '../../components/GISMap';
import AICopilotModal from '../../components/AICopilotModal';
import { useAuth } from '../../context/AuthContext';

export default function GovMapPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedCountry, setSelectedCountry] = useState(user?.country_code || 'IND');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotMode, setCopilotMode] = useState('brief');

  const handleOpenCopilot = (mode = 'brief') => {
    setCopilotMode(mode);
    setIsCopilotOpen(true);
  };

  const handleSelectProject = (project) => {
    navigate('/gov-demo/analytics');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[var(--border-warm)] rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
            <span className="text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider">
              Spatial Intelligence Grid
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[var(--accent-primary)]" />
            Real-Time GIS Command Map
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Spatial clustering algorithms aggregated citizen reports into actionable infrastructure deficit zones.
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
              <option value="ALL">All Nations (World Map)</option>
              <option value="IND">India (IND)</option>
              <option value="USA">United States (USA)</option>
              <option value="BRA">Brazil (BRA)</option>
              <option value="ZAF">South Africa (ZAF)</option>
              <option value="CHN">China (CHN)</option>
              <option value="RUS">Russia (RUS)</option>
            </select>
          </div>

          <button
            onClick={() => handleOpenCopilot('brief')}
            className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-dark)] text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#D4A373]" />
            <span>AI Map Analysis</span>
          </button>
        </div>
      </div>

      {/* GIS Map Container */}
      <div className="w-full">
        <GISMap
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          onSelectProject={handleSelectProject}
          onOpenCopilot={handleOpenCopilot}
        />
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
