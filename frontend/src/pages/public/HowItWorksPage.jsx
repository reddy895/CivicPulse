import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Zap, Globe2, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';

const STEPS = [
  { num: '01', icon: FileText, title: 'Report the Problem', desc: 'Describe the infrastructure issue in detail. Our system supports 7 languages with automatic translation.', color: '#6F4E37' },
  { num: '02', icon: Shield, title: 'Upload Evidence', desc: 'Add photos proving the issue. Up to 5 images per complaint — drag & drop on desktop, camera on mobile.', color: '#5A7D9A' },
  { num: '03', icon: Zap, title: 'AI Analysis', desc: 'Our AI automatically classifies the issue category and scores severity. All AI assessments are clearly labelled and require human verification.', color: '#C78D3F' },
  { num: '04', icon: Globe2, title: 'Government Review', desc: 'Authorized government officers review the evidence, AI assessment, and assign to relevant departments.', color: '#5A8F6E' },
  { num: '05', icon: CheckCircle2, title: 'Action Dispatched', desc: 'A work order is dispatched to the responsible agency with a deadline and budget allocation.', color: '#2D7A50' },
  { num: '06', icon: TrendingUp, title: 'Resolution & Transparency', desc: 'Status updates are visible to the citizen in real-time. Resolution information is publicly logged.', color: '#6F4E37' },
];

export default function HowItWorksPage() {
  return (
    <div style={{ paddingTop: '64px' }} className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container-lg py-20">
        <div className="text-center mb-16">
          <div className="text-label mb-3">Process</div>
          <h1 className="text-headline text-[var(--text-primary)]">How CivicPulse Works</h1>
          <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">A transparent, evidence-based process from citizen observation to government action.</p>
        </div>
        <div className="space-y-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="card-coffee p-8 flex flex-col sm:flex-row items-start gap-6">
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${step.color}15`, border: `2px solid ${step.color}30` }}>
                    <Icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>
                  <div className="text-3xl font-extrabold text-[var(--border-warm)]">{step.num}</div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">{step.title}</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-16">
          <Link to="/report" className="btn-primary btn-primary-lg">
            <FileText className="w-5 h-5" /> Start Your Report <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
