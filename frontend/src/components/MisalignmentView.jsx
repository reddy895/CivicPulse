import React, { useState, useEffect } from 'react';
import { 
  Layers, TrendingDown, TrendingUp, ShieldAlert, BarChart2, RefreshCw
} from 'lucide-react';
import { getSpendMisalignment } from '../services/api';
import { formatCurrency, getCurrencyUnitLabel } from '../utils/formatters';

export default function MisalignmentView({ selectedCountry, onGoToSimulator }) {
  const [misalignmentData, setMisalignmentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedCountry]);

  async function fetchData() {
    setIsLoading(true);
    const data = await getSpendMisalignment(selectedCountry);
    setMisalignmentData(data);
    setIsLoading(false);
  }

  const totalFundingDeficit = misalignmentData
    .filter(d => d.spend_gap_m > 0)
    .reduce((acc, d) => acc + d.spend_gap_m, 0);

  const totalSurplusAllocations = misalignmentData
    .filter(d => d.spend_gap_m < 0)
    .reduce((acc, d) => acc + Math.abs(d.spend_gap_m), 0);

  const criticalGapCount = misalignmentData.filter(d => d.spend_gap_m >= 6.0).length;

  return (
    <div className="max-w-[1440px] mx-auto px-8 space-y-8">
      
      {/* Header Section */}
      <div className="card-coffee p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#2C1810] tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#6F4E37]" />
            Public Capital Expenditure Spend Gap Matrix
          </h2>
          <p className="text-sm text-[#5C4A42]">
            Comparing national & state capital allocations against verified citizen demand to surface misaligned infrastructure spending ({getCurrencyUnitLabel(selectedCountry)}).
          </p>
        </div>

        <button
          onClick={onGoToSimulator}
          className="btn-primary text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Simulate Capital Rebalancing</span>
        </button>
      </div>

      {/* 3 Summary Cards Above Table */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-[#FDF2F2] rounded-xl border border-[rgba(181,74,74,0.2)] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B54A4A]">
            <TrendingDown className="w-4 h-4" />
            <span>Unfunded Shortfall</span>
          </div>
          <div className="text-3xl font-bold font-mono text-[#B54A4A]">
            {formatCurrency(totalFundingDeficit, selectedCountry)}
          </div>
          <div className="text-xs text-[#5C4A42]">Capital deficit across high-urgency demand clusters.</div>
        </div>

        <div className="p-6 bg-[#F0F6F2] rounded-xl border border-[rgba(90,143,110,0.2)] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5A8F6E]">
            <TrendingUp className="w-4 h-4" />
            <span>Reallocable Surplus</span>
          </div>
          <div className="text-3xl font-bold font-mono text-[#5A8F6E]">
            {formatCurrency(totalSurplusAllocations, selectedCountry)}
          </div>
          <div className="text-xs text-[#5C4A42]">Surplus capital in saturated districts available for transfer.</div>
        </div>

        <div className="p-6 bg-[#FDF8F0] rounded-xl border border-[rgba(199,141,63,0.2)] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C78D3F]">
            <ShieldAlert className="w-4 h-4" />
            <span>Ignored Hotspots</span>
          </div>
          <div className="text-3xl font-bold font-mono text-[#C78D3F]">
            {criticalGapCount} <span className="text-sm font-normal text-[#5C4A42]">Districts</span>
          </div>
          <div className="text-xs text-[#5C4A42]">Districts with acute verified demand and deficit underfunding.</div>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="card-coffee overflow-hidden">
        <div className="p-5 border-b border-[#F0EBE3] flex items-center justify-between">
          <span className="text-label text-[12px] text-[#2C1810] flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#6F4E37]" />
            District Capital Divergence Audit ({misalignmentData.length} Records)
          </span>
          <span className="font-mono text-xs text-[#9C8C84]">Ranked by Gap Severity ({getCurrencyUnitLabel(selectedCountry)})</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F0E8] border-b border-[#E8E0D5] text-label text-[11px]">
                <th className="py-3.5 px-4">District & Nation</th>
                <th className="py-3.5 px-4">Infrastructure Category</th>
                <th className="py-3.5 px-4">Demand Index</th>
                <th className="py-3.5 px-4">Current Allocation</th>
                <th className="py-3.5 px-4">Required Capital</th>
                <th className="py-3.5 px-4">Spend Gap</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Policy Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3] bg-[#FFFFFF]">
              {misalignmentData.map((item) => {
                const isExtremeGap = item.spend_gap_m >= 10.0;
                const isModerateGap = item.spend_gap_m > 0 && item.spend_gap_m < 10.0;
                const isSurplus = item.spend_gap_m < 0;

                let statusBadge = "badge-pill-neutral";
                let statusText = "Balanced";
                if (isExtremeGap) {
                  statusBadge = "badge-pill-danger";
                  statusText = "Critical Gap";
                } else if (isModerateGap) {
                  statusBadge = "badge-pill-warning";
                  statusText = "Moderate Deficit";
                } else if (isSurplus) {
                  statusBadge = "badge-pill-success";
                  statusText = "Surplus Capital";
                }

                return (
                  <tr key={item.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#2C1810]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#6F4E37] text-[11px] bg-[#F5F0E8] px-1.5 py-0.5 rounded border border-[#E8E0D5]">
                          {item.country_code}
                        </span>
                        <span>{item.region_name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[#5C4A42] font-medium">{item.category}</td>

                    {/* Clean percentage + 4px progress bar */}
                    <td className="py-3 px-4 font-mono">
                      <div className="space-y-1">
                        <span className="text-[#2C1810] font-semibold">{item.citizen_demand_index}%</span>
                        <div className="w-20 bg-[#F5F0E8] rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-[#6F4E37] h-full rounded-full"
                            style={{ width: `${Math.min(100, item.citizen_demand_index)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[#5C4A42]">{formatCurrency(item.current_budget_allocated_m, item.country_code)}</td>
                    <td className="py-3 px-4 font-mono text-[#2C1810] font-bold">{formatCurrency(item.recommended_budget_m, item.country_code)}</td>

                    {/* Red text only if gap > 0, otherwise Green */}
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={isExtremeGap ? 'text-[#B54A4A]' : (isSurplus ? 'text-[#5A8F6E]' : 'text-[#5C4A42]')}>
                        {item.spend_gap_m > 0 ? `+${formatCurrency(item.spend_gap_m, item.country_code)}` : `-${formatCurrency(Math.abs(item.spend_gap_m), item.country_code)}`}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`badge-pill ${statusBadge}`}>
                        {statusText}
                      </span>
                    </td>

                    {/* Full recommendation with tooltip */}
                    <td className="py-3 px-4 text-xs text-[#5C4A42] max-w-sm" title={item.action_recommendation}>
                      {item.action_recommendation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

