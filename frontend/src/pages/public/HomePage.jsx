import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, FileText, Map, CheckCircle2, Zap, TrendingUp, Users, Globe2, 
  ChevronRight, Shield, ClipboardList, Car, Droplets, HeartPulse, 
  GraduationCap, Radio, Waves, MapPin, Flame, BarChart3, Building2, 
  Camera, Cpu, Image as ImageIcon, Check
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import brandLogo from '../../assets/civicpulse-logo.png';

/* ── Animated Counter ── */
function useCountUp(target, duration = 2000, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start; const step = (ts) => { if (!start) start = ts; const p = Math.min((ts - start) / duration, 1); setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, [target, duration, active]);
  return val;
}

/* ── Interactive Civic Network Visualization (Professional Vector Nodes) ── */
const NODES = [
  { id: 'center', label: 'CivicPulse', x: 210, y: 195, r: 38, color: '#6F4E37', stroke: '#D4A373', shortCode: 'CIVIC' },
  { id: 'govt', label: 'GOVT', x: 210, y: 58, r: 22, color: '#2D7A50', stroke: '#5A8F6E', shortCode: 'GOV' },
  { id: 'roads', label: 'ROADS', x: 78, y: 105, r: 21, color: '#2C1810', stroke: '#D4A373', shortCode: 'ROAD' },
  { id: 'water', label: 'WATER', x: 342, y: 95, r: 21, color: '#1D3A5C', stroke: '#5A7D9A', shortCode: 'WTR' },
  { id: 'health', label: 'HEALTH', x: 62, y: 260, r: 21, color: '#3A1010', stroke: '#B54A4A', shortCode: 'MED' },
  { id: 'energy', label: 'ENERGY', x: 358, y: 278, r: 21, color: '#3A2810', stroke: '#C78D3F', shortCode: 'PWR' },
  { id: 'edu', label: 'EDU', x: 148, y: 325, r: 21, color: '#0F2820', stroke: '#5A8F6E', shortCode: 'EDU' },
  { id: 'digital', label: 'DIGITAL', x: 278, y: 340, r: 21, color: '#1A1040', stroke: '#7B68EE', shortCode: 'DPI' },
];

