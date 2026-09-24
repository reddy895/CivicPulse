import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import GISMap from './components/GISMap';
import GovernmentDashboard from './components/GovernmentDashboard';
import CitizenDashboard from './components/CitizenDashboard';
import RecommendationView from './components/RecommendationView';
import MisalignmentView from './components/MisalignmentView';
import PolicySimulator from './components/PolicySimulator';
import DPGHub from './components/DPGHub';
import DisabilityComplaintsView from './components/DisabilityComplaintsView';
import AICopilotModal from './components/AICopilotModal';
import CommandPalette from './components/CommandPalette';
import ToastContainer from './components/ui/Toast';
import LandingPage from './pages/LandingPage';
import ReportPage from './pages/ReportPage';
import MyReportsPage from './pages/MyReportsPage';
import GovernmentPortal from './pages/GovernmentPortal';

function AppContent() {
  const { isAuthenticated, role, user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCountry, setSelectedCountry] = useState('IND');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotMode, setCopilotMode] = useState('general');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const handleOpenCopilot = (mode = 'general') => {
    setCopilotMode(mode);
    setIsCopilotOpen(true);
  };

  if (!isAuthenticated || !user) return <LoginPage />;

  // Government users land on stream by default
  const effectiveTab = activeTab === 'home' && role === 'government' ? 'stream' : activeTab;

  const renderContent = () => {
    // HOME / LANDING
    if (effectiveTab === 'home') return <LandingPage onNavigate={setActiveTab} />;

    // REPORT (citizen)
    if (effectiveTab === 'citizen') return <ReportPage onNavigate={setActiveTab} />;

    // MY REPORTS (citizen)
    if (effectiveTab === 'my_reports') return <MyReportsPage onNavigate={setActiveTab} />;

    // GOVERNMENT PORTAL
    if (effectiveTab === 'stream' && role === 'government') return (
      <GovernmentPortal selectedCountry={selectedCountry} />
    );

    // GIS MAP
    if (effectiveTab === 'map') return (
      <GISMap
        selectedCountry={selectedCountry}
        onSelectProject={() => setActiveTab('recommendations')}
        onOpenCopilot={() => handleOpenCopilot('general')}
      />
    );

    // GOV VIEWS
    if (effectiveTab === 'recommendations') return (
      <RecommendationView
        selectedCountry={selectedCountry}
        onOpenTenderModal={(p) => handleOpenCopilot('tender')}
        onOpenCopilot={handleOpenCopilot}
      />
    );
    if (effectiveTab === 'complaints') return (
      <DisabilityComplaintsView
        onOpenCopilot={handleOpenCopilot}
        onSelectCounty={() => setActiveTab('map')}
      />
    );
    if (effectiveTab === 'misalignment') return (
      <MisalignmentView
        selectedCountry={selectedCountry}
        onGoToSimulator={() => setActiveTab('simulator')}
      />
    );
    if (effectiveTab === 'simulator') return (
      <PolicySimulator
        selectedCountry={selectedCountry}
        onOpenCopilot={handleOpenCopilot}
      />
    );
    if (effectiveTab === 'dpg') return <DPGHub selectedCountry={selectedCountry} />;

    // Stream fallback (citizen view)
    if (effectiveTab === 'stream') return <CitizenDashboard selectedCountry={selectedCountry} onGoToMap={() => setActiveTab('map')} />;

    // Default
    return <LandingPage onNavigate={setActiveTab} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar
        activeTab={effectiveTab}
        setActiveTab={setActiveTab}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        onOpenPalette={() => setIsPaletteOpen(true)}
      />

      <main className="flex-1" id="main-content">
        {renderContent()}
      </main>

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={setIsPaletteOpen}
        onNavigate={setActiveTab}
        onSelectCountry={setSelectedCountry}
        onTriggerCopilot={() => { setCopilotMode('general'); setIsCopilotOpen(true); }}
      />

      <AICopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        selectedCountry={selectedCountry}
        defaultMode={copilotMode}
        targetProject={null}
      />

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
