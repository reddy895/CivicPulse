import React, { useState, useEffect } from 'react';
import { 
  Users, AlertTriangle, ShieldAlert, HeartPulse, Bus, Home, Activity, Search, Filter, Sparkles, ChevronRight, FileText
} from 'lucide-react';
import { getDisabilityComplaints, getDisabilitySummary } from '../services/api';

export default function DisabilityComplaintsView({ onOpenCopilot, onSelectCounty }) {
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedState, setSelectedState] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedState]);

  async function loadData() {
    setIsLoading(true);
    const sum = await getDisabilitySummary();
    setSummary(sum);

    const stParam = selectedState === 'ALL' ? null : selectedState;
    const data = await getDisabilityComplaints(stParam, 100);
    setRecords(data);
    if (data.length > 0) {
      setSelectedRecord(data[0]);
    }
    setIsLoading(false);
  }

  // Filter records by search and category
  const filteredRecords = records.filter(r => {
    const matchesSearch = r.county_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.fips_code.includes(searchTerm);
    if (!matchesSearch) return false;

    if (selectedCategory !== 'ALL') {
      const hasCat = r.complaints.some(c => c.category === selectedCategory);
      if (!hasCat) return false;
    }
    return true;
  });

  const statesList = [
    'ALL', 'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Delaware',
    'District Of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'Puerto Rico'
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-8 space-y-8">
      
      {/* 1. Header Banner */}
      <div className="card-coffee p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B54A4A] animate-pulse" />
            <h2 className="text-lg font-bold text-[#2C1810] tracking-tight">
              Citizen Complaints & Disability Infrastructure Problems Matrix
            </h2>
          </div>
          <p className="text-sm text-[#5C4A42] mt-1">
            Real-time analytics retrieved and adapted from County-level Disability Compensation Records across all US States.
          </p>
        </div>

        <button
          onClick={() => onOpenCopilot('brief')}
          className="btn-primary text-xs self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Memorandum on Disability Gaps</span>
        </button>
      </div>

      {/* 2. Top KPI Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-coffee p-6 space-y-1">
            <div className="text-label text-[11px]">Total Compensation Recipients</div>
            <div className="text-kpi">{summary.total_recipients.toLocaleString()}</div>
            <div className="text-kpi-sub">Across {summary.total_counties_analyzed} US Counties</div>
          </div>

          <div className="card-coffee p-6 space-y-1">
            <div className="text-label text-[11px] text-[#B54A4A]">100% Severe Disability Rating</div>
            <div className="text-kpi text-[#B54A4A]">{summary.total_100_percent_disabled.toLocaleString()}</div>
            <div className="text-kpi-sub">Require intensive medical & home support</div>
          </div>

          <div className="card-coffee p-6 space-y-1">
            <div className="text-label text-[11px] text-[#C78D3F]">Disabled Seniors (Age 65+)</div>
            <div className="text-kpi text-[#C78D3F]">{summary.total_seniors_65_plus.toLocaleString()}</div>
            <div className="text-kpi-sub">Facing mobility & geriatric care shortages</div>
          </div>

          <div className="card-coffee p-6 space-y-1">
            <div className="text-label text-[11px] text-[#5A8F6E]">Young Adults (Age 17-44)</div>
            <div className="text-kpi text-[#5A8F6E]">{summary.total_young_adults_17_44.toLocaleString()}</div>
            <div className="text-kpi-sub">Need mental health & vocational re-entry</div>
          </div>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="card-coffee p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#9C8C84] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by County name, State, or FIPS code (e.g., San Diego, Bexar, Cumberland, Maricopa)..."
            className="form-input w-full pl-9 text-xs"
          />
        </div>

        {/* State Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="form-input text-xs cursor-pointer w-full md:w-auto"
          >
            {statesList.map(st => (
              <option key={st} value={st}>{st === 'ALL' ? 'All 50 US States' : st}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input text-xs cursor-pointer w-full md:w-auto"
          >
            <option value="ALL">All Problem Sectors</option>
            <option value="Healthcare & Clinics">Healthcare & Clinics</option>
            <option value="Roads & Public Transport">Roads & Public Transport</option>
            <option value="Education & Schools">Mental Health & Vocational</option>
            <option value="Digital Public Infrastructure">Telehealth & Digital</option>
          </select>
        </div>

      </div>

      {/* 4. Main Split: Left County List with Problems | Right In-Depth Problem Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-label text-[12px] text-[#2C1810]">
            Disability Hotspots & Grassroots Problems ({filteredRecords.length} Counties)
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredRecords.map((rec) => {
              const isSelected = selectedRecord?.fips_code === rec.fips_code;

              return (
                <div
                  key={rec.fips_code}
                  onClick={() => setSelectedRecord(rec)}
                  className={`card-coffee p-5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#6F4E37] bg-[#F5F0E8] shadow-md'
                      : 'hover:border-[#D4A373] bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#6F4E37] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E8E0D5]">
                          FIPS {rec.fips_code}
                        </span>
                        <span className="text-base font-bold text-[#2C1810]">{rec.county_name} County</span>
                        <span className="text-xs text-[#5C4A42] font-semibold">· {rec.state}</span>
                      </div>

                      {/* Problem Summary points */}
                      <div className="mt-2 space-y-1">
                        {rec.problems_summary.map((prob, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2 text-xs text-[#B54A4A] font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{prob}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total Numbers */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold font-mono text-[#2C1810]">{rec.total_recipients.toLocaleString()}</div>
                      <div className="text-[11px] text-[#9C8C84]">Recipients</div>
                      <span className="badge-pill badge-pill-danger text-[10px] mt-1">
                        {rec.rating_100.toLocaleString()} (100% SCD)
                      </span>
                    </div>
                  </div>

                  {/* Demographic Mini Strip */}
                  <div className="mt-3 pt-3 border-t border-[#E8E0D5] flex items-center justify-between text-[11px] text-[#5C4A42]">
                    <span>Age 17-44: <strong>{rec.age_17_44.toLocaleString()}</strong></span>
                    <span>Age 45-64: <strong>{rec.age_45_64.toLocaleString()}</strong></span>
                    <span>Age 65+: <strong>{rec.age_65_plus.toLocaleString()}</strong></span>
                    <span>Female: <strong>{rec.female.toLocaleString()}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedRecord ? (
            <div className="card-coffee p-6 space-y-6 sticky top-20">
              
              {/* Header */}
              <div className="space-y-1 pb-4 border-b border-[#F0EBE3]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#6F4E37] bg-[#F5F0E8] px-2.5 py-0.5 rounded border border-[#E8E0D5]">
                    FIPS {selectedRecord.fips_code} · {selectedRecord.state}
                  </span>
                  <span className="badge-pill badge-pill-danger">
                    Deficit Score: {Math.round(selectedRecord.deficit_score * 100)}%
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#2C1810] pt-1">{selectedRecord.county_name} County</h3>
                <p className="text-xs text-[#5C4A42]">Geospatial Coordinates: {selectedRecord.latitude}° N, {selectedRecord.longitude}° W</p>
              </div>

              {/* 4 Quantitative Breakdown Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-1">
                  <div className="text-label text-[10px]">100% Severe Rating</div>
                  <div className="text-xl font-bold font-mono text-[#B54A4A]">{selectedRecord.rating_100.toLocaleString()}</div>
                  <div className="text-[10px] text-[#9C8C84]">Highest clinical urgency</div>
                </div>

                <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-1">
                  <div className="text-label text-[10px]">70% to 90% Rating</div>
                  <div className="text-xl font-bold font-mono text-[#C78D3F]">{selectedRecord.rating_70_90.toLocaleString()}</div>
                  <div className="text-[10px] text-[#9C8C84]">High mobility deficit</div>
                </div>

                <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-1">
                  <div className="text-label text-[10px]">Young Veterans (17-44)</div>
                  <div className="text-xl font-bold font-mono text-[#2C1810]">{selectedRecord.age_17_44.toLocaleString()}</div>
                  <div className="text-[10px] text-[#9C8C84]">Mental health & rehab</div>
                </div>

                <div className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-1">
                  <div className="text-label text-[10px]">Senior Disabled (65+)</div>
                  <div className="text-xl font-bold font-mono text-[#5A8F6E]">{selectedRecord.age_65_plus.toLocaleString()}</div>
                  <div className="text-[10px] text-[#9C8C84]">Geriatric transit & home care</div>
                </div>
              </div>

              {/* Specific Citizen Complaints & Hardships */}
              <div className="space-y-3">
                <div className="text-label text-[11px]">Specific Citizen Complaints & Hardships Faced</div>
                
                <div className="space-y-2.5 max-h-56 overflow-y-auto">
                  {selectedRecord.complaints.map((comp, cIdx) => (
                    <div key={cIdx} className="p-3.5 bg-[#FDF2F2] rounded-xl border border-[rgba(181,74,74,0.15)] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#B54A4A]">{comp.problem_title}</span>
                        <span className="badge-pill badge-pill-danger text-[10px]">{comp.urgency}</span>
                      </div>
                      <p className="text-xs text-[#2C1810] leading-relaxed">
                        {comp.detail}
                      </p>
                      <div className="text-[10px] text-[#5C4A42] font-semibold">
                        Impacted Citizens: {comp.impacted_population.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-[#F0EBE3] space-y-2">
                <button
                  onClick={() => onOpenCopilot('brief')}
                  className="btn-primary w-full justify-center text-xs py-2.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Draft Policy Brief for {selectedRecord.county_name}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="card-coffee p-10 text-center text-[#9C8C84] text-xs">
              Select any county on the left to view detailed disability problems and citizen grievances.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
