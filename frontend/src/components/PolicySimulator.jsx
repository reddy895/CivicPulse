import React, { useState, useEffect } from 'react';
import { 
  Activity, Sliders, FileText, Sparkles
} from 'lucide-react';
import { runPolicySimulation } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const INITIAL_SECTOR_ALLOCATIONS = {
  "Water & Sanitation": 35.0,
  "Roads & Public Transport": 40.0,
  "Clean Energy & Grid": 25.0,
  "Healthcare & Clinics": 25.0,
  "Digital Public Infrastructure": 15.0,
  "Education & Schools": 10.0,
  "Flood & Climate Resilience": 15.0
};

export default function PolicySimulator({ selectedCountry = 'IND', onOpenCopilot }) {
  const [sectorAllocations, setSectorAllocations] = useState(INITIAL_SECTOR_ALLOCATIONS);
  const [equityMultiplier, setEquityMultiplier] = useState(1.3);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    runSimulation();
  }, [selectedCountry, sectorAllocations, equityMultiplier]);

  const handleSliderChange = (sector, value) => {
    setSectorAllocations(prev => ({
      ...prev,
      [sector]: parseFloat(value)
    }));
  };

  const totalBudget = Object.values(sectorAllocations).reduce((a, b) => a + b, 0);

  async function runSimulation() {
    setIsSimulating(true);
    const cCode = selectedCountry === 'ALL' ? 'IND' : selectedCountry;
    const payload = {
      country_code: cCode,
      total_budget_m: totalBudget,
      sector_allocations: sectorAllocations,
      equity_focus_multiplier: equityMultiplier
    };

    const res = await runPolicySimulation(payload);
    setSimulationResult(res);
    setIsSimulating(false);
  }

  const handleResetToBaseline = () => {
    setSectorAllocations(INITIAL_SECTOR_ALLOCATIONS);
    setEquityMultiplier(1.3);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-8 space-y-8">
      
      {/* Header */}
      <div className="card-coffee p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#2C1810] tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#6F4E37]" />
            Macroeconomic Policy Scenario Sandbox
          </h2>
          <p className="text-sm text-[#5C4A42]">
            Simulate capital budget shifts across sectors and forecast citizen welfare, deficit reduction & SROI yield.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetToBaseline}
            className="btn-secondary text-xs"
          >
            Reset Baseline
          </button>
          <button
            onClick={() => onOpenCopilot('brief')}
            className="btn-primary text-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Scenario Brief</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Sliders (6 Cols) */}
        <div className="lg:col-span-6 card-coffee p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE3]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#6F4E37]" />
              <span className="text-label text-[12px] text-[#2C1810]">Sector Capital Allocation</span>
            </div>
            <span className="font-mono text-sm font-bold text-[#6F4E37]">Envelope: {formatCurrency(totalBudget, selectedCountry)}</span>
          </div>

          <div className="space-y-3">
            {Object.entries(sectorAllocations).map(([sector, amount]) => (
              <div key={sector} className="p-3 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#2C1810] font-semibold">{sector}</span>
                  <span className="font-mono text-[#6F4E37] font-bold">{formatCurrency(amount, selectedCountry)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="100.0"
                  step="5.0"
                  value={amount}
                  onChange={(e) => handleSliderChange(sector, e.target.value)}
                  className="w-full cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Equity Multiplier */}
          <div className="p-4 bg-[#F5F0E8] rounded-xl border border-[#E8E0D5] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-xs font-bold text-[#2C1810] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#6F4E37]" />
                Vulnerability Equity Multiplier
              </span>
              <span className="font-mono text-[#6F4E37] font-bold text-sm">{equityMultiplier.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.05"
              value={equityMultiplier}
              onChange={(e) => setEquityMultiplier(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
            <p className="text-xs text-[#5C4A42]">Weights capital allocation toward historically marginalized and vulnerable districts.</p>
          </div>
        </div>

        {/* Right: Forecast Scorecard (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {simulationResult ? (
            <div className="card-coffee p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE3]">
                <span className="text-label text-[12px] text-[#2C1810]">Projected Welfare & Economic Forecast</span>
                <span className="badge-pill badge-pill-success">Simulated Model</span>
              </div>

              {/* 4 Bounded Metrics */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-1">
                  <div className="text-label text-[11px]">Total Beneficiaries</div>
                  <div className="text-2xl font-bold font-mono text-[#2C1810]">
                    {simulationResult.projected_total_beneficiaries.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#9C8C84]">Citizens with service uplift</div>
                </div>

                <div className="p-4 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-1">
                  <div className="text-label text-[11px]">Citizen Satisfaction</div>
                  <div className="text-2xl font-bold font-mono text-[#5A8F6E]">
                    {simulationResult.projected_citizen_satisfaction_score}%
                  </div>
                  <div className="text-[11px] text-[#9C8C84]">Projected approval index</div>
                </div>

                <div className="p-4 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-1">
                  <div className="text-label text-[11px]">Deficit Reduction</div>
                  <div className="text-2xl font-bold font-mono text-[#C78D3F]">
                    -{simulationResult.projected_infrastructure_deficit_reduction_pct}%
                  </div>
                  <div className="text-[11px] text-[#9C8C84]">Across 7 national sectors</div>
                </div>

                <div className="p-4 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-1">
                  <div className="text-label text-[11px]">Economic Multiplier</div>
                  <div className="text-2xl font-bold font-mono text-[#6F4E37]">
                    {simulationResult.economic_multiplier_estimated}x
                  </div>
                  <div className="text-[11px] text-[#9C8C84]">GDP return per $1 invested</div>
                </div>
              </div>

              {/* Simulation Narrative */}
              <div className="p-4 bg-[#F5F0E8] rounded-xl border border-[#E8E0D5] space-y-1">
                <span className="text-label text-[11px] text-[#6F4E37]">Policy Decision Narrative</span>
                <p className="text-xs text-[#2C1810] leading-relaxed italic mt-1">
                  "{simulationResult.executive_summary}"
                </p>
              </div>

              {/* Sector Resolution Matrix */}
              <div className="space-y-2">
                <div className="text-label text-[11px]">Sector Resolution Breakdown</div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {simulationResult.sector_impacts?.map((sec, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#FDFBF7] text-xs border border-[#E8E0D5]">
                      <div>
                        <div className="font-bold text-[#2C1810]">{sec.sector}</div>
                        <div className="text-[11px] text-[#9C8C84]">{sec.hotspots_resolved} of {sec.total_sector_hotspots} Hotspots Resolved</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-[#2C1810] font-bold text-xs">{sec.projected_beneficiaries.toLocaleString()} ppl</div>
                        <div className="text-[11px] text-[#5A8F6E]">{sec.estimated_social_roi_ratio}x ROI</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="card-coffee p-10 text-center text-[#9C8C84] text-xs">
              Computing macroeconomic simulation...
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