function CivicNetwork({ interactive = true }) {
  const svgRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [mouse, setMouse] = useState({ x: 210, y: 195 });
  const [offsets, setOffsets] = useState(() => NODES.reduce((acc, n) => ({ ...acc, [n.id]: { x: 0, y: 0 } }), {}));
  const frameRef = useRef(null);
  const timeRef = useRef(0);

  // Gentle float animation
  useEffect(() => {
    const animate = (ts) => {
      timeRef.current = ts / 1000;
      const newOffsets = {};
      NODES.forEach((n, i) => {
        if (n.id === 'center') { newOffsets[n.id] = { x: 0, y: 0 }; return; }
        const phase = (i * 1.2) + timeRef.current;
        newOffsets[n.id] = {
          x: Math.sin(phase) * 5,
          y: Math.cos(phase * 0.8) * 4,
        };
      });
      setOffsets(newOffsets);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!interactive || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (420 / rect.width);
    const y = (e.clientY - rect.top) * (390 / rect.height);
    setMouse({ x, y });
  }, [interactive]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 420 390"
      className="w-full max-w-[440px] mx-auto select-none"
      onMouseMove={handleMouseMove}
      aria-label="CivicPulse Multilingual AI Infrastructure Alignment Network"
    >
      <defs>
        <radialGradient id="netBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4A373" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#1C0F07" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4A373" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6F4E37" stopOpacity="0" />
        </radialGradient>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background glow */}
      <circle cx="210" cy="195" r="180" fill="url(#netBg)" />
      <circle cx="210" cy="195" r="70" fill="url(#centerGlow)" />

      {/* Orbit rings */}
      <circle cx="210" cy="195" r="130" fill="none" stroke="rgba(212,163,115,0.12)" strokeWidth="1" strokeDasharray="3 5" />
      <circle cx="210" cy="195" r="85" fill="none" stroke="rgba(212,163,115,0.08)" strokeWidth="1" />

      {/* Connection Lines */}
      <g strokeWidth="1.2" opacity="0.6">
        {NODES.filter(n => n.id !== 'center').map(n => {
          const off = offsets[n.id] || { x: 0, y: 0 };
          const nx = n.x + off.x;
          const ny = n.y + off.y;
          const isHov = hovered === n.id;
          return (
            <line
              key={n.id}
              x1="210"
              y1="195"
              x2={nx}
              y2={ny}
              stroke={isHov ? n.stroke : 'rgba(212,163,115,0.25)'}
              strokeWidth={isHov ? 2 : 1}
              strokeDasharray={isHov ? undefined : '4 3'}
              style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
            />
          );
        })}
      </g>

      {/* Inter-node connections */}
      {[
        ['roads', 'water'],
        ['water', 'energy'],
        ['energy', 'digital'],
        ['edu', 'health'],
        ['health', 'roads'],
        ['govt', 'roads'],
        ['govt', 'water'],
      ].map(([fromId, toId], i) => {
        const fn = NODES.find(n => n.id === fromId);
        const tn = NODES.find(n => n.id === toId);
        if (!fn || !tn) return null;
        const fo = offsets[fn.id] || { x: 0, y: 0 };
        const to = offsets[tn.id] || { x: 0, y: 0 };
        return (
          <line
            key={i}
            x1={fn.x + fo.x}
            y1={fn.y + fo.y}
            x2={tn.x + to.x}
            y2={tn.y + to.y}
            stroke="rgba(212,163,115,0.12)"
            strokeWidth="0.8"
            strokeDasharray="2 4"
          />
        );
      })}

      {/* Nodes */}
      <g>
        {NODES.map(n => {
          const off = offsets[n.id] || { x: 0, y: 0 };
          const isHov = hovered === n.id;
          const nx = n.x + (n.id === 'center' ? 0 : off.x);
          const ny = n.y + (n.id === 'center' ? 0 : off.y);
          return (
            <g
              key={n.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHov && n.id !== 'center' && (
                <circle cx={nx} cy={ny} r={n.r + 10} fill={n.stroke} opacity="0.12" />
              )}
              {n.id === 'center' && (
                <circle cx={nx} cy={ny} r={n.r + 14} fill={n.color} opacity="0.12" style={{ animation: 'pulseGlow 3s ease-in-out infinite' }} />
              )}
              <circle
                cx={nx}
                cy={ny}
                r={n.r}
                fill={n.color}
                stroke={n.stroke}
                strokeWidth={isHov ? 2.5 : 1.5}
                style={{ transition: 'stroke-width 0.2s, r 0.2s', filter: isHov ? 'url(#glow)' : undefined }}
              />
              {n.id === 'center' ? (
                <>
                  <text x={nx} y={ny - 3} textAnchor="middle" fill="#D4A373" fontSize="8" fontWeight="700" fontFamily="Inter">CIVIC</text>
                  <text x={nx} y={ny + 7} textAnchor="middle" fill="rgba(212,163,115,0.7)" fontSize="7" fontFamily="Inter">PULSE</text>
                </>
              ) : (
                <text x={nx} y={ny + 3} textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="800" fontFamily="Inter">
                  {n.shortCode}
                </text>
              )}
              {n.id !== 'center' && (
                <text x={nx} y={ny + n.r + 12} textAnchor="middle" fill="rgba(212,163,115,0.6)" fontSize="7" fontWeight="600" fontFamily="Inter">
                  {n.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Live report pulse dots */}
        {[
          { x: 138, y: 158, c: '#B02626', delay: '0.2s' },
          { x: 268, y: 225, c: '#B8720A', delay: '1.1s' },
          { x: 175, y: 248, c: '#2D7A50', delay: '0.8s' },
          { x: 242, y: 148, c: '#1D6A9E', delay: '1.5s' },
          { x: 183, y: 132, c: '#6F4E37', delay: '0.4s' },
        ].map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r="3.5"
            fill={d.c}
            opacity="0.9"
            style={{ animation: `pulseGlow 2.5s ease-in-out infinite`, animationDelay: d.delay }}
          />
        ))}
      </g>
    </svg>
  );
}

/* ── Stats with Lucide Icons ── */
const STATS = [
  { value: 12847, suffix: '+', label: 'Reports Submitted', icon: ClipboardList },
  { value: 7, suffix: '', label: 'Languages Supported', icon: Globe2 },
  { value: 64, suffix: '%', label: 'Resolution Rate', icon: CheckCircle2 },
  { value: 50, suffix: 'K+', label: 'Active Citizens', icon: Users },
];

const CATEGORIES = [
  { icon: Car, label: 'Roads & Mobility', color: '#D4A373', desc: 'Potholes, traffic, public transport' },
  { icon: Droplets, label: 'Water & Sanitation', color: '#5A7D9A', desc: 'Supply, drainage, sewage' },
  { icon: Zap, label: 'Electricity & Grid', color: '#C78D3F', desc: 'Outages, faulty lines, streetlights' },
  { icon: HeartPulse, label: 'Healthcare & Clinics', color: '#B54A4A', desc: 'Clinics, hospitals, access' },
  { icon: GraduationCap, label: 'Education & Schools', color: '#5A8F6E', desc: 'Schools, colleges, facilities' },
  { icon: Radio, label: 'Digital Public Infra', color: '#7B68EE', desc: 'Internet, broadband, public wifi' },
  { icon: Waves, label: 'Climate & Flood', color: '#2C7FB8', desc: 'Flood channels, drainage, resilience' },
];

const HOW_STEPS = [
  { num: '01', icon: FileText, title: 'Report', desc: 'Describe the infrastructure problem in detail', color: '#6F4E37' },
  { num: '02', icon: Shield, title: 'Evidence', desc: 'Upload photos proving the issue', color: '#5A7D9A' },
  { num: '03', icon: Zap, title: 'AI Analysis', desc: 'Automatic classification and severity scoring', color: '#C78D3F' },
  { num: '04', icon: Globe2, title: 'Gov Review', desc: 'Government officer reviews and assigns priority', color: '#5A8F6E' },
  { num: '05', icon: CheckCircle2, title: 'Action', desc: 'Department dispatched for resolution', color: '#2D7A50' },
  { num: '06', icon: TrendingUp, title: 'Resolution', desc: 'Status updated, citizen notified', color: '#6F4E37' },
];

export default function HomePage() {
  const { t } = useTranslation();
  const statsRef = useRef(null);
  const [statsActive, setStatsActive] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsActive(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const c0 = useCountUp(STATS[0].value, 2200, statsActive);
  const c1 = useCountUp(STATS[1].value, 1200, statsActive);
  const c2 = useCountUp(STATS[2].value, 1800, statsActive);
  const c3 = useCountUp(50, 2000, statsActive);
  const counts = [c0, c1, c2, c3];

  return (
    <div>
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1C0F07] via-[#2C1810] to-[#3E2420] text-white pt-24 pb-16">
        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-[#D4A373]/30 text-[#D4A373]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Multilingual AI Infrastructure Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Fix Your City. <br />
                <span className="text-[#D4A373]">Voice Your Need.</span>
              </h1>

              <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Report infrastructure issues in your native language via WhatsApp or web. AI clusters verified citizen demand directly into government priority planning.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/report"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-light)] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-[#D4A373]/40"
                >
                  <span>Report an Issue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/explore"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Map className="w-4 h-4 text-[#D4A373]" />
                  <span>Explore GIS Map</span>
                </Link>
              </div>

              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-white/50">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp & Web
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> 7 Native Languages
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> 100% Public Ledger
                </span>
              </div>
            </div>

            <div className="hidden lg:block">
              <CivicNetwork />
            </div>

          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-primary)] to-transparent pointer-events-none" />
      </section>

      {/* ── LIVE CIVIC PULSE (Stats) ── */}
      <section id="stats" ref={statsRef} className="py-20 bg-white border-b border-[var(--border-warm)]" aria-labelledby="stats-heading">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1">Live Civic Pulse</div>
            <h2 id="stats-heading" className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Real-Time Community Impact</h2>
            <p className="mt-2 text-[var(--text-secondary)] max-w-md mx-auto text-sm">Citizen reports driving algorithmic government action across communities.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-[var(--bg-primary)] border border-[var(--border-warm)] rounded-xl p-6 text-center space-y-2 shadow-xs">
                  <Icon className="w-7 h-7 mx-auto text-[var(--accent-primary)] mb-2" />
                  <div className="text-3xl font-bold font-mono text-[var(--text-primary)]">
                    {statsActive ? counts[i].toLocaleString() : '—'}{statsActive && s.suffix}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] font-medium">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-20 bg-[var(--bg-primary)]" aria-labelledby="how-heading">
        <div className="container-xl">
          <div className="text-center mb-16">
            <div className="text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1">Process</div>
            <h2 id="how-heading" className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">How CivicPulse Works</h2>
            <p className="mt-2 text-[var(--text-secondary)] max-w-lg mx-auto text-sm">A transparent digital loop from grassroots submission to public verification.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-3 relative">
            {HOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-3 relative group">
                  {i < HOW_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 z-0" style={{ background: `linear-gradient(90deg, ${step.color}40, ${HOW_STEPS[i+1].color}40)` }} />
                  )}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10 shadow-sm transition-transform group-hover:-translate-y-1 bg-white border border-[var(--border-warm)]">
                    <Icon className="w-7 h-7" style={{ color: step.color }} />
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-[var(--text-tertiary)] mb-0.5">{step.num}</div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">{step.title}</div>
                    <div className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-snug hidden sm:block">{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── INFRASTRUCTURE CATEGORIES ── */}
      <section id="infrastructure" className="py-20 bg-white border-y border-[var(--border-warm)]" aria-labelledby="cat-heading">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1">Infrastructure Sectors</div>
            <h2 id="cat-heading" className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">What Can You Report?</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Link key={i} to="/report" className="p-4 rounded-xl border border-[var(--border-warm)] hover:border-[var(--accent-primary)] bg-[var(--bg-primary)] hover:bg-white transition-all text-center flex flex-col items-center gap-2 shadow-xs group">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[var(--border-warm)] flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                    <Icon className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <div className="font-bold text-xs text-[var(--text-primary)]">{cat.label}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] line-clamp-2">{cat.desc}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GIS INTELLIGENCE MAP TEASER ── */}
      <section id="explore" className="py-20 bg-[var(--bg-primary)]" aria-labelledby="map-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-2">GIS Intelligence</div>
              <h2 id="map-heading" className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Infrastructure Demand Map</h2>
              <p className="mt-4 text-[var(--text-secondary)] leading-relaxed text-sm">Real-time visualization of where infrastructure problems cluster. AI-powered hotspot detection identifies priority areas.</p>
              
              <div className="mt-6 space-y-4">
                {[
                  { icon: MapPin, title: 'Real-time hotspots', desc: 'Complaints cluster by geography automatically' },
                  { icon: Flame, title: 'Severity heatmaps', desc: 'Visual urgency layers across districts' },
                  { icon: BarChart3, title: 'Category filters', desc: 'Filter by type, severity, and date' }
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-white border border-[var(--border-warm)] flex items-center justify-center shrink-0 shadow-xs">
                        <Icon className="w-4 h-4 text-[var(--accent-primary)]" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[var(--text-primary)]">{item.title}</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link to="/explore" className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-dark)] text-white text-xs font-bold shadow-sm transition">
                <Map className="w-4 h-4" /> 
                <span>Explore the Map</span> 
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Map Preview Card */}
            <Link to="/explore" className="bg-white rounded-xl border border-[var(--border-warm)] overflow-hidden cursor-pointer hover:shadow-md transition-all group block">
              <div className="bg-gradient-to-br from-[#1C0F07] to-[#3E2420] h-64 relative overflow-hidden flex items-center justify-center">
                <svg viewBox="0 0 400 280" className="absolute inset-0 w-full h-full opacity-20">
                  <defs><pattern id="g2" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0L0 0 0 25" fill="none" stroke="rgba(212,163,115,0.4)" strokeWidth="0.5"/></pattern></defs>
                  <rect width="400" height="280" fill="url(#g2)"/>
                  {[[200,140,12,'#B02626'],[180,130,7,'rgba(212,163,115,0.8)'],[215,150,7,'rgba(212,163,115,0.7)'],[190,160,6,'rgba(90,143,110,0.9)'],[220,135,8,'rgba(199,141,63,0.8)'],[165,148,5,'rgba(90,125,154,0.9)'],[230,155,5,'rgba(181,74,74,0.8)']].map(([x,y,r,fill],i)=>(
                    <circle key={i} cx={x} cy={y} r={r} fill={fill} opacity="0.9" />
                  ))}
                  {[[200,140],[180,130],[215,150],[190,160],[220,135]].map(([x,y],i)=>(
                    <line key={i} x1="200" y1="140" x2={x} y2={y} stroke="rgba(212,163,115,0.3)" strokeWidth="1" />
                  ))}
                </svg>
                <div className="relative text-center z-10 space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[var(--accent-tertiary)] text-sm font-semibold">
                    <Map className="w-4 h-4" />
                    <span>GIS Command Map</span>
                  </div>
                  <div className="text-white/60 text-xs">Interactive geospatial infrastructure grid</div>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-[var(--text-primary)]">National Demand Grid</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Real-time complaint hotspots & deficit clustering</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center group-hover:bg-[var(--accent-primary)] transition-colors">
                  <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── GOVERNMENT IMPACT ── */}
      <section id="impact" className="py-20 bg-gradient-to-br from-[#1C0F07] to-[#2C1810] text-white" aria-labelledby="impact-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-[11px] font-bold text-[#D4A373] uppercase tracking-wider mb-2">Government Impact</div>
              <h2 id="impact-heading" className="text-2xl sm:text-3xl font-bold text-white">For Government Officers & Ministries</h2>
              <p className="mt-4 text-white/70 leading-relaxed text-sm">Government officers use CivicPulse to review citizen evidence, assess AI-classified priorities, assign departments, and resolve issues with full public accountability.</p>
              
              <div className="mt-8 space-y-4">
                {[
                  { icon: Building2, title: 'Structured Complaint Queue', desc: 'Filterable by category, severity, and district' },
                  { icon: Camera, title: 'Evidence Review Panel', desc: 'View citizen-uploaded photos with AI context' },
                  { icon: Cpu, title: 'AI Triage Diagnostics', desc: 'Confidence-scored predictions requiring official verification' },
                  { icon: CheckCircle2, title: 'Status Transparency', desc: 'Citizens see every status update in real time' }
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#D4A373]" />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{item.title}</div>
                        <div className="text-xs text-white/60 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link to="/gov-demo/login" className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-light)] text-white font-bold text-xs shadow-md transition-colors cursor-pointer border border-[#D4A373]/40">
                <Building2 className="w-4 h-4" />
                <span>Government Portal Access</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                ['91%','AI Classification','Category accuracy','#C78D3F'],
                ['4.2d','Avg Resolution','Submission to closure','#5A8F6E'],
                ['7','Languages','Full multilingual support','#5A7D9A'],
                ['64%','Resolution Rate','Issues verified closed','#D4A373']
              ].map(([val, label, sub, color], i) => (
                <div key={i} className="p-6 text-center rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold font-mono" style={{color}}>{val}</div>
                  <div className="text-xs font-bold text-white mt-1">{label}</div>
                  <div className="text-[10px] text-white/50 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRANSPARENCY ── */}
      <section id="transparency" className="py-20 bg-white">
        <div className="container-xl text-center">
          <div className="text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-2">Transparency</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Full Public Audit Trail</h2>
          <p className="mt-2 text-[var(--text-secondary)] max-w-lg mx-auto text-sm">Every report, every piece of evidence, and every government decision is visible and verifiable.</p>
          
          <div className="grid sm:grid-cols-4 gap-6 mt-12">
            {[
              { icon: FileText, label: 'Reports', desc: 'Every complaint submitted by citizens' },
              { icon: ImageIcon, label: 'Evidence', desc: 'All uploaded photos stored securely' },
              { icon: Building2, label: 'Government Actions', desc: 'All work orders and status changes logged' },
              { icon: CheckCircle2, label: 'Resolutions', desc: 'Closure information publicly visible' }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-[var(--bg-primary)] border border-[var(--border-warm)] rounded-xl p-6 text-center space-y-2 shadow-xs">
                  <Icon className="w-7 h-7 mx-auto text-[var(--accent-primary)] mb-2" />
                  <div className="font-bold text-sm text-[var(--text-primary)]">{item.label}</div>
                  <div className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 bg-[var(--bg-primary)] border-t border-[var(--border-warm)]">
        <div className="container-md text-center max-w-xl mx-auto px-4">
          <div className="text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-2">Take Action</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Spot a problem in your community?</h2>
          <p className="mt-3 text-[var(--text-secondary)] text-sm leading-relaxed">Every report you submit becomes verified data that governments use to prioritize infrastructure capital.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/report" className="px-6 py-3 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-dark)] text-white text-xs font-bold shadow-sm transition flex items-center gap-2">
              <span>Submit a Report</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/explore" className="px-6 py-3 rounded-lg bg-white border border-[var(--border-warm)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-semibold shadow-xs transition flex items-center gap-2">
              <Map className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Explore Public Data</span>
            </Link>
          </div>
        </div>
      </section>
 
      {/* ── FOOTER ── */}
      <footer className="bg-[#1E110A] text-white/70 py-12 border-t border-[#D4A373]/20" role="contentinfo">
        <div className="container-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={brandLogo} alt="CivicPulse" className="w-10 h-10 rounded-full object-contain" />
              <div>
                <div className="text-white font-black text-base flex items-center gap-1">
                  <span>Civic</span><span className="text-[#D4A373]">Pulse</span>
                </div>
                <div className="text-xs text-white/50">Digital Public Good (DPGA Standard 1.0)</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs text-white/60">
              <span className="flex items-center gap-1.5 text-[#5A8F6E] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                DPGA Compliant
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">GNU AGPLv3 / Apache 2.0</span>
              <span className="text-white/80 font-medium">© 2026 Praveen Reddy. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
