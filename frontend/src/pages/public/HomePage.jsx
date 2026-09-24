import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Map, CheckCircle2, Zap, TrendingUp, Users, Globe2, ChevronRight, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

/* ── Interactive Civic Network Visualization ── */
const NODES = [
  { id: 'center', label: 'CivicPulse', x: 210, y: 195, r: 38, color: '#6F4E37', stroke: '#D4A373', emoji: null },
  { id: 'govt', label: 'GOVT', x: 210, y: 58, r: 22, color: '#2D7A50', stroke: '#5A8F6E', emoji: '🏛️' },
  { id: 'roads', label: 'ROADS', x: 78, y: 105, r: 21, color: '#2C1810', stroke: '#D4A373', emoji: '🛣️' },
  { id: 'water', label: 'WATER', x: 342, y: 95, r: 21, color: '#1D3A5C', stroke: '#5A7D9A', emoji: '💧' },
  { id: 'health', label: 'HEALTH', x: 62, y: 260, r: 21, color: '#3A1010', stroke: '#B54A4A', emoji: '🏥' },
  { id: 'energy', label: 'ENERGY', x: 358, y: 278, r: 21, color: '#3A2810', stroke: '#C78D3F', emoji: '⚡' },
  { id: 'edu', label: 'EDU', x: 148, y: 325, r: 21, color: '#0F2820', stroke: '#5A8F6E', emoji: '🎓' },
  { id: 'digital', label: 'DIGITAL', x: 278, y: 340, r: 21, color: '#1A1040', stroke: '#7B68EE', emoji: '📡' },
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
          x: Math.sin(phase * 0.7) * 3.5,
          y: Math.cos(phase * 0.5) * 4,
        };
      });
      setOffsets(newOffsets);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current || !interactive) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 420 / rect.width;
    const scaleY = 390 / rect.height;
    setMouse({ x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY });
  }, [interactive]);

  return (
    <svg ref={svgRef} viewBox="0 0 420 390" className="w-full max-w-lg mx-auto select-none" onMouseMove={handleMouseMove} style={{ filter: 'drop-shadow(0 0 40px rgba(111,78,55,0.15))' }}>
      <defs>
        <pattern id="pg" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0L0 0 0 30" fill="none" stroke="rgba(212,163,115,0.08)" strokeWidth="0.5" />
        </pattern>
        <radialGradient id="cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4A373" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#D4A373" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="420" height="390" fill="url(#pg)" rx="16" />
      <circle cx="210" cy="195" r="90" fill="url(#cg)" style={{ animation: 'pulseGlow 4s ease-in-out infinite' }} />

      {/* Mouse-reactive subtle shift */}
      <g style={{ transform: `translate(${(mouse.x - 210) * 0.02}px, ${(mouse.y - 195) * 0.02}px)` }}>
        {/* Connection lines */}
        {NODES.slice(1).map(n => {
          const off = offsets[n.id] || { x: 0, y: 0 };
          const isHov = hovered === n.id;
          return (
            <line key={n.id}
              x1="210" y1="195"
              x2={n.x + off.x} y2={n.y + off.y}
              stroke={isHov ? n.stroke : 'rgba(212,163,115,0.2)'}
              strokeWidth={isHov ? 2 : 1}
              strokeDasharray={isHov ? '0' : '5 4'}
              style={{ transition: 'stroke 0.3s, stroke-width 0.3s', animation: `dashFlow ${2.5 + NODES.indexOf(n) * 0.3}s linear infinite` }}
            />
          );
        })}

        {/* Orbits */}
        <circle cx="210" cy="195" r="68" stroke="rgba(212,163,115,0.1)" strokeWidth="1" strokeDasharray="4 6" fill="none" />
        <circle cx="210" cy="195" r="105" stroke="rgba(212,163,115,0.06)" strokeWidth="1" strokeDasharray="3 8" fill="none" />

        {/* Particles */}
        {[0.1, 0.35, 0.62, 0.85].map((p, i) => {
          const angle = (timeRef.current * 0.6 + p * Math.PI * 2);
          const r = 68;
          return (
            <circle key={i} cx={210 + Math.cos(angle) * r} cy={195 + Math.sin(angle) * r}
              r="3" fill="#D4A373" opacity="0.6" style={{ animation: `pulseGlow ${1.5 + i * 0.4}s ease-in-out infinite` }} />
          );
        })}

        {/* Nodes */}
        {NODES.map(n => {
          const off = offsets[n.id] || { x: 0, y: 0 };
          const isHov = hovered === n.id;
          const nx = n.x + (n.id === 'center' ? 0 : off.x);
          const ny = n.y + (n.id === 'center' ? 0 : off.y);
          return (
            <g key={n.id} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}>
              {isHov && n.id !== 'center' && <circle cx={nx} cy={ny} r={n.r + 10} fill={n.stroke} opacity="0.12" />}
              {n.id === 'center' && <circle cx={nx} cy={ny} r={n.r + 14} fill={n.color} opacity="0.12" style={{ animation: 'pulseGlow 3s ease-in-out infinite' }} />}
              <circle cx={nx} cy={ny} r={n.r} fill={n.color} stroke={n.stroke} strokeWidth={isHov ? 2.5 : 1.5}
                style={{ transition: 'stroke-width 0.2s, r 0.2s', filter: isHov ? 'url(#glow)' : undefined }} />
              {n.emoji
                ? <text x={nx} y={ny - 2} textAnchor="middle" dominantBaseline="middle" fontSize={n.r * 0.85}>{n.emoji}</text>
                : <><text x={nx} y={ny - 3} textAnchor="middle" fill="#D4A373" fontSize="8" fontWeight="700" fontFamily="Inter">CIVIC</text>
                  <text x={nx} y={ny + 6} textAnchor="middle" fill="rgba(212,163,115,0.6)" fontSize="7" fontFamily="Inter">PULSE</text></>
              }
              {n.id !== 'center' && <text x={nx} y={ny + n.r + 12} textAnchor="middle" fill="rgba(212,163,115,0.5)" fontSize="7" fontFamily="Inter">{n.label}</text>}
            </g>
          );
        })}

        {/* Live report dots */}
        {[
          { x: 138, y: 158, c: '#E11D48', delay: '0.2s' },
          { x: 268, y: 225, c: '#C78D3F', delay: '1.1s' },
          { x: 175, y: 248, c: '#5A8F6E', delay: '0.8s' },
          { x: 242, y: 148, c: '#5A7D9A', delay: '1.5s' },
          { x: 183, y: 132, c: '#B54A4A', delay: '0.4s' },
        ].map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="4" fill={d.c} opacity="0.9"
            style={{ animation: `pulseGlow 2.5s ease-in-out infinite`, animationDelay: d.delay }} />
        ))}
      </g>
    </svg>
  );
}

