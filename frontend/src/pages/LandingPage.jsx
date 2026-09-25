import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, FileText, Map, BarChart3, Shield, CheckCircle2,
  Zap, Droplets, Road, Heart, GraduationCap, Wifi, CloudRain,
  TrendingUp, Users, Globe2, Clock, ChevronRight, Building2, Camera, Cpu, Flame, MapPin
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Animated counter hook
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// Civic Infrastructure SVG Visualization
function CivicVisualization() {
  return (
    <div className="relative w-full h-full flex items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 420 380" className="w-full max-w-md" fill="none">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(212,163,115,0.12)" strokeWidth="0.5"/>
          </pattern>
          <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4A373" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#D4A373" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <rect width="420" height="380" fill="url(#grid)" rx="16"/>
        
        {/* Glow center */}
        <circle cx="210" cy="190" r="80" fill="url(#glow1)" className="node-pulse" />

        {/* Connection lines */}
        <line x1="210" y1="190" x2="80" y2="100" stroke="rgba(212,163,115,0.3)" strokeWidth="1.5" className="civic-dash-line" />
        <line x1="210" y1="190" x2="340" y2="90" stroke="rgba(212,163,115,0.3)" strokeWidth="1.5" className="civic-dash-line" />
        <line x1="210" y1="190" x2="60" y2="260" stroke="rgba(212,163,115,0.3)" strokeWidth="1.5" className="civic-dash-line" />
        <line x1="210" y1="190" x2="360" y2="280" stroke="rgba(212,163,115,0.3)" strokeWidth="1.5" className="civic-dash-line" />
        <line x1="210" y1="190" x2="150" y2="320" stroke="rgba(212,163,115,0.3)" strokeWidth="1.5" className="civic-dash-line" />
        <line x1="210" y1="190" x2="280" y2="340" stroke="rgba(212,163,115,0.3)" strokeWidth="1.5" className="civic-dash-line" />
        <line x1="210" y1="190" x2="210" y2="60" stroke="rgba(90,143,110,0.4)" strokeWidth="1.5" className="civic-dash-line" />

        {/* Central Hub */}
        <circle cx="210" cy="190" r="36" fill="rgba(111,78,55,0.9)" stroke="#D4A373" strokeWidth="2.5" />
        <circle cx="210" cy="190" r="28" fill="rgba(111,78,55,1)" />
        <text x="210" y="186" textAnchor="middle" fill="#D4A373" fontSize="9" fontWeight="700" fontFamily="Inter">CIVIC</text>
        <text x="210" y="197" textAnchor="middle" fill="rgba(212,163,115,0.7)" fontSize="8" fontFamily="Inter">PULSE</text>

        {/* Road Node */}
        <g className="node-float" style={{animationDelay:'0s'}}>
          <circle cx="80" cy="100" r="22" fill="#2C1810" stroke="#D4A373" strokeWidth="1.5" opacity="0.9"/>
          <text x="80" y="98" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="800">ROAD</text>
          <text x="80" y="112" textAnchor="middle" fill="rgba(212,163,115,0.7)" fontSize="7" fontFamily="Inter">ROADS</text>
        </g>

        {/* Water Node */}
        <g className="node-float" style={{animationDelay:'0.7s'}}>
          <circle cx="340" cy="90" r="22" fill="#2C1810" stroke="#5A7D9A" strokeWidth="1.5" opacity="0.9"/>
          <text x="340" y="88" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="800">WTR</text>
          <text x="340" y="102" textAnchor="middle" fill="rgba(90,125,154,0.7)" fontSize="7" fontFamily="Inter">WATER</text>
        </g>

        {/* Health Node */}
        <g className="node-float" style={{animationDelay:'1.4s'}}>
          <circle cx="60" cy="260" r="22" fill="#2C1810" stroke="#B54A4A" strokeWidth="1.5" opacity="0.9"/>
          <text x="60" y="258" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="800">MED</text>
          <text x="60" y="272" textAnchor="middle" fill="rgba(181,74,74,0.7)" fontSize="7" fontFamily="Inter">HEALTH</text>
        </g>

        {/* Energy Node */}
        <g className="node-float" style={{animationDelay:'0.3s'}}>
          <circle cx="360" cy="280" r="22" fill="#2C1810" stroke="#C78D3F" strokeWidth="1.5" opacity="0.9"/>
          <text x="360" y="278" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="800">PWR</text>
          <text x="360" y="292" textAnchor="middle" fill="rgba(199,141,63,0.7)" fontSize="7" fontFamily="Inter">ENERGY</text>
        </g>

        {/* Education Node */}
        <g className="node-float" style={{animationDelay:'1.0s'}}>
          <circle cx="150" cy="320" r="22" fill="#2C1810" stroke="#5A8F6E" strokeWidth="1.5" opacity="0.9"/>
          <text x="150" y="318" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="800">EDU</text>
          <text x="150" y="332" textAnchor="middle" fill="rgba(90,143,110,0.7)" fontSize="7" fontFamily="Inter">EDUCATION</text>
        </g>

        {/* Digital Node */}
        <g className="node-float" style={{animationDelay:'1.8s'}}>
          <circle cx="280" cy="340" r="22" fill="#2C1810" stroke="#7B68EE" strokeWidth="1.5" opacity="0.9"/>
          <text x="280" y="338" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="800">DPI</text>
          <text x="280" y="352" textAnchor="middle" fill="rgba(123,104,238,0.7)" fontSize="7" fontFamily="Inter">DIGITAL</text>
        </g>

        {/* Gov node top */}
        <g className="node-float" style={{animationDelay:'0.5s'}}>
          <circle cx="210" cy="60" r="22" fill="#5A8F6E" stroke="rgba(90,143,110,0.3)" strokeWidth="3" opacity="0.9"/>
          <text x="210" y="58" textAnchor="middle" fill="white" fontSize="8" fontWeight="800">GOV</text>
          <text x="210" y="72" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="7" fontFamily="Inter">GOVT</text>
        </g>

        {/* Report pulse indicators */}
        <circle cx="140" cy="155" r="5" fill="#E11D48" opacity="0.8" className="node-pulse" style={{animationDelay:'0.2s'}} />
        <circle cx="270" cy="220" r="4" fill="#C78D3F" opacity="0.8" className="node-pulse" style={{animationDelay:'1.1s'}} />
        <circle cx="175" cy="245" r="3" fill="#5A8F6E" opacity="0.8" className="node-pulse" style={{animationDelay:'0.8s'}} />
        <circle cx="245" cy="145" r="5" fill="#5A7D9A" opacity="0.8" className="node-pulse" style={{animationDelay:'1.5s'}} />
        <circle cx="185" cy="130" r="4" fill="#B54A4A" opacity="0.9" className="node-pulse" style={{animationDelay:'0.4s'}} />

        {/* Orbit ring */}
        <circle cx="210" cy="190" r="65" stroke="rgba(212,163,115,0.15)" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="210" cy="190" r="100" stroke="rgba(212,163,115,0.08)" strokeWidth="1" strokeDasharray="3 8" />
      </svg>
    </div>
  );
}

