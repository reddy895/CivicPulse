import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Image, MapPin, CheckCircle2, ArrowRight, ArrowLeft, X, Plus, 
  ZoomIn, ChevronLeft, ChevronRight, AlertCircle, Loader2, Sparkles, CheckCircle, 
  Upload, Camera, Car, Droplets, Zap, HeartPulse, GraduationCap, Radio, Waves 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { submitCitizenRequest } from '../../services/api';
import { toast } from '../../components/ui/Toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const CATEGORIES = [
  { id: 'Roads & Public Transport', icon: Car, key: 'roads', label: 'Roads & Mobility', desc: 'Potholes, broken roads, traffic', color: '#D4A373' },
  { id: 'Water & Sanitation', icon: Droplets, key: 'water', label: 'Water & Sanitation', desc: 'Water supply, drainage, sewage', color: '#5A7D9A' },
  { id: 'Clean Energy & Grid', icon: Zap, key: 'electricity', label: 'Electricity & Energy', desc: 'Power outages, faulty lines, lighting', color: '#C78D3F' },
  { id: 'Healthcare & Clinics', icon: HeartPulse, key: 'healthcare', label: 'Healthcare', desc: 'Clinics, hospitals, medical access', color: '#B54A4A' },
  { id: 'Education & Schools', icon: GraduationCap, key: 'education', label: 'Education', desc: 'Schools, colleges, facilities', color: '#5A8F6E' },
  { id: 'Digital Public Infrastructure', icon: Radio, key: 'digital', label: 'Digital Infrastructure', desc: 'Internet, connectivity', color: '#7B68EE' },
  { id: 'Flood & Climate Resilience', icon: Waves, key: 'flood', label: 'Flood & Climate', desc: 'Flooding, drainage, climate hazards', color: '#2C7FB8' },
];

const STEPS = ['Category', 'Description', 'Evidence', 'Location', 'Review'];
const MAX_IMAGES = 5;

async function validateImageFile(file) {
  if (file.size > 10 * 1024 * 1024) return { valid: false, error: `File too large (${(file.size/1024/1024).toFixed(1)}MB). Max 10MB.` };
  if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(file.type)) return { valid: false, error: `Unsupported type: ${file.type}` };
  try {
    const buf = await file.slice(0, 12).arrayBuffer();
    const b = new Uint8Array(buf);
    const ok = (b[0]===0xFF&&b[1]===0xD8&&b[2]===0xFF) || (b[0]===0x89&&b[1]===0x50&&b[2]===0x4E&&b[3]===0x47) || (b[0]===0x52&&b[1]===0x49&&b[2]===0x46&&b[3]===0x46&&b[8]===0x57&&b[9]===0x45&&b[10]===0x42&&b[11]===0x50);
    if (!ok) return { valid: false, error: 'Invalid image data' };
  } catch { /* if ArrayBuffer fails, allow based on MIME */ }
  return { valid: true, error: null };
}

