import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Sliders, FileText, ArrowRight
} from 'lucide-react';
import { getRecommendations } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function RecommendationView({ selectedCountry = 'IND', onOpenTenderModal, onOpenCopilot }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // MCDA Sliders
  const [demandWeight, setDemandWeight] = useState(0.35);
  const [deficitWeight, setDeficitWeight] = useState(0.30);
  const [vulnWeight, setVulnWeight] = useState(0.20);
  const [budgetWeight, setBudgetWeight] = useState(0.15);
  const [budgetCap, setBudgetCap] = useState(100.0);

  useEffect(() => {
    fetchRecommendations();
  }, [selectedCountry, demandWeight, deficitWeight, vulnWeight, budgetWeight, budgetCap]);

  async function fetchRecommendations() {
    setIsLoading(true);
    const weights = {
      citizen_demand_weight: parseFloat(demandWeight),
      infra_deficit_weight: parseFloat(deficitWeight),
      vulnerability_weight: parseFloat(vulnWeight),
      budget_feasibility_weight: parseFloat(budgetWeight),
      budget_cap_millions: parseFloat(budgetCap)
    };
    const data = await getRecommendations(selectedCountry, weights);
    setRecommendations(data);
    setIsLoading(false);
  }

  const handleResetWeights = () => {
    setDemandWeight(0.35);
    setDeficitWeight(0.30);
    setVulnWeight(0.20);
    setBudgetWeight(0.15);
    setBudgetCap(100.0);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-8 space-y-8">
      
      {/* Header */}
      <div className="card-coffee p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#2C1810] tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6F4E37]" />
            AI Infrastructure Project Prioritization (MCDA Engine)
          </h2>
          <p className="text-sm text-[#5C4A42]">
            Algorithmic project ranking combining grassroots urgency, infrastructure deficit & social return on investment.
          </p>
        </div>

        <button
          onClick={() => onOpenCopilot('brief')}
          className="btn-primary text-xs"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Draft Executive Memorandum</span>
        </button>
      </div>

      {/* MCDA Weight Matrix Control Panel */}
      <div className="card-coffee p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE3]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#6F4E37]" />
            <span className="text-label text-[12px] text-[#2C1810]">Multi-Criteria Weighting Parameters</span>
          </div>
          <button
            onClick={handleResetWeights}
            className="text-xs text-[#6F4E37] hover:underline cursor-pointer font-semibold"
          >
            Reset Default Weights
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#5C4A42] font-semibold">Citizen Demand</span>
              <span className="font-mono text-[#2C1810] font-bold text-base">{Math.round(demandWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={demandWeight}
              onChange={(e) => setDemandWeight(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="p-3.5 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#5C4A42] font-semibold">Infra Deficit</span>
              <span className="font-mono text-[#2C1810] font-bold text-base">{Math.round(deficitWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={deficitWeight}
              onChange={(e) => setDeficitWeight(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="p-3.5 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#5C4A42] font-semibold">Vulnerability</span>
              <span className="font-mono text-[#2C1810] font-bold text-base">{Math.round(vulnWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={vulnWeight}
              onChange={(e) => setVulnWeight(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="p-3.5 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#5C4A42] font-semibold">Budget Feasibility</span>
              <span className="font-mono text-[#2C1810] font-bold text-base">{Math.round(budgetWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={budgetWeight}
              onChange={(e) => setBudgetWeight(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Ranked Project Cards (3 Zones Layout) */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="card-coffee p-6 space-y-5 hover:border-[#A67B5B] card-coffee-interactive transition-all"
          >
            {/* Header: 40px Circle + Title + Country Code Badge + Big MCDA Score */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EBE3]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#6F4E37] flex items-center justify-center font-bold text-white font-mono text-sm shadow-sm flex-shrink-0">
                  #{rec.priority_rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#2C1810]">{rec.title}</span>
                    <span className="font-mono text-xs font-bold text-[#6F4E37] bg-[#F5F0E8] px-2 py-0.5 rounded border border-[#E8E0D5]">
                      {rec.country_code}
                    </span>
                  </div>
                  <div className="text-xs text-[#5C4A42] mt-0.5">{rec.state_province}, {rec.country_name}</div>
                </div>
              </div>

              {/* Big MCDA Score Top-Right */}
              <div className="flex items-baseline gap-2 self-start sm:self-auto">
                <span className="text-label text-[11px]">MCDA SCORE:</span>
                <span className="text-3xl font-bold font-mono text-[#6F4E37]">{rec.mcda_score}</span>
                <span className="text-xs text-[#9C8C84] font-mono">/ 100</span>
              </div>
            </div>

            {/* 3 Internal Zones: Problem (40%) | Intervention (40%) | Metrics (20%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs items-start">
              
              {/* Problem Statement (40% -> 5 cols) */}
              <div className="lg:col-span-5 p-4 bg-[#FDF2F2] rounded-xl border border-[rgba(181,74,74,0.15)] space-y-2">
                <span className="text-label text-[11px] text-[#B54A4A]">Identified Problem Baseline</span>
                <p className="text-[#2C1810] text-xs leading-relaxed line-clamp-3">
                  {rec.key_problem_summary}
                </p>
              </div>

              {/* Proposed Intervention (40% -> 5 cols) */}
              <div className="lg:col-span-4 p-4 bg-[#F0F6F2] rounded-xl border border-[rgba(90,143,110,0.15)] space-y-2">
                <span className="text-label text-[11px] text-[#5A8F6E]">Proposed DPG Intervention</span>
                <ul className="text-[#2C1810] text-xs space-y-1 list-disc list-inside leading-relaxed">
                  <li>{rec.proposed_solution}</li>
                  <li className="text-[#5C4A42]">Validated by {rec.verified_citizen_signals || 14} citizen petitions</li>
                </ul>
              </div>

              {/* Metrics Stacked (20% -> 3 cols) */}
              <div className="lg:col-span-3 p-4 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-2.5">
                <div>
                  <div className="text-label text-[10px]">Capital Cost</div>
                  <div className="text-base font-bold font-mono text-[#2C1810]">{formatCurrency(rec.estimated_cost_usd_m, rec.country_code)}</div>
                </div>
                <div>
                  <div className="text-label text-[10px]">Beneficiaries</div>
                  <div className="text-base font-bold font-mono text-[#2C1810]">{rec.projected_beneficiaries.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-label text-[10px]">Timeline</div>
                  <div className="text-base font-bold font-mono text-[#2C1810]">{rec.estimated_completion_months} Months</div>
                </div>
                <div>
                  <div className="text-label text-[10px]">Social ROI</div>
                  <div className="text-base font-bold font-mono text-[#5A8F6E]">{rec.projected_social_roi_ratio}x Multiplier</div>
                </div>
              </div>

            </div>

            {/* Action Footer & Subtle SDG Tags */}
            <div className="pt-2 border-t border-[#F0EBE3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-label text-[11px] mr-1">SDG Alignment:</span>
                {rec.sdg_alignment.map((sdg, idx) => (
                  <span key={idx} className="badge-pill badge-pill-neutral text-[11px]">
                    {sdg}
                  </span>
                ))}
              </div>

              <button
                onClick={() => onOpenTenderModal(rec)}
                className="btn-secondary py-1.5 px-3 text-xs self-start sm:self-auto cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Draft Procurement Tender →</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
