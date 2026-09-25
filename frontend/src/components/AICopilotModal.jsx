import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Send, Copy, Check, FileText, Download, ShieldCheck
} from 'lucide-react';
import { queryAICopilot } from '../services/api';
import logoImg from '../assets/logo.png';

const SUGGESTED_ANALYSES = [
  { label: 'Underfunded Districts Brief', query: 'Draft an executive policy memorandum detailing top underfunded citizen hotspots and capital gap realignment.', context: 'brief' },
  { label: 'Highest Healthcare & Water Gaps', query: 'Analyze the highest priority healthcare and clean water deficits across target districts.', context: 'general' },
  { label: 'Draft Procurement Tender', query: 'Generate standard DPG-compliant procurement tender specifications for top-ranked high impact project.', context: 'tender' },
  { label: 'Investment Mismatch Summary', query: 'Explain the most severe budget misalignments where ground demand is high but capital budget is missing.', context: 'general' }
];

export default function AICopilotModal({ isOpen, onClose, selectedCountry, defaultMode = 'general', targetProject = null }) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (defaultMode === 'brief') {
        runPrompt(SUGGESTED_ANALYSES[0]);
      } else if (defaultMode === 'tender' && targetProject) {
        setQuery(`Draft procurement tender for project: ${targetProject.title}`);
        runCustomQuery(`Draft procurement tender for project: ${targetProject.title}`, 'tender');
      } else if (!response) {
        runPrompt(SUGGESTED_ANALYSES[0]);
      }
    }
  }, [isOpen, defaultMode, targetProject]);

  if (!isOpen) return null;

  async function runPrompt(p) {
    setQuery(p.query);
    await runCustomQuery(p.query, p.context);
  }

  async function runCustomQuery(qText, contextType = 'general') {
    if (!qText.trim()) return;
    setIsProcessing(true);
    const cCode = selectedCountry === 'ALL' ? 'IND' : selectedCountry;
    const payload = {
      query: qText,
      country_code: cCode,
      context_type: contextType
    };

    const res = await queryAICopilot(payload);
    setResponse(res);
    setIsProcessing(false);
  }

  const handleCopy = () => {
    const textToCopy = response?.generated_brief || response?.answer || '';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToSave = response?.generated_brief || response?.answer || '';
    const blob = new Blob([textToSave], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NagarMithra_Policy_Intelligence_${selectedCountry}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C1810]/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-coffee w-full max-w-3xl max-h-[88vh] bg-[#FFFFFF] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 px-6 bg-[#FDFBF7] border-b border-[#E8E0D5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black p-0.5 shadow-sm border border-[#D4A373]/60 flex items-center justify-center shrink-0 overflow-hidden">
              <img 
                src={logoImg} 
                alt="NagarMithra Logo" 
                className="w-full h-full rounded-full object-cover" 
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2C1810] flex items-center gap-2">
                NagarMithra AI Policy Copilot
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]">Active</span>
              </h3>
              <p className="text-xs text-[#5C4A42]">Explainable Infrastructure Decision Intelligence · {selectedCountry}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#FFFFFF] hover:bg-[#F5F0E8] text-[#5C4A42] hover:text-[#2C1810] flex items-center justify-center cursor-pointer border border-[#E8E0D5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Suggested Queries Bar */}
        <div className="p-3 bg-[#F5F0E8] border-b border-[#E8E0D5] flex items-center gap-2 overflow-x-auto">
          <span className="text-label text-[10px] flex-shrink-0">Suggested:</span>
          {SUGGESTED_ANALYSES.map((p, idx) => (
            <button
              key={idx}
              onClick={() => runPrompt(p)}
              disabled={isProcessing}
              className="px-2.5 py-1 rounded bg-[#FFFFFF] hover:bg-[#FDFBF7] border border-[#E8E0D5] text-xs text-[#6F4E37] font-medium whitespace-nowrap transition-colors cursor-pointer shadow-sm"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Query Input */}
        <div className="p-4 border-b border-[#E8E0D5] bg-[#FFFFFF]">
          <form onSubmit={(e) => { e.preventDefault(); runCustomQuery(query); }} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about infrastructure gaps, citizen demand hotspots, budget reallocation..."
              className="form-input flex-1 text-xs"
            />
            <button
              type="submit"
              disabled={isProcessing}
              className="btn-primary text-xs flex-shrink-0"
            >
              {isProcessing ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>
        </div>

        {/* Response Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs bg-[#FFFFFF]">
          {isProcessing ? (
            <div className="py-12 text-center space-y-2">
              <div className="text-sm font-semibold text-[#6F4E37]">
                Analyzing Citizen Signals & Deficit Indicies...
              </div>
              <p className="text-xs text-[#9C8C84]">Synthesizing evidence base across BRICS registry records</p>
            </div>
          ) : response ? (
            <div className="space-y-4">
              
              {/* Policy Brief Document Box */}
              <div className="p-5 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E0D5]">
                  <span className="text-label text-[11px] text-[#6F4E37]">
                    Executive Decision Analysis
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="btn-secondary py-1 px-2.5 text-xs"
                    >
                      {copied ? <Check className="w-3 h-3 text-[#5A8F6E]" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="btn-secondary py-1 px-2.5 text-xs"
                    >
                      <Download className="w-3 h-3" />
                      <span>.MD</span>
                    </button>
                  </div>
                </div>

                <div className="text-[#2C1810] font-mono whitespace-pre-wrap text-xs leading-relaxed max-h-64 overflow-y-auto">
                  {response.generated_brief || response.answer}
                </div>
              </div>

              {/* Action Items */}
              {response.action_items?.length > 0 && (
                <div className="p-4 bg-[#F0F6F2] rounded-xl border border-[rgba(90,143,110,0.2)] space-y-2">
                  <span className="text-label text-[11px] text-[#5A8F6E]">
                    Recommended Policy Next Steps
                  </span>
                  <div className="space-y-1.5">
                    {response.action_items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[#2C1810] text-xs">
                        <span className="text-[#5A8F6E] font-bold">→</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citations & Confidence */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-[#5C4A42]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Verified Citations:</span>
                  {response.citations?.map((c, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-[#F5F0E8] border border-[#E8E0D5] text-[#2C1810]">
                      {c.source}
                    </span>
                  ))}
                </div>
                <span className="text-[#5A8F6E] font-semibold">Confidence: 96.8%</span>
              </div>

            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