/* ── Stats ── */
const STATS = [
  { value: 12847, suffix: '+', label: 'Reports Submitted', icon: '📋' },
  { value: 7, suffix: '', label: 'Languages Supported', icon: '🌐' },
  { value: 64, suffix: '%', label: 'Resolution Rate', icon: '✅' },
  { value: 50, suffix: 'K+', label: 'Citizens', icon: '👥' },
];

const CATEGORIES = [
  { icon: '🛣️', label: 'Roads & Mobility', color: '#D4A373', desc: 'Potholes, traffic, public transport' },
  { icon: '💧', label: 'Water & Sanitation', color: '#5A7D9A', desc: 'Supply, drainage, sewage' },
  { icon: '⚡', label: 'Electricity', color: '#C78D3F', desc: 'Outages, faulty lines, streetlights' },
  { icon: '🏥', label: 'Healthcare', color: '#B54A4A', desc: 'Clinics, hospitals, access' },
  { icon: '🎓', label: 'Education', color: '#5A8F6E', desc: 'Schools, colleges, facilities' },
  { icon: '📡', label: 'Digital', color: '#7B68EE', desc: 'Internet, connectivity' },
  { icon: '🌊', label: 'Climate', color: '#2C7FB8', desc: 'Flood, drainage, resilience' },
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
    <div className="page-enter">

      {/* ── HERO ── */}
      <section className="hero-section min-h-screen flex items-center relative" aria-labelledby="hero-heading" style={{paddingTop:'64px'}}>
        <div className="hero-grid-pattern" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="container-xl relative z-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 lg:pr-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[rgba(212,163,115,0.3)] bg-[rgba(212,163,115,0.08)]">
                <span className="w-2 h-2 rounded-full bg-[#5A8F6E] animate-pulse" />
                <span className="text-xs font-semibold text-[rgba(212,163,115,0.9)] tracking-widest uppercase">Digital Public Good · DPGA v1.4</span>
              </div>
              <div>
                <h1 id="hero-heading" className="text-display text-white leading-[1.05]">
                  BUILDING BETTER<br />
                  <span className="text-[var(--accent-tertiary)]">COMMUNITIES</span><br />
                  THROUGH CITIZEN DATA
                </h1>
              </div>
              <p className="text-lg text-[rgba(255,255,255,0.65)] max-w-lg leading-relaxed font-light">
                Report infrastructure problems. Provide evidence. Help identify where action is needed most.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/report" className="btn-primary btn-primary-lg" style={{fontSize:'16px', padding:'14px 28px'}}>
                  <FileText className="w-5 h-5" />
                  Report an Issue
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/explore" className="flex items-center gap-2 px-7 py-3.5 rounded-[var(--radius-md)] text-base font-semibold text-white border-2 border-[rgba(212,163,115,0.35)] hover:border-[rgba(212,163,115,0.8)] hover:bg-[rgba(212,163,115,0.08)] transition-all cursor-pointer" style={{fontSize:'15px'}}>
                  <Map className="w-5 h-5" />
                  Explore Infrastructure
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-white/10">
                <span className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.5)]"><Users className="w-4 h-4 text-[var(--accent-tertiary)]" /> 50,000+ citizens</span>
                <span className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.5)]"><Globe2 className="w-4 h-4 text-[var(--accent-tertiary)]" /> 7 languages</span>
                <span className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.5)]"><CheckCircle2 className="w-4 h-4 text-[#5A8F6E]" /> 64% resolved</span>
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
            <div className="text-label mb-2">Live Civic Pulse</div>
            <h2 id="stats-heading" className="text-headline text-[var(--text-primary)]">Real-Time Impact</h2>
            <p className="mt-2 text-[var(--text-secondary)] max-w-md mx-auto text-sm">Citizen reports driving government action across communities.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={i} className="metric-card text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-kpi tabular-nums">{statsActive ? counts[i].toLocaleString() : '—'}{statsActive && s.suffix}</div>
                <div className="text-kpi-sub mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-20 bg-[var(--bg-primary)]" aria-labelledby="how-heading">
        <div className="container-xl">
          <div className="text-center mb-16">
            <div className="text-label mb-2">Process</div>
            <h2 id="how-heading" className="text-headline text-[var(--text-primary)]">How CivicPulse Works</h2>
            <p className="mt-2 text-[var(--text-secondary)] max-w-lg mx-auto text-sm">A transparent process from citizen report to government action.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-3 relative">
            {HOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-3 relative group">
                  {i < HOW_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 z-0" style={{ background: `linear-gradient(90deg, ${step.color}40, ${HOW_STEPS[i+1].color}40)` }} />
                  )}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10 shadow-md transition-transform group-hover:-translate-y-1" style={{ background: `${step.color}12`, border: `2px solid ${step.color}30` }}>
                    <Icon className="w-7 h-7" style={{ color: step.color }} />
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-[var(--text-tertiary)] mb-0.5">{step.num}</div>
                    <div className="text-xs font-bold text-[var(--text-primary)]">{step.title}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5 leading-snug hidden sm:block">{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── INFRASTRUCTURE CATEGORIES ── */}
      <section id="infrastructure" className="py-20 bg-white" aria-labelledby="cat-heading">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="text-label mb-2">Infrastructure</div>
            <h2 id="cat-heading" className="text-headline text-[var(--text-primary)]">What Can You Report?</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {CATEGORIES.map((cat, i) => (
              <Link key={i} to="/report" className="category-card group flex-col gap-3 block">
                <div className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</div>
                <div className="text-xs font-bold text-[var(--text-primary)] leading-tight">{cat.label}</div>
                <div className="text-[10px] text-[var(--text-tertiary)] leading-snug hidden sm:block">{cat.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAP PREVIEW ── */}
      <section id="explore" className="py-20 bg-[var(--bg-primary)]" aria-labelledby="map-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-label mb-3">GIS Intelligence</div>
              <h2 id="map-heading" className="text-headline text-[var(--text-primary)]">Infrastructure Demand Map</h2>
              <p className="mt-4 text-[var(--text-secondary)] leading-relaxed text-sm">Real-time visualization of where infrastructure problems cluster. AI-powered hotspot detection identifies priority areas.</p>
              <div className="mt-6 space-y-4">
                {[['📍','Real-time hotspots','Complaints cluster by geography automatically'],['🔥','Severity heatmaps','Visual urgency layers across districts'],['📊','Category filters','Filter by type, severity, and date']].map(([icon, title, desc], i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-xl">{icon}</span>
                    <div><div className="font-semibold text-sm text-[var(--text-primary)]">{title}</div><div className="text-xs text-[var(--text-secondary)] mt-0.5">{desc}</div></div>
                  </div>
                ))}
              </div>
              <Link to="/explore" className="btn-primary mt-8 inline-flex">
                <Map className="w-4 h-4" /> Explore the Map <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Map Preview */}
            <Link to="/explore" className="card-coffee overflow-hidden cursor-pointer hover:shadow-[var(--shadow-xl)] transition-all group block">
              <div className="bg-gradient-to-br from-[#1C0F07] to-[#3E2420] h-64 relative overflow-hidden flex items-center justify-center">
                <svg viewBox="0 0 400 280" className="absolute inset-0 w-full h-full opacity-20">
                  <defs><pattern id="g2" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0L0 0 0 25" fill="none" stroke="rgba(212,163,115,0.4)" strokeWidth="0.5"/></pattern></defs>
                  <rect width="400" height="280" fill="url(#g2)"/>
                  {[[200,140,12,'#E11D48'],[180,130,7,'rgba(212,163,115,0.8)'],[215,150,7,'rgba(212,163,115,0.7)'],[190,160,6,'rgba(90,143,110,0.9)'],[220,135,8,'rgba(199,141,63,0.8)'],[165,148,5,'rgba(90,125,154,0.9)'],[230,155,5,'rgba(181,74,74,0.8)']].map(([x,y,r,fill],i)=>(
                    <circle key={i} cx={x} cy={y} r={r} fill={fill} opacity="0.9" />
                  ))}
                  {[[200,140],[180,130],[215,150],[190,160],[220,135]].map(([x,y],i)=>(
                    <line key={i} x1="200" y1="140" x2={x} y2={y} stroke="rgba(212,163,115,0.3)" strokeWidth="1" />
                  ))}
                </svg>
                <div className="relative text-center z-10">
                  <div className="text-[var(--accent-tertiary)] text-sm font-semibold">🗺️ GIS Command Map</div>
                  <div className="text-white/50 text-xs mt-1">Interactive infrastructure map</div>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div><div className="font-bold text-sm text-[var(--text-primary)]">National Infrastructure Map</div><div className="text-xs text-[var(--text-tertiary)] mt-0.5">Real-time complaint hotspots</div></div>
                <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center group-hover:bg-[var(--accent-primary)] transition-colors">
                  <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── GOVERNMENT IMPACT ── */}
      <section id="impact" className="py-20 bg-gradient-to-br from-[#1C0F07] to-[#3E2420]" aria-labelledby="impact-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-label mb-3" style={{color:'rgba(212,163,115,0.6)'}}>Government Impact</div>
              <h2 id="impact-heading" className="text-headline text-white">For Government Officers</h2>
              <p className="mt-4 text-[rgba(255,255,255,0.65)] leading-relaxed text-sm">Government officers use CivicPulse to review citizen evidence, assess AI-classified priorities, assign departments, and resolve issues — with full citizen transparency.</p>
              <div className="mt-8 space-y-4">
                {[['🏛️','Structured Complaint Queue','Filterable by category, severity, and district'],['📷','Evidence Review Panel','View citizen-uploaded photos with AI context'],['🤖','AI Assessment','Confidence-scored predictions requiring human verification'],['✅','Status Transparency','Citizens see every status update in real-time']].map(([icon, title, desc], i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-2xl">{icon}</span>
                    <div><div className="font-semibold text-white text-sm">{title}</div><div className="text-xs text-[rgba(255,255,255,0.5)] mt-0.5">{desc}</div></div>
                  </div>
                ))}
              </div>
              <Link to="/gov-demo/login" className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[var(--accent-tertiary)] text-[var(--text-primary)] font-bold text-sm hover:bg-[var(--accent-secondary)] transition-colors cursor-pointer">
                🏛️ Government Demo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['91%','AI Accuracy','Category classification','#C78D3F'],['4.2d','Avg Resolution','Submission to closure','#5A8F6E'],['7','Languages','Full multilingual','#5A7D9A'],['64%','Resolution Rate','Issues fully resolved','#D4A373']].map(([val, label, sub, color], i) => (
                <div key={i} className="p-6 text-center rounded-[var(--radius-lg)]" style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)'}}>
                  <div className="text-2xl font-extrabold" style={{color}}>{val}</div>
                  <div className="text-xs font-bold text-white mt-1">{label}</div>
                  <div className="text-[10px] text-[rgba(255,255,255,0.4)] mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRANSPARENCY ── */}
      <section id="transparency" className="py-20 bg-white">
        <div className="container-xl text-center">
          <div className="text-label mb-3">Transparency</div>
          <h2 className="text-headline text-[var(--text-primary)]">Full Audit Trail</h2>
          <p className="mt-3 text-[var(--text-secondary)] max-w-lg mx-auto text-sm">Every report, every piece of evidence, every government decision — visible and accountable.</p>
          <div className="grid sm:grid-cols-4 gap-6 mt-12">
            {[['📝','Reports','Every complaint submitted by citizens'],['🖼️','Evidence','All uploaded photos stored securely'],['🏛️','Government Actions','All status changes logged'],['✅','Resolutions','Closure information publicly visible']].map(([icon, label, desc], i) => (
              <div key={i} className="metric-card">
                <div className="text-3xl mb-3">{icon}</div>
                <div className="font-bold text-sm text-[var(--text-primary)]">{label}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 bg-[var(--bg-primary)]">
        <div className="container-md text-center">
          <div className="text-label mb-4">Take Action</div>
          <h2 className="text-headline text-[var(--text-primary)]">Spot a problem in your community?</h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-md mx-auto text-sm leading-relaxed">Every report you submit becomes data that governments use to prioritize action.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Link to="/report" className="btn-primary btn-primary-lg">
              <FileText className="w-5 h-5" /> Report an Issue <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/explore" className="btn-secondary" style={{padding:'14px 28px', fontSize:'15px'}}>
              <Map className="w-5 h-5" /> Explore Infrastructure
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[var(--text-primary)] text-[rgba(255,255,255,0.45)] py-12">
        <div className="container-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-tertiary)] flex items-center justify-center text-[var(--text-primary)] font-bold text-sm">CP</div>
              <div><div className="text-white font-bold text-sm">CivicPulse</div><div className="text-xs text-[rgba(255,255,255,0.35)]">Digital Public Good</div></div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Accessibility</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <Link to="/gov-demo/login" className="hover:text-white transition-colors">Government Demo</Link>
              <span className="flex items-center gap-1.5 text-[#5A8F6E]"><CheckCircle2 className="w-3.5 h-3.5" /> DPGA Certified</span>
              <span>© 2026 CivicPulse</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