const CATEGORIES = [
  { icon: Road, labelKey: 'categories.roads', color: '#D4A373' },
  { icon: Droplets, labelKey: 'categories.water', color: '#5A7D9A' },
  { icon: Zap, labelKey: 'categories.electricity', color: '#C78D3F' },
  { icon: Heart, labelKey: 'categories.healthcare', color: '#B54A4A' },
  { icon: GraduationCap, labelKey: 'categories.education', color: '#5A8F6E' },
  { icon: Wifi, labelKey: 'categories.digital', color: '#7B68EE' },
  { icon: CloudRain, labelKey: 'categories.flood', color: '#2C7FB8' },
];

const FLOW_STEPS = [
  { icon: FileText, labelKey: 'landing.step_report', color: '#6F4E37' },
  { icon: Shield, labelKey: 'landing.step_evidence', color: '#5A7D9A' },
  { icon: Zap, labelKey: 'landing.step_ai', color: '#C78D3F' },
  { icon: Globe2, labelKey: 'landing.step_review', color: '#5A8F6E' },
  { icon: CheckCircle2, labelKey: 'landing.step_action', color: '#2D7A50' },
  { icon: TrendingUp, labelKey: 'landing.step_transparency', color: '#6F4E37' },
];

export default function LandingPage({ onNavigate }) {
  const { t } = useTranslation();
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  // Observe when stats section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const totalReports = useCountUp(12847, 2200, statsVisible);
  const resolved = useCountUp(8234, 2400, statsVisible);
  const underReview = useCountUp(2891, 2000, statsVisible);
  const critical = useCountUp(1722, 1800, statsVisible);

  return (
    <div className="page-enter">
      
      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="hero-section min-h-screen flex items-center relative" aria-labelledby="hero-heading">
        <div className="hero-grid-pattern" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        
        <div className="container-xl relative z-10 py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="space-y-8">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[rgba(212,163,115,0.3)] bg-[rgba(212,163,115,0.08)]">
                <span className="w-2 h-2 rounded-full bg-[#5A8F6E] animate-pulse" aria-hidden="true" />
                <span className="text-xs font-semibold text-[rgba(212,163,115,0.9)] tracking-wide uppercase">
                  Digital Public Good · DPGA Certified
                </span>
              </div>

              <div>
                <h1 id="hero-heading" className="text-display text-white leading-tight">
                  {t('landing.hero_title')}
                </h1>
                <div className="text-display text-[var(--accent-tertiary)] leading-tight">
                  {t('landing.hero_subtitle')}
                </div>
              </div>

              <p className="text-lg text-[rgba(255,255,255,0.7)] max-w-lg leading-relaxed font-light">
                {t('landing.hero_desc')}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate('citizen')}
                  className="btn-primary btn-primary-lg"
                  aria-label="Report an infrastructure issue"
                >
                  <FileText className="w-5 h-5" aria-hidden="true" />
                  {t('landing.cta_report')}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  onClick={() => onNavigate('map')}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-[var(--radius-md)] text-base font-semibold text-white border-2 border-[rgba(212,163,115,0.4)] hover:border-[rgba(212,163,115,0.8)] hover:bg-[rgba(212,163,115,0.08)] transition-all cursor-pointer"
                >
                  <Map className="w-5 h-5" aria-hidden="true" />
                  {t('landing.cta_explore')}
                </button>
              </div>

              {/* Social proof */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.6)]">
                  <Users className="w-4 h-4 text-[var(--accent-tertiary)]" />
                  <span>50,000+ citizens</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.6)]">
                  <Globe2 className="w-4 h-4 text-[var(--accent-tertiary)]" />
                  <span>7 languages</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.6)]">
                  <CheckCircle2 className="w-4 h-4 text-[#5A8F6E]" />
                  <span>64% resolution rate</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:flex items-center justify-center" aria-hidden="true">
              <div className="w-full max-w-lg h-96 opacity-90">
                <CivicVisualization />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg-primary)] to-transparent pointer-events-none" aria-hidden="true" />
      </section>

      {/* =====================================================
          LIVE STATISTICS
      ===================================================== */}
      <section ref={statsRef} className="py-20 bg-white border-b border-[var(--border-warm)]" aria-labelledby="stats-heading">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="text-label mb-3">Live Civic Data</div>
            <h2 id="stats-heading" className="text-headline text-[var(--text-primary)]">
              {t('landing.hero_subtitle', { defaultValue: 'Real-Time Civic Impact' })}
            </h2>
            <p className="mt-3 text-[var(--text-secondary)] max-w-lg mx-auto">
              Updated in real-time as citizens report and governments respond.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: totalReports, label: t('landing.stats_total'), color: 'var(--accent-primary)', icon: FileText, suffix: '+' },
              { value: resolved, label: t('landing.stats_resolved'), color: 'var(--status-success)', icon: CheckCircle2, suffix: '' },
              { value: underReview, label: t('landing.stats_review'), color: 'var(--status-info)', icon: Clock, suffix: '' },
              { value: critical, label: t('landing.stats_critical'), color: 'var(--status-danger)', icon: Zap, suffix: '' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="metric-card text-center">
                  <div className="metric-icon-wrap mx-auto mb-3" style={{ background: `${stat.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: stat.color }} aria-hidden="true" />
                  </div>
                  <div className="text-kpi tabular-nums" style={{ color: stat.color }}>
                    {statsVisible ? stat.value.toLocaleString() : '—'}
                    {statsVisible && stat.suffix}
                  </div>
                  <div className="text-kpi-sub mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}
      <section className="py-20 bg-[var(--bg-primary)]" aria-labelledby="how-heading">
        <div className="container-xl">
          <div className="text-center mb-16">
            <div className="text-label mb-3">Process</div>
            <h2 id="how-heading" className="text-headline text-[var(--text-primary)]">
              {t('landing.how_title')}
            </h2>
            <p className="mt-3 text-[var(--text-secondary)] max-w-lg mx-auto">
              {t('landing.how_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-2 relative">
            {FLOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-3 relative">
                  {/* Connector line */}
                  {i < FLOW_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-7 left-1/2 w-full h-0.5 z-0"
                      style={{ background: `linear-gradient(90deg, ${step.color}40, ${FLOW_STEPS[i+1].color}40)` }}
                    />
                  )}
                  
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10 shadow-md"
                    style={{ background: `${step.color}15`, border: `2px solid ${step.color}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: step.color }} aria-hidden="true" />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs font-bold text-[var(--text-primary)]">{t(step.labelKey)}</div>
                    {i < FLOW_STEPS.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] mx-auto mt-1 lg:hidden" aria-hidden="true" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}
      <section className="py-20 bg-white" aria-labelledby="categories-heading">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="text-label mb-3">Infrastructure</div>
            <h2 id="categories-heading" className="text-headline text-[var(--text-primary)]">
              {t('landing.categories_title')}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {CATEGORIES.map((cat, i) => (
              <button
                key={i}
                onClick={() => onNavigate('citizen')}
                className="category-card group"
                aria-label={t(cat.labelKey)}
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <div className="text-xs font-semibold text-[var(--text-secondary)] leading-tight">{t(cat.labelKey)}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          MAP PREVIEW
      ===================================================== */}
      <section className="py-20 bg-[var(--bg-primary)]" aria-labelledby="map-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-label mb-3">GIS Intelligence</div>
              <h2 id="map-heading" className="text-headline text-[var(--text-primary)]">
                Infrastructure Demand Map
              </h2>
              <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">
                Visualize where infrastructure problems cluster in real time. 
                AI-powered hotspot detection identifies priority areas that need government action most urgently.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: MapPin, title: 'Real-time hotspots', desc: 'Citizen reports cluster automatically by geography' },
                  { icon: Flame, title: 'Severity heatmaps', desc: 'Visual urgency layering across districts' },
                  { icon: BarChart3, title: 'Category filters', desc: 'Filter by type, severity, and date range' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--text-primary)] text-sm">{item.title}</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => onNavigate('map')}
                className="btn-primary mt-8"
              >
                <Map className="w-4 h-4" />
                Explore the Map
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Map preview card */}
            <div 
              className="card-coffee overflow-hidden cursor-pointer hover:shadow-[var(--shadow-xl)] transition-all group"
              onClick={() => onNavigate('map')}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onNavigate('map')}
              aria-label="View infrastructure map"
            >
              <div className="bg-gradient-to-br from-[#1C0F07] to-[#3E2420] p-8 h-64 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 400 300" className="w-full h-full" fill="none">
                    <rect width="400" height="300" fill="url(#grid2)"/>
                    <defs>
                      <pattern id="grid2" width="25" height="25" patternUnits="userSpaceOnUse">
                        <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(212,163,115,0.3)" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    {/* Stylized India map points */}
                    {[
                      [200,150], [180,140],[220,145],[190,165],[215,170],
                      [170,155],[230,160],[200,130],[210,180]
                    ].map(([x,y], i) => (
                      <g key={i}>
                        <circle cx={x} cy={y} r={i===0?12:7} fill={i===0?"#E11D48":"rgba(212,163,115,0.7)"} opacity="0.85"/>
                        {i===0 && <circle cx={x} cy={y} r="20" fill="#E11D48" opacity="0.2" className="node-pulse"/>}
                      </g>
                    ))}
                    <line x1="200" y1="150" x2="180" y2="140" stroke="rgba(212,163,115,0.4)" strokeWidth="1"/>
                    <line x1="200" y1="150" x2="220" y2="145" stroke="rgba(212,163,115,0.4)" strokeWidth="1"/>
                    <line x1="200" y1="150" x2="190" y2="165" stroke="rgba(212,163,115,0.4)" strokeWidth="1"/>
                  </svg>
                </div>
                <div className="relative text-center z-10">
                  <div className="text-[var(--accent-tertiary)] text-sm font-semibold mb-2 flex items-center justify-center gap-1.5">
                    <Map className="w-4 h-4 inline" /> GIS Command Map
                  </div>
                  <div className="text-white text-xs opacity-70">Click to open interactive map</div>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-[var(--text-primary)]">National Infrastructure Map</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Real-time complaint hotspots</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center group-hover:bg-[var(--accent-primary)] transition-colors">
                  <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          COMMUNITY ACTIVITY
      ===================================================== */}
      <section className="py-20 bg-white" aria-labelledby="community-heading">
        <div className="container-xl">
          <div className="text-center mb-12">
            <div className="text-label mb-3">Community</div>
            <h2 id="community-heading" className="text-headline text-[var(--text-primary)]">
              {t('landing.community_title')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'CR-IND-1001', title: 'Pothole on main junction road', category: 'Roads & Mobility', location: 'Bengaluru, Karnataka', affected: 284, status: 'Under Review', urgency: 'Critical', time: '2 hours ago' },
              { id: 'CR-IND-1002', title: 'Water supply cut off for 3 days', category: 'Water & Sanitation', location: 'Varanasi, UP', affected: 1450, status: 'Assigned', urgency: 'High', time: '5 hours ago' },
              { id: 'CR-IND-1003', title: 'Primary health clinic non-functional', category: 'Healthcare', location: 'Gadchiroli, Maharashtra', affected: 890, status: 'Verified', urgency: 'Critical', time: '1 day ago' },
            ].map((report) => (
              <article key={report.id} className="card-coffee p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono text-[var(--text-tertiary)]">#{report.id}</div>
                    <div className="font-semibold text-sm text-[var(--text-primary)] mt-1 leading-snug">{report.title}</div>
                  </div>
                  <span className={`badge-pill shrink-0 ${
                    report.urgency === 'Critical' ? 'badge-pill-danger' : 'badge-pill-warning'
                  }`}>
                    {report.urgency}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                  <span className="px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-medium">{report.category}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[var(--text-tertiary)]" /> {report.location}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-warm)] text-xs">
                  <div className="flex items-center gap-3 text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {report.affected.toLocaleString()} affected
                    </span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[var(--text-tertiary)]" /> {report.time}</span>
                  </div>
                  <span className={`badge-pill ${
                    report.status === 'Under Review' ? 'badge-pill-warning' : 
                    report.status === 'Assigned' ? 'badge-pill-info' : 'badge-pill-success'
                  }`}>{report.status}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => onNavigate('complaints')}
              className="btn-secondary"
            >
              View All Community Reports
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          GOVERNMENT IMPACT
      ===================================================== */}
      <section className="py-20 bg-gradient-to-br from-[var(--text-primary)] to-[#3E2420]" aria-labelledby="impact-heading">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(212,163,115,0.15)] border border-[rgba(212,163,115,0.2)] mb-6">
                <span className="text-[var(--accent-tertiary)] text-xs font-semibold uppercase tracking-wide">Government Impact</span>
              </div>
              <h2 id="impact-heading" className="text-headline text-white">
                {t('landing.impact_title')}
              </h2>
              <p className="mt-4 text-[rgba(255,255,255,0.65)] leading-relaxed">
                Government officers use CivicPulse to review evidence, assess AI-classified priorities, 
                assign departments, and resolve infrastructure issues — with full transparency to citizens.
              </p>
              <div className="mt-8 space-y-5">
                {[
                  { icon: Building2, title: 'Structured Complaint Queue', desc: 'Filterable by category, severity, and district' },
                  { icon: Camera, title: 'Evidence Review Panel', desc: 'View citizen-uploaded photos with AI context' },
                  { icon: Cpu, title: 'AI Assessment', desc: 'Confidence-scored category and severity predictions' },
                  { icon: CheckCircle2, title: 'Status Transparency', desc: 'Citizens see every update in real-time' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 text-[var(--accent-tertiary)] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{item.title}</div>
                        <div className="text-xs text-[rgba(255,255,255,0.5)] mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '91%', label: 'AI Accuracy', sub: 'Category classification', color: '#C78D3F' },
                { value: '4.2d', label: 'Avg. Resolution', sub: 'From submission to closure', color: '#5A8F6E' },
                { value: '7', label: 'Languages', sub: 'Full multilingual support', color: '#5A7D9A' },
                { value: '64%', label: 'Resolution Rate', sub: 'Issues fully resolved', color: '#D4A373' },
              ].map((stat, i) => (
                <div key={i} className="card-glass p-6 text-center" style={{background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)'}}>
                  <div className="text-2xl font-extrabold" style={{color:stat.color}}>{stat.value}</div>
                  <div className="text-xs font-bold text-white mt-1">{stat.label}</div>
                  <div className="text-[10px] text-[rgba(255,255,255,0.4)] mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="py-24 bg-[var(--bg-primary)]" aria-labelledby="cta-heading">
        <div className="container-md text-center">
          <div className="text-label mb-4">Take Action</div>
          <h2 id="cta-heading" className="text-headline text-[var(--text-primary)]">
            Your community deserves<br />better infrastructure
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            Every report you submit becomes data that governments use to prioritize action. 
            Start reporting today.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <button
              onClick={() => onNavigate('citizen')}
              className="btn-primary btn-primary-lg"
            >
              <FileText className="w-5 h-5" />
              {t('landing.cta_report')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="btn-secondary"
              style={{padding:'14px 28px', fontSize:'15px'}}
            >
              <Map className="w-5 h-5" />
              {t('landing.cta_explore')}
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="bg-[var(--text-primary)] text-[rgba(255,255,255,0.5)] py-12" role="contentinfo">
        <div className="container-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-tertiary)] flex items-center justify-center text-[var(--text-primary)] font-bold text-sm">CP</div>
              <div>
                <div className="text-white font-bold text-sm">CivicPulse</div>
                <div className="text-xs text-[rgba(255,255,255,0.4)]">Digital Public Good</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <span className="flex items-center gap-1.5 text-[#5A8F6E]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                DPGA Certified v1.4.0
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">GNU AGPLv3 / Apache 2.0</span>
              <span>UN SDG 9 & 11</span>
              <span className="text-white font-medium">© 2026 Praveen Reddy. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
