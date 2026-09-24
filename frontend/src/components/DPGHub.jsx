import React, { useState, useEffect } from 'react';
import { 
  Database, Download, ShieldCheck, Terminal, Copy, Check, ExternalLink
} from 'lucide-react';
import { getDPGStandards } from '../services/api';

const DPGA_CRITERIA = [
  { id: '1', title: 'Open Source License', status: 'Compliant', desc: 'Apache 2.0 / MIT permissively licensed code repository.' },
  { id: '2', title: 'Open Standard Data Model', status: 'Compliant', desc: 'Conforms to GeoJSON RFC 7946, W3C Schema.org, and OpenAPI 3.1 specs.' },
  { id: '3', title: 'Open Data Extractability', status: 'Compliant', desc: 'All demand hotspots downloadable in machine-readable GeoJSON and CSV formats.' },
  { id: '4', title: 'Differential Privacy & PII Scrubbing', status: 'Compliant', desc: 'Zero PII stored; voice audio hashed and spatial coords perturbed by 500m radius.' },
  { id: '5', title: 'Adherence to Privacy Regulations', status: 'Compliant', desc: 'Compliant with Indian DPDP Act, Brazilian LGPD, and international privacy laws.' },
  { id: '6', title: 'UN SDG Alignment', status: 'Compliant', desc: 'Directly targets SDG 9 (Infrastructure), SDG 6 (Water), SDG 7 (Energy), and SDG 11.' },
  { id: '7', title: 'Multi-lingual Linguistic Inclusivity', status: 'Compliant', desc: 'Native support for 10+ BRICS languages across voice, SMS, and messaging.' },
  { id: '8', title: 'Do No Harm & Ethical AI', status: 'Compliant', desc: 'Transparent algorithmic decision weights preventing regional discrimination.' },
  { id: '9', title: 'Interoperability & Modular API', status: 'Compliant', desc: 'Plugs seamlessly into national e-Governance frameworks and GIS platforms.' }
];

export default function DPGHub({ selectedCountry }) {
  const [standards, setStandards] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchStandards();
  }, []);

  async function fetchStandards() {
    const data = await getDPGStandards();
    setStandards(data);
  }

  const handleDownload = (format) => {
    const cCode = selectedCountry === 'ALL' ? '' : `&country_code=${selectedCountry}`;
    const url = `http://localhost:8000/api/dpg/export?format=${format}${cCode}`;
    window.open(url, '_blank');
  };

  const sampleCurl = `curl -X GET "http://localhost:8000/api/dpg/export?format=geojson&country_code=IND" \\
  -H "Accept: application/geo+json"`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-8 space-y-8">
      
      {/* Header */}
      <div className="card-coffee p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#2C1810] tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-[#6F4E37]" />
            Digital Public Goods Alliance (DPGA) Open Registry
          </h2>
          <p className="text-sm text-[#5C4A42]">
            Standards compliance, privacy-preserving machine-readable data feeds, and open API specifications.
          </p>
        </div>

        <span className="badge-pill badge-pill-success text-xs">
          9 / 9 DPGA Indicators Met
        </span>
      </div>

      {/* 1-Click Open Data Downloads */}
      <div className="card-coffee p-6 space-y-4">
        <span className="text-label text-[12px] text-[#2C1810]">
          Machine-Readable Open Data Feeds ({selectedCountry === 'ALL' ? 'All BRICS' : selectedCountry})
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleDownload('geojson')}
            className="p-5 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] text-left hover:border-[#6F4E37] card-coffee-interactive transition-colors cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#2C1810]">
                GIS Hotspots Collection
              </span>
              <span className="font-mono text-xs text-[#6F4E37] font-bold bg-[#F5F0E8] px-2 py-0.5 rounded">.GeoJSON</span>
            </div>
            <p className="text-xs text-[#5C4A42]">Spatial point clusters with radius buffers & deficit metrics.</p>
          </button>

          <button
            onClick={() => handleDownload('csv')}
            className="p-5 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] text-left hover:border-[#5A8F6E] card-coffee-interactive transition-colors cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#2C1810]">
                Citizen Demand Tabular
              </span>
              <span className="font-mono text-xs text-[#5A8F6E] font-bold bg-[#F0F6F2] px-2 py-0.5 rounded">.CSV</span>
            </div>
            <p className="text-xs text-[#5C4A42]">Tabular records for Python Pandas, R, and PowerBI analysis.</p>
          </button>

          <button
            onClick={() => handleDownload('json')}
            className="p-5 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] text-left hover:border-[#6F4E37] card-coffee-interactive transition-colors cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#2C1810]">
                Full Entity Schema
              </span>
              <span className="font-mono text-xs text-[#6F4E37] font-bold bg-[#F5F0E8] px-2 py-0.5 rounded">.JSON</span>
            </div>
            <p className="text-xs text-[#5C4A42]">Complete entity structure conforming to OpenAPI 3.1.</p>
          </button>
        </div>
      </div>

      {/* OpenAPI Endpoint Snippet */}
      <div className="card-coffee p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-label text-[12px] text-[#2C1810] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#6F4E37]" />
            Direct API cURL Request
          </span>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#6F4E37] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Interactive OpenAPI Swagger Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="relative p-4 bg-[#F5F0E8] rounded-xl border border-[#E8E0D5] font-mono text-xs text-[#2C1810]">
          <button
            onClick={handleCopyCode}
            className="btn-secondary absolute right-3 top-3 py-1 px-2.5 text-xs"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-[#5A8F6E]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy'}</span>
          </button>
          <pre className="overflow-x-auto pr-20">{sampleCurl}</pre>
        </div>
      </div>

      {/* 9 DPGA Verification Scorecard */}
      <div className="card-coffee p-6 space-y-4">
        <span className="text-label text-[12px] text-[#2C1810] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#5A8F6E]" />
          Digital Public Goods Alliance (DPGA) 9-Point Compliance Scorecard
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DPGA_CRITERIA.map((crit) => (
            <div key={crit.id} className="p-4 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#9C8C84] font-bold">#{crit.id}</span>
                <span className="badge-pill badge-pill-success text-[10px]">{crit.status}</span>
              </div>
              <div className="text-sm font-bold text-[#2C1810]">{crit.title}</div>
              <p className="text-xs text-[#5C4A42] leading-relaxed">{crit.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
