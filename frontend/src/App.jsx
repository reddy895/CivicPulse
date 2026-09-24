import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import GISMap from './components/GISMap';
import CitizenDashboard from './components/CitizenDashboard';
import GovernmentDashboard from './components/GovernmentDashboard';
import RecommendationView from './components/RecommendationView';
import MisalignmentView from './components/MisalignmentView';
import PolicySimulator from './components/PolicySimulator';
import DPGHub from './components/DPGHub';
import DisabilityComplaintsView from './components/DisabilityComplaintsView';
import AICopilotModal from './components/AICopilotModal';
import CommandPalette from './components/CommandPalette';
import ToastContainer from './components/ui/Toast';
import { ShieldCheck } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, role, user } = useAuth();

  const [activeTab, setActiveTab] = useState('map');
  const [selectedCountry, setSelectedCountry] = useState('IND');
  const [uiLang, setUiLang] = useState('en');

  // Copilot Modal State
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotMode, setCopilotMode] = useState('general');
  const [copilotTargetProject, setCopilotTargetProject] = useState(null);

  // Command Palette State
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const handleOpenCopilot = (mode = 'general', targetProj = null) => {
    setCopilotMode(mode);
    setCopilotTargetProject(targetProj);
    setIsCopilotOpen(true);
  };

  const handleSelectProjectFromMap = (hotspot) => {
    setActiveTab('recommendations');
  };

  const handleTriggerCopilotFromPalette = (queryText) => {
    setCopilotMode('general');
    setIsCopilotOpen(true);
  };

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex bg-[#FDFBF7] text-[#2C1810] selection:bg-[#D4A373]/30 selection:text-[#2C1810]">
      
      {/* 1. Left Vertical Sidebar Navigation (270px fixed) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 2. Main Fluid Command Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Command Bar */}
        <Navbar
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          uiLang={uiLang}
          setUiLang={setUiLang}
          onOpenCopilot={() => handleOpenCopilot('brief')}
          onOpenPalette={() => setIsPaletteOpen(true)}
        />

        {/* Active Module View */}
        <main className="flex-1 py-8">
          {activeTab === 'map' && (
            <GISMap
              selectedCountry={selectedCountry}
              onSelectProject={handleSelectProjectFromMap}
              onOpenCopilot={() => handleOpenCopilot('general')}
            />
          )}

          {activeTab === 'stream' && (
            <GovernmentDashboard
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              onOpenCopilot={handleOpenCopilot}
              externalActiveTab="stream"
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === 'citizen' && (
            <CitizenDashboard
              selectedCountry={selectedCountry}
              onGoToMap={(regionName) => {
                setSelectedCountry('IND');
                setActiveTab('map');
              }}
            />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationView
              selectedCountry={selectedCountry}
              onOpenTenderModal={(proj) => handleOpenCopilot('tender', proj)}
              onOpenCopilot={(mode) => handleOpenCopilot(mode)}
            />
          )}

          {activeTab === 'complaints' && (
            <DisabilityComplaintsView
              onOpenCopilot={(mode) => handleOpenCopilot(mode)}
              onSelectCounty={(c) => setActiveTab('map')}
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
              onOpenCopilot={(mode) => handleOpenCopilot(mode)}
            />
          )}

          {activeTab === 'dpg' && (
            <DPGHub
              selectedCountry={selectedCountry}
            />
          )}
        </main>

        {/* Minimal Sovereign Footer */}
        <footer className="bg-[#FFFFFF] border-t border-[#E8E0D5] py-5 px-8 text-xs text-[#5C4A42]">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#2C1810]">CivicPulse DPG</span>
              <span className="text-[#E8E0D5]">•</span>
              <span>
                {role === 'government' ? 'National Government Command Center' : 'Citizen Grievance & Demands Gateway'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[#9C8C84]">
              <span className="text-[#5A8F6E] font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                DPGA Certified v1.4.0
              </span>
              <span>•</span>
              <span>Open Standard (Apache 2.0 / MIT)</span>
              <span>•</span>
              <span>UN SDG 9 & 11 Aligned</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Command Palette Modal (Ctrl+K / Cmd+K) */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={setIsPaletteOpen}
        onNavigate={(tabId) => setActiveTab(tabId)}
        onSelectCountry={(cCode) => setSelectedCountry(cCode)}
        onTriggerCopilot={handleTriggerCopilotFromPalette}
      />

      {/* Global AI Policy Copilot Modal */}
      <AICopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        selectedCountry={selectedCountry}
        defaultMode={copilotMode}
        targetProject={copilotTargetProject}
      />

      {/* Global Toast Notifications Container */}
      <ToastContainer />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
