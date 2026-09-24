import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Radio, Sparkles, Layers, Activity, Database, 
  Command, ChevronRight, X, Globe
} from 'lucide-react';

const PALETTE_ITEMS = [
  { id: 'map', title: 'Demand Hotspot Map', group: 'Navigation', icon: MapPin, type: 'nav' },
  { id: 'complaints', title: 'Disability & Grievance Data (CSV)', group: 'Navigation', icon: Activity, type: 'nav' },
  { id: 'citizen', title: 'Citizen Ingestion Gateway', group: 'Navigation', icon: Radio, type: 'nav' },
  { id: 'recommendations', title: 'AI Project Prioritization', group: 'Navigation', icon: Sparkles, type: 'nav' },
  { id: 'misalignment', title: 'Spend Gap Matrix', group: 'Navigation', icon: Layers, type: 'nav' },
  { id: 'simulator', title: 'Policy Scenario Sandbox', group: 'Navigation', icon: Activity, type: 'nav' },
  { id: 'dpg', title: 'DPG Open Data Hub', group: 'Navigation', icon: Database, type: 'nav' },

  { id: 'USA', title: 'Filter: USA (Disability Data)', group: 'Country Scope', icon: Globe, type: 'country' },
  { id: 'IND', title: 'Filter: India (भारत)', group: 'Country Scope', icon: Globe, type: 'country' },
  { id: 'BRA', title: 'Filter: Brazil (Brasil)', group: 'Country Scope', icon: Globe, type: 'country' },
  { id: 'ZAF', title: 'Filter: South Africa', group: 'Country Scope', icon: Globe, type: 'country' },
  { id: 'CHN', title: 'Filter: China (中国)', group: 'Country Scope', icon: Globe, type: 'country' },
  { id: 'RUS', title: 'Filter: Russia (Россия)', group: 'Country Scope', icon: Globe, type: 'country' },

  { id: 'brief', title: 'AI Copilot: Generate Cabinet Brief', group: 'AI Copilot Actions', icon: Sparkles, type: 'copilot' },
  { id: 'rebalance', title: 'AI Copilot: Explain Underfunded Hotspots', group: 'AI Copilot Actions', icon: Sparkles, type: 'copilot' }
];

export default function CommandPalette({ isOpen, onClose, onNavigate, onSelectCountry, onTriggerCopilot }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(prev => !prev);
      }
      if (e.key === 'Escape') {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filtered = PALETTE_ITEMS.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.group.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item) => {
    if (item.type === 'nav') {
      onNavigate(item.id);
    } else if (item.type === 'country') {
      onSelectCountry(item.id);
    } else if (item.type === 'copilot') {
      onTriggerCopilot(item.title);
    }
    onClose(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C1810]/40 backdrop-blur-sm flex items-start justify-center pt-24 p-4">
      <div className="card-coffee w-full max-w-xl bg-[#FFFFFF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E8E0D5] flex items-center gap-3 bg-[#FDFBF7]">
          <Search className="w-5 h-5 text-[#6F4E37]" />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command, district, or search navigation..."
            className="w-full bg-transparent text-sm text-[#2C1810] placeholder-[#9C8C84] outline-none"
          />
          <kbd className="text-[10px] font-mono bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E8E0D5] text-[#9C8C84]">ESC</kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F0E8] cursor-pointer transition-colors text-xs text-[#2C1810] group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#6F4E37]" />
                    <span className="font-medium text-sm">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-[#9C8C84] uppercase font-semibold">{item.group}</span>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#9C8C84]">No matching commands found.</div>
          )}
        </div>

      </div>
    </div>
  );
}
