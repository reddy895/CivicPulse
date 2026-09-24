import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Map } from 'lucide-react';
import GISMap from '../../components/GISMap';

export default function ExplorePage() {
  return (
    <div style={{ paddingTop: '64px' }} className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container-xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Infrastructure Map</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Real-time complaint hotspots across the nation</p>
          </div>
          <Link to="/report" className="btn-primary">
            <FileText className="w-4 h-4" /> Report Issue
          </Link>
        </div>
        <div className="card-coffee overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
          <GISMap selectedCountry="IND" onSelectProject={() => {}} onOpenCopilot={() => {}} />
        </div>
      </div>
    </div>
  );
}
