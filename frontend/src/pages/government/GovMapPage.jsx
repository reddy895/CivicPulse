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
    <div className="text-white space-y-6 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#162030] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-[var(--accent-tertiary)] uppercase tracking-wider">
              Spatial Intelligence Grid
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-400" />
            Real-Time GIS Command Map
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Spatial clustering algorithms aggregated citizen reports into actionable infrastructure deficit zones.
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
            <span>AI Map Analysis</span>
          </button>
        </div>
      </div>

      {/* GIS Map Container */}
      <div className="bg-[#162030] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden">
        <GISMap
          selectedCountry={selectedCountry}
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
