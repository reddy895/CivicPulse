import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CitizenLayout from './layouts/CitizenLayout';
import GovLayout from './layouts/GovLayout';

// Public pages
import HomePage from './pages/public/HomePage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import ExplorePage from './pages/public/ExplorePage';

// Citizen pages
import ReportGatePage from './pages/citizen/ReportGatePage';
import ReportNewPage from './pages/citizen/ReportNewPage';
import CitizenDashboardPage from './pages/citizen/CitizenDashboardPage';
import ComplaintDetailPage from './pages/citizen/ComplaintDetailPage';

// Government pages
import GovDashboardPage from './pages/government/GovDashboardPage';
import GovComplaintsPage from './pages/government/GovComplaintsPage';
import GovComplaintDetailPage from './pages/government/GovComplaintDetailPage';
import GovMapPage from './pages/government/GovMapPage';
import GovAnalyticsPage from './pages/government/GovAnalyticsPage';

// Toast
import { ToastContainer } from './components/ui/Toast';

// Route guards
function RequireCitizen({ children }) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated && role === 'government') return <Navigate to="/gov-demo" replace />;
  return children;
}

function RequireGov({ children }) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated && role !== 'government') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        {/* ── PUBLIC ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/explore" element={<ExplorePage />} />
        </Route>

        {/* ── AUTH ── */}
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
        <Route path="/gov-demo/login" element={<Navigate to="/gov-demo" replace />} />

        {/* ── CITIZEN ── */}
        <Route element={<CitizenLayout />}>
          <Route path="/report" element={<ReportGatePage />} />
          <Route path="/report/new" element={<RequireCitizen><ReportNewPage /></RequireCitizen>} />
          <Route path="/dashboard" element={<RequireCitizen><CitizenDashboardPage /></RequireCitizen>} />
          <Route path="/dashboard/reports/:id" element={<RequireCitizen><ComplaintDetailPage /></RequireCitizen>} />
        </Route>

        {/* ── GOVERNMENT ── */}
        <Route element={<GovLayout />}>
          <Route path="/gov-demo" element={<RequireGov><GovDashboardPage /></RequireGov>} />
          <Route path="/gov-demo/complaints" element={<RequireGov><GovComplaintsPage /></RequireGov>} />
          <Route path="/gov-demo/complaints/:id" element={<RequireGov><GovComplaintDetailPage /></RequireGov>} />
          <Route path="/gov-demo/map" element={<RequireGov><GovMapPage /></RequireGov>} />
          <Route path="/gov-demo/analytics" element={<RequireGov><GovAnalyticsPage /></RequireGov>} />
        </Route>

        {/* ── FALLBACK ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