function Lightbox({ images, index, onClose }) {
  const [cur, setCur] = useState(index);
  useEffect(() => {
    const h = (e) => { if (e.key==='Escape') onClose(); if (e.key==='ArrowLeft') setCur(v=>(v-1+images.length)%images.length); if (e.key==='ArrowRight') setCur(v=>(v+1)%images.length); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [images.length, onClose]);
  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal aria-label="Evidence viewer">
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer z-10">
        <X className="w-5 h-5" />
      </button>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/10 rounded-full text-white text-sm">
        {cur + 1} / {images.length}
      </div>
      {images.length > 1 && <>
        <button onClick={e=>{e.stopPropagation();setCur(v=>(v-1+images.length)%images.length)}} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer"><ChevronLeft className="w-6 h-6"/></button>
        <button onClick={e=>{e.stopPropagation();setCur(v=>(v+1)%images.length)}} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer"><ChevronRight className="w-6 h-6"/></button>
      </>}
      <img src={images[cur].preview} alt={`Evidence ${cur+1}`} className="lightbox-image" onClick={e=>e.stopPropagation()} />
    </div>
  );
}

export default function ReportNewPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [imgErrors, setImgErrors] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946, name: '', detecting: false, detected: false });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  // Auto-detect location
  useEffect(() => { detectLoc(); }, []);

  function detectLoc() {
    setLocation(p => ({ ...p, detecting: true }));
    if (!navigator.geolocation) { setLocation(p => ({ ...p, detecting: false, name: user?.district || 'Location unavailable' })); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: parseFloat(pos.coords.latitude.toFixed(5)), lng: parseFloat(pos.coords.longitude.toFixed(5)), name: `${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`, detecting: false, detected: true }),
      () => setLocation({ lat: 12.9716, lng: 77.5946, name: user?.district || 'Bengaluru, Karnataka', detecting: false, detected: false }),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  const addImages = useCallback(async (files) => {
    const errs = []; const toAdd = [];
    for (const file of Array.from(files)) {
      if (images.length + toAdd.length >= MAX_IMAGES) { errs.push(`Max ${MAX_IMAGES} images allowed`); break; }
      const { valid, error } = await validateImageFile(file);
      if (!valid) { errs.push(`${file.name}: ${error}`); continue; }
      toAdd.push({ file, preview: URL.createObjectURL(file), id: `img_${Date.now()}_${Math.random().toString(36).slice(2)}` });
    }
    if (toAdd.length) setImages(p => [...p, ...toAdd]);
    if (errs.length) setImgErrors(errs);
  }, [images.length]);

  const removeImage = (id) => setImages(p => { const i = p.find(x=>x.id===id); if(i) URL.revokeObjectURL(i.preview); return p.filter(x=>x.id!==id); });

  const canProceed = () => {
    if (step===0) return !!category;
    if (step===1) return description.trim().length >= 20;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitCitizenRequest({
        text: description, channel: 'text', country_code: user?.country_code||'IND',
        location_name: location.name, latitude: location.lat, longitude: location.lng,
        citizen_name: user?.name||'Citizen', submitter_id: user?.id, submitter_email: user?.email,
        category: category,
      });
      // Upload evidence
      let uploaded = 0;
      for (const img of images) {
        try {
          const fd = new FormData(); fd.append('file', img.file);
          const r = await fetch(`${API_BASE}/complaints/${res.id}/evidence`, { method:'POST', body: fd });
          if (r.ok) uploaded++;
        } catch {}
      }
      setResult({ ...res, evidenceUploaded: uploaded });
      toast.success('Report submitted successfully!');
    } catch (e) {
      toast.error('Could not submit report. Please try again.');
    }
    setSubmitting(false);
  };

  // SUCCESS STATE
  if (result) {
    const cpId = `CP-${new Date().getFullYear()}-${String(result.id||'').slice(-6).toUpperCase()||String(Math.floor(Math.random()*99999)).padStart(5,'0')}`;
    return (
      <div className="container-md py-16 page-enter">
        <div className="card-coffee p-10 text-center space-y-8 max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-[var(--status-success-bg)] border-4 border-[var(--status-success)] flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-[var(--status-success)]" />
          </div>
          <div><h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Report Submitted!</h1><p className="text-[var(--text-secondary)] mt-2 text-sm">Your report is being reviewed by government officers.</p></div>
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 space-y-3 text-sm text-left">
            <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Complaint ID</span><span className="font-mono font-bold text-[var(--accent-primary)]">{cpId}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Status</span><span className="badge-pill badge-pill-info">● Submitted</span></div>
            {result.evidenceUploaded > 0 && <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Evidence</span><span className="font-semibold">{result.evidenceUploaded} photo{result.evidenceUploaded>1?'s':''} uploaded</span></div>}
            <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Location</span><span className="font-semibold truncate max-w-[200px]">{location.name}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">AI Category</span><span className="font-semibold">{result.category||category}</span></div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--status-info-bg)] border border-[var(--status-info-border)] text-sm text-[var(--status-info)] text-left flex items-start gap-3">
            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div><div className="font-semibold mb-1">AI Assessment</div><div>Severity: <strong>{result.urgency||'High'}</strong> · Confidence: <strong>{((result.urgency_score||0.8)*100).toFixed(0)}%</strong> · <em className="text-xs">Requires human verification</em></div></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1 justify-center">View My Reports <ArrowRight className="w-4 h-4"/></button>
            <button onClick={() => { setResult(null); setStep(0); setCategory(null); setDescription(''); setImages([]); setImgErrors([]); }} className="btn-secondary">New Report</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-md py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Report an Issue</h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">Step {step+1} of {STEPS.length} — {STEPS[step]}</p>
      </div>

      {/* Step indicator */}
      <div className="card-coffee p-4 mb-8">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`step-dot ${i < step ? 'completed' : i === step ? 'active' : 'pending'}`}>{i < step ? <CheckCircle2 className="w-3.5 h-3.5"/> : i+1}</div>
                <span className={`text-[9px] font-semibold hidden sm:block whitespace-nowrap ${i===step?'text-[var(--accent-primary)]':i<step?'text-[var(--status-success)]':'text-[var(--text-tertiary)]'}`}>{s}</span>
              </div>
              {i < STEPS.length-1 && <div className={`step-line ${i < step ? 'completed' : ''}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── STEP 0: CATEGORY ── */}
      {step===0 && (
        <div className="space-y-6 page-enter">
          <div><h2 className="text-title text-[var(--text-primary)]">Choose a Category</h2><p className="text-sm text-[var(--text-secondary)] mt-1">Select the type of infrastructure issue</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" role="radiogroup">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSel = category === cat.id;
              return (
                <button key={cat.id} role="radio" aria-checked={isSel} onClick={() => setCategory(cat.id)}
                  className={`category-card flex flex-col items-center gap-3 cursor-pointer ${isSel ? 'selected' : ''}`}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: isSel ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)' }}>
                    <Icon className="w-6 h-6" style={{ color: isSel ? '#FFFFFF' : cat.color }} />
                  </div>
                  <div>
                    <div className={`text-sm font-bold leading-tight ${isSel ? 'text-white' : 'text-[var(--text-primary)]'}`}>{cat.label}</div>
                    <div className={`text-[10px] mt-1 leading-snug ${isSel ? 'text-white/70' : 'text-[var(--text-tertiary)]'}`}>{cat.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 1: DESCRIPTION ── */}
      {step===1 && (
        <div className="space-y-6 page-enter">
          <div><h2 className="text-title text-[var(--text-primary)]">Describe the Problem</h2><p className="text-sm text-[var(--text-secondary)] mt-1">Be specific — location, severity, how many people affected</p></div>
          {category && (() => {
            const catObj = CATEGORIES.find(c=>c.id===category);
            const Icon = catObj?.icon || FileText;
            return (
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-[var(--accent-primary)]" />
                <span className="font-semibold text-sm text-[var(--text-primary)]">{catObj?.label}</span>
                <button onClick={() => setStep(0)} className="ml-2 text-xs text-[var(--accent-primary)] underline cursor-pointer">change</button>
              </div>
            );
          })()}
          <div>
            <label htmlFor="description" className="form-label">Description <span className="text-[var(--status-danger)]">*</span></label>
            <textarea id="description" rows={8} value={description} onChange={e=>setDescription(e.target.value)}
              placeholder="Describe the infrastructure problem in detail. Include the specific location, how long it has existed, and how it affects the community..."
              className="form-input resize-y" style={{minHeight:'160px', lineHeight:'1.7'}} />
            <div className="flex justify-between mt-2">
              <span className={`text-xs ${description.length<20&&description.length>0?'text-[var(--status-danger)]':'text-[var(--text-tertiary)]'}`}>
                {description.length<20&&description.length>0?'Minimum 20 characters required':'AI will auto-classify category and severity'}
              </span>
              <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{description.length} chars</span>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: EVIDENCE ── */}
      {step===2 && (
        <div className="space-y-6 page-enter">
          <div><h2 className="text-title text-[var(--text-primary)]">Upload Evidence Photos</h2><p className="text-sm text-[var(--text-secondary)] mt-1">Add photos that clearly show the problem. Up to {MAX_IMAGES} images.</p></div>
          <div
            className={`drop-zone ${dragOver?'drag-over':''}`}
            onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);addImages(e.dataTransfer.files)}}
            onClick={()=>fileRef.current?.click()} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&fileRef.current?.click()}>
            <input ref={fileRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={e=>{if(e.target.files?.length)addImages(e.target.files)}} className="sr-only" />
            <Upload className="w-10 h-10 text-[var(--accent-tertiary)] mx-auto mb-3" />
            <div className="font-semibold text-sm text-[var(--text-primary)]">Drag & drop images here</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">or click to browse files</div>
            <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs text-[var(--text-tertiary)]">
              <span className="px-2 py-1 rounded-full bg-[var(--bg-secondary)]">JPG, PNG, WEBP</span>
              <span className="px-2 py-1 rounded-full bg-[var(--bg-secondary)]">Max 10MB each</span>
              <span className="px-2 py-1 rounded-full bg-[var(--bg-secondary)]">Up to {MAX_IMAGES} photos</span>
            </div>
          </div>

          {/* Mobile camera buttons */}
          <div className="flex gap-3 sm:hidden">
            <button onClick={()=>fileRef.current?.click()} className="btn-secondary flex-1 text-sm"><Camera className="w-4 h-4"/>Take Photo</button>
            <button onClick={()=>fileRef.current?.click()} className="btn-secondary flex-1 text-sm"><Image className="w-4 h-4"/>Gallery</button>
          </div>

          {imgErrors.length > 0 && (
            <div className="space-y-2">
              {imgErrors.map((e,i)=>(
                <div key={i} className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-xs text-[var(--status-danger)]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/>{e}
                  <button onClick={()=>setImgErrors(p=>p.filter((_,j)=>j!==i))} className="ml-auto cursor-pointer"><X className="w-3.5 h-3.5"/></button>
                </div>
              ))}
            </div>
          )}

          {images.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Uploaded Evidence</span>
                <span className="text-xs text-[var(--text-tertiary)]">{images.length}/{MAX_IMAGES} photos</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {images.map((img, i) => (
                  <div key={img.id} className="evidence-thumbnail" onClick={()=>setLightbox(i)}>
                    <img src={img.preview} alt={`Evidence ${i+1}`} />
                    <button className="evidence-remove-btn" onClick={e=>{e.stopPropagation();removeImage(img.id)}} aria-label="Remove"><X className="w-3.5 h-3.5"/></button>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded-[var(--radius-md)]">
                      <ZoomIn className="w-5 h-5 text-white"/>
                    </div>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button onClick={()=>fileRef.current?.click()} className="aspect-square flex items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border-warm)] hover:border-[var(--accent-tertiary)] transition-colors cursor-pointer">
                    <Plus className="w-6 h-6 text-[var(--text-tertiary)]"/>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: LOCATION ── */}
      {step===3 && (
        <div className="space-y-6 page-enter">
          <div><h2 className="text-title text-[var(--text-primary)]">Your Location</h2><p className="text-sm text-[var(--text-secondary)] mt-1">Accurate location helps route your report to the right department</p></div>
          <div className="card-coffee p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${location.detected?'bg-[var(--status-success-bg)]':'bg-[var(--bg-secondary)]'}`}>
                  <MapPin className={`w-5 h-5 ${location.detected?'text-[var(--status-success)]':'text-[var(--text-tertiary)]'}`}/>
                </div>
                <div>
                  <div className="font-semibold text-sm text-[var(--text-primary)]">{location.detecting?'Detecting...':location.detected?'Location detected':'Location'}</div>
                  {location.name && <div className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">{location.name}</div>}
                </div>
              </div>
              <button onClick={detectLoc} disabled={location.detecting} className="btn-secondary text-xs">
                {location.detecting?<><Loader2 className="w-3.5 h-3.5 animate-spin"/>Detecting...</>:<><MapPin className="w-3.5 h-3.5"/>Use My Location</>}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl text-xs">
              <div><div className="text-[var(--text-tertiary)] mb-1">Latitude</div><div className="font-mono font-bold text-[var(--text-primary)]">{location.lat}° N</div></div>
              <div><div className="text-[var(--text-tertiary)] mb-1">Longitude</div><div className="font-mono font-bold text-[var(--text-primary)]">{location.lng}° E</div></div>
            </div>
            <div>
              <label className="form-label">Location Name / Landmark</label>
              <input type="text" value={location.name} onChange={e=>setLocation(p=>({...p,name:e.target.value}))} placeholder="e.g. Near Gandhi Circle, MG Road, Bengaluru" className="form-input"/>
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--text-tertiary)] mb-2 uppercase tracking-wide">Quick Select</div>
              <div className="flex flex-wrap gap-2">
                {[['Bengaluru',12.9716,77.5946,'Bengaluru, Karnataka'],['Mumbai',19.076,72.8777,'Mumbai, Maharashtra'],['Delhi',28.6139,77.2090,'New Delhi'],['Chennai',13.0827,80.2707,'Chennai, Tamil Nadu'],['Hyderabad',17.385,78.4867,'Hyderabad, Telangana']].map(([name,lat,lng,loc])=>(
                  <button key={name} onClick={()=>setLocation({lat,lng,name:loc,detecting:false,detected:true})}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${location.name===loc?'bg-[var(--accent-primary)] text-white':'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-warm)]'}`}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: REVIEW ── */}
      {step===4 && (
        <div className="space-y-6 page-enter">
          <div><h2 className="text-title text-[var(--text-primary)]">Review Your Report</h2><p className="text-sm text-[var(--text-secondary)] mt-1">Please review before submitting</p></div>
          <div className="card-coffee divide-y divide-[var(--border-warm)]">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const catObj = CATEGORIES.find(c=>c.id===category);
                  const Icon = catObj?.icon || FileText;
                  return (
                    <div className="w-9 h-9 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-warm)] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                  );
                })()}
                <div>
                  <div className="text-xs text-[var(--text-tertiary)]">Category</div>
                  <div className="font-semibold text-sm text-[var(--text-primary)]">{CATEGORIES.find(c=>c.id===category)?.label}</div>
                </div>
              </div>
              <button onClick={()=>setStep(0)} className="text-xs text-[var(--accent-primary)] underline cursor-pointer">Edit</button>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2"><div className="text-xs text-[var(--text-tertiary)]">Description</div><button onClick={()=>setStep(1)} className="text-xs text-[var(--accent-primary)] underline cursor-pointer">Edit</button></div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">{description}</p>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3"><div className="text-xs text-[var(--text-tertiary)]">Evidence ({images.length} photos)</div><button onClick={()=>setStep(2)} className="text-xs text-[var(--accent-primary)] underline cursor-pointer">Edit</button></div>
              {images.length>0 ? (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img,i)=>(
                    <div key={img.id} className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer" onClick={()=>setLightbox(i)}>
                      <img src={img.preview} alt={`Evidence ${i+1}`} className="w-full h-full object-cover"/>
                    </div>
                  ))}
                </div>
              ):<div className="text-sm text-[var(--text-tertiary)]">No photos — you can still submit without images</div>}
            </div>
            <div className="p-5 flex items-center justify-between">
              <div><div className="text-xs text-[var(--text-tertiary)]">Location</div><div className="font-semibold text-sm text-[var(--text-primary)] mt-0.5">{location.name||'Not specified'}</div><div className="text-xs font-mono text-[var(--text-tertiary)] mt-0.5">{location.lat}°N, {location.lng}°E</div></div>
              <button onClick={()=>setStep(3)} className="text-xs text-[var(--accent-primary)] underline cursor-pointer">Edit</button>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--status-info-bg)] border border-[var(--status-info-border)] text-sm text-[var(--status-info)] flex items-start gap-3">
            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0"/>
            <div><div className="font-semibold">AI Assessment Note</div><div className="text-xs mt-0.5 opacity-80">Your report will be automatically classified and severity-scored. All AI assessments are clearly labelled and require government officer verification before any action.</div></div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-warm)]">
        <button onClick={()=>setStep(p=>Math.max(0,p-1))} disabled={step===0} className={`btn-secondary ${step===0?'opacity-0 pointer-events-none':''}`}>
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        {step < STEPS.length-1 ? (
          <button onClick={()=>setStep(p=>p+1)} disabled={!canProceed()} className="btn-primary">
            Next <ArrowRight className="w-4 h-4"/>
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary btn-primary-lg">
            {submitting ? <><Loader2 className="w-5 h-5 animate-spin"/>Submitting...</> : <><CheckCircle2 className="w-5 h-5"/>Submit Report</>}
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && images.length > 0 && <Lightbox images={images} index={lightbox} onClose={()=>setLightbox(null)}/>}
    </div>
  );
}
