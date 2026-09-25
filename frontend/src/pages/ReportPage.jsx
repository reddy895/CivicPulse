import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  FileText, Image, MapPin, CheckCircle2, ArrowRight, ArrowLeft,
  X, Plus, ZoomIn, ChevronLeft, ChevronRight, AlertCircle, Loader2,
  Sparkles, Clock, CheckCircle, Upload, Camera,
  Car, Droplets, Zap, HeartPulse, GraduationCap, Radio, Waves
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { submitCitizenRequest } from '../services/api';
import { toast } from '../components/ui/Toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const CATEGORIES = [
  { id: 'Roads & Public Transport', icon: Car, key: 'roads', color: '#D4A373', bg: '#FDF8F2' },
  { id: 'Water & Sanitation', icon: Droplets, key: 'water', color: '#5A7D9A', bg: '#F0F4F8' },
  { id: 'Clean Energy & Grid', icon: Zap, key: 'electricity', color: '#C78D3F', bg: '#FDF6E7' },
  { id: 'Healthcare & Clinics', icon: HeartPulse, key: 'healthcare', color: '#B54A4A', bg: '#FDF2F2' },
  { id: 'Education & Schools', icon: GraduationCap, key: 'education', color: '#5A8F6E', bg: '#F0F6F2' },
  { id: 'Digital Public Infrastructure', icon: Radio, key: 'digital', color: '#7B68EE', bg: '#F4F3FF' },
  { id: 'Flood & Climate Resilience', icon: Waves, key: 'flood', color: '#2C7FB8', bg: '#EBF4FC' },
];

const STEPS = ['step_category', 'step_description', 'step_evidence', 'step_location', 'step_review'];
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Validate image by magic bytes using ArrayBuffer
async function validateImageFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Image must be smaller than 10 MB (${(file.size / 1024 / 1024).toFixed(1)} MB)` };
  }
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type "${file.type}" is not supported. Use JPG, PNG, or WEBP.` };
  }
  // Read magic bytes
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
  const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
                 bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  if (!isJpeg && !isPng && !isWebp) {
    return { valid: false, error: 'Invalid image file. The file does not appear to be a valid image.' };
  }
  return { valid: true, error: null };
}

// Image Lightbox
function ImageLightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const total = images.length;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrent(v => (v - 1 + total) % total);
      if (e.key === 'ArrowRight') setCurrent(v => (v + 1) % total);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [total, onClose]);

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Evidence viewer"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer z-10"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/10 rounded-full text-white text-sm font-medium">
        Evidence {current + 1} / {total}
      </div>

      {total > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); setCurrent(v => (v - 1 + total) % total); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setCurrent(v => (v + 1) % total); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <img
        src={images[current].preview}
        alt={`Evidence ${current + 1}`}
        className="lightbox-image"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// Step Header
function StepHeader({ steps, currentStep, t }) {
  return (
    <div className="flex items-center gap-0" role="list" aria-label="Progress steps">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center gap-1.5" role="listitem">
            <div className={`step-dot ${
              i < currentStep ? 'completed' : i === currentStep ? 'active' : 'pending'
            }`} aria-current={i === currentStep ? 'step' : undefined}>
              {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] font-semibold whitespace-nowrap hidden sm:block ${
              i === currentStep ? 'text-[var(--accent-primary)]' : 
              i < currentStep ? 'text-[var(--status-success)]' : 'text-[var(--text-tertiary)]'
            }`}>{t(`report.${step}`)}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`step-line ${i < currentStep ? 'completed' : ''}`} aria-hidden="true" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ReportPage({ onNavigate }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]); // [{file, preview, id, error, uploading}]
  const [imageErrors, setImageErrors] = useState([]);
  const [lightbox, setLightbox] = useState(null); // {index}
  const [location, setLocation] = useState({
    latitude: 12.9716,
    longitude: 77.5946,
    locationName: '',
    detecting: false,
    detected: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null); // result
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const descRef = useRef(null);

  // Detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  function detectLocation() {
    setLocation(prev => ({ ...prev, detecting: true }));
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, detecting: false, locationName: user?.district || 'Location unavailable' }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: parseFloat(pos.coords.latitude.toFixed(5)),
          longitude: parseFloat(pos.coords.longitude.toFixed(5)),
          locationName: user?.district || `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`,
          detecting: false,
          detected: true,
        });
      },
      () => {
        setLocation({
          latitude: 12.9716,
          longitude: 77.5946,
          locationName: user?.district || 'Bengaluru, Karnataka',
          detecting: false,
          detected: false,
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  const addImages = useCallback(async (files) => {
    const newErrors = [];
    const toAdd = [];

    for (const file of Array.from(files)) {
      if (images.length + toAdd.length >= MAX_IMAGES) {
        newErrors.push(t('report.max_images_reached'));
        break;
      }
      const { valid, error } = await validateImageFile(file);
      if (!valid) {
        newErrors.push(`${file.name}: ${error}`);
        continue;
      }
      const preview = URL.createObjectURL(file);
      toAdd.push({ file, preview, id: `img_${Date.now()}_${Math.random().toString(36).slice(2)}`, uploading: false, error: null });
    }

    if (toAdd.length > 0) setImages(prev => [...prev, ...toAdd]);
    if (newErrors.length > 0) setImageErrors(newErrors);
  }, [images.length, t]);

  const removeImage = (id) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    addImages(e.dataTransfer.files);
  }, [addImages]);

  const handleFileInput = (e) => {
    if (e.target.files?.length) addImages(e.target.files);
  };

  const canProceed = () => {
    if (step === 0) return !!category;
    if (step === 1) return description.trim().length >= 20;
    if (step === 2) return true; // evidence optional
    if (step === 3) return !!location.locationName;
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const cCode = user?.country_code || 'IND';
    const catData = CATEGORIES.find(c => c.id === category);

    try {
      // Submit complaint
      const result = await submitCitizenRequest({
        text: description,
        channel: 'web',
        country_code: cCode,
        location_name: location.locationName,
        latitude: location.latitude,
        longitude: location.longitude,
        citizen_name: user?.name || 'Citizen',
        submitter_id: user?.id,
        category: category,
      });

      // Upload evidence images
      const uploadResults = [];
      for (const img of images) {
        try {
          const formData = new FormData();
          formData.append('file', img.file);
          const uploadRes = await fetch(`${API_BASE}/complaints/${result.id}/evidence`, {
            method: 'POST',
            body: formData,
          });
          if (uploadRes.ok) {
            uploadResults.push(await uploadRes.json());
          }
        } catch (err) {
          console.warn('Evidence upload failed for', img.file.name, err);
        }
      }

      setSubmitted({ ...result, evidenceUploaded: uploadResults.length, totalImages: images.length });
      toast.success(t('report.success_title'));
    } catch (err) {
      toast.error(t('common.submit_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (submitted) {
    const cpId = `CP-${new Date().getFullYear()}-${submitted.id?.slice(-6)?.toUpperCase() || Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
    return (
      <div className="container-md py-16">
        <div className="card-coffee p-10 text-center space-y-8 max-w-xl mx-auto page-enter">
          <div className="w-20 h-20 rounded-full bg-[var(--status-success-bg)] border-4 border-[var(--status-success)] flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-[var(--status-success)]" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{t('report.success_title')}</h1>
            <p className="text-[var(--text-secondary)] mt-2">{t('report.success_desc')}</p>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 space-y-4 text-sm text-left">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-tertiary)]">{t('myReports.complaint_id')}</span>
              <span className="font-mono font-bold text-[var(--accent-primary)]">{cpId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-tertiary)]">Status</span>
              <span className="badge-pill badge-pill-info">● {t('status.submitted')}</span>
            </div>
            {submitted.evidenceUploaded > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-tertiary)]">Evidence</span>
                <span className="font-semibold text-[var(--text-primary)]">{submitted.evidenceUploaded} Photos</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-tertiary)]">Location</span>
              <span className="font-semibold text-[var(--text-primary)] truncate max-w-[200px]">{location.locationName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-tertiary)]">AI Category</span>
              <span className="font-semibold text-[var(--text-primary)]">{submitted.category || category}</span>
            </div>
          </div>

          <div className="pt-2 p-4 rounded-xl bg-[var(--status-info-bg)] border border-[var(--status-info-border)] text-sm text-[var(--status-info)] text-left flex items-start gap-3">
            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold mb-1">AI Assessment</div>
              <div>Severity: <strong>{submitted.urgency || 'High'}</strong> · Score: <strong>{((submitted.urgency_score || 0.8) * 100).toFixed(0)}%</strong></div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('citizen')}
              className="btn-primary flex-1"
            >
              {t('report.track_complaint')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSubmitted(null); setStep(0); setCategory(null);
                setDescription(''); setImages([]); setImageErrors([]);
              }}
              className="btn-secondary"
            >
              New Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-md py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">{t('report.title')}</h1>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">Submit your infrastructure report with evidence</p>
      </div>

      {/* Step Indicator */}
      <div className="card-coffee p-5 mb-8">
        <StepHeader steps={STEPS} currentStep={step} t={t} />
      </div>

      {/* ---- STEP 0: CATEGORY ---- */}
      {step === 0 && (
        <div className="space-y-6 page-enter">
          <div>
            <h2 className="text-title text-[var(--text-primary)]">{t('report.choose_category')}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{t('report.choose_category_desc')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" role="radiogroup" aria-label="Infrastructure category">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSel = category === cat.id;
              return (
                <button
                  key={cat.id}
                  role="radio"
                  aria-checked={isSel}
                  onClick={() => setCategory(cat.id)}
                  className={`category-card flex flex-col items-center gap-3 cursor-pointer ${isSel ? 'selected' : ''}`}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: isSel ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)' }}>
                    <Icon className="w-6 h-6" style={{ color: isSel ? '#FFFFFF' : cat.color }} />
                  </div>
                  <div>
                    <div className={`text-sm font-bold leading-tight ${isSel ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                      {t(`categories.${cat.key}`)}
                    </div>
                    <div className={`text-xs mt-1 leading-snug ${isSel ? 'text-white/70' : 'text-[var(--text-tertiary)]'}`}>
                      {t(`categories.${cat.key}_desc`)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- STEP 1: DESCRIPTION ---- */}
      {step === 1 && (
        <div className="space-y-6 page-enter">
          <div>
            <h2 className="text-title text-[var(--text-primary)]">{t('report.description_label')}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Be specific about the location, severity, and how many people are affected.</p>
          </div>

          {category && (() => {
            const catObj = CATEGORIES.find(c => c.id === category);
            const Icon = catObj?.icon || FileText;
            return (
              <div className="flex items-center gap-2 text-sm">
                <Icon className="w-5 h-5 text-[var(--accent-primary)]" />
                <span className="font-semibold text-[var(--text-primary)]">{t(`categories.${catObj?.key}`)}</span>
                <button onClick={() => setStep(0)} className="ml-2 text-xs text-[var(--accent-primary)] underline cursor-pointer">
                  {t('report.edit')}
                </button>
              </div>
            );
          })()}

          <div>
            <label htmlFor="description" className="form-label">
              {t('report.description_label')} <span className="text-[var(--status-danger)]">*</span>
            </label>
            <textarea
              id="description"
              ref={descRef}
              rows={7}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('report.description_placeholder')}
              className="form-input resize-y"
              style={{minHeight: '150px', lineHeight:'1.7'}}
              aria-describedby="desc-hint"
              aria-required="true"
            />
            <div className="flex items-center justify-between mt-2">
              <div id="desc-hint" className={`text-xs ${description.length < 20 && description.length > 0 ? 'text-[var(--status-danger)]' : 'text-[var(--text-tertiary)]'}`}>
                {description.length < 20 && description.length > 0 ? t('report.char_min') : 'AI will classify category and severity automatically'}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] tabular-nums">
                {description.length} {t('report.characters')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- STEP 2: EVIDENCE ---- */}
      {step === 2 && (
        <div className="space-y-6 page-enter">
          <div>
            <h2 className="text-title text-[var(--text-primary)]">{t('report.upload_evidence')}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{t('report.upload_desc')}</p>
          </div>

          {/* Upload Zone */}
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload evidence images"
            onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleFileInput}
              className="sr-only"
              aria-label="Upload files"
            />
            <Upload className="w-10 h-10 text-[var(--accent-tertiary)] mx-auto mb-3" aria-hidden="true" />
            <div className="font-semibold text-[var(--text-primary)] text-sm">{t('report.drag_drop')}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">{t('report.or_browse')}</div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-[var(--text-tertiary)]">
              <span className="px-2 py-1 rounded-full bg-[var(--bg-secondary)]">{t('report.supported_formats')}</span>
              <span className="px-2 py-1 rounded-full bg-[var(--bg-secondary)]">{t('report.max_size')}</span>
              <span className="px-2 py-1 rounded-full bg-[var(--bg-secondary)]">Max {MAX_IMAGES} images</span>
            </div>
          </div>

          {/* Mobile Camera Buttons */}
          <div className="flex gap-3 sm:hidden">
            <button
              onClick={() => { if (fileInputRef.current) { fileInputRef.current.capture = 'environment'; fileInputRef.current.click(); }}}
              className="btn-secondary flex-1"
            >
              <Camera className="w-4 h-4" />
              {t('report.take_photo')}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex-1"
            >
              <Image className="w-4 h-4" />
              {t('report.choose_gallery')}
            </button>
          </div>

          {/* Image validation errors */}
          {imageErrors.length > 0 && (
            <div className="space-y-2">
              {imageErrors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-xs text-[var(--status-danger)]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {err}
                  <button onClick={() => setImageErrors(prev => prev.filter((_, j) => j !== i))} className="ml-auto cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Image Grid */}
          {images.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-[var(--text-primary)]">Evidence</div>
                <div className="text-xs text-[var(--text-tertiary)]">{images.length} / {MAX_IMAGES} {t('report.max_images')}</div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {images.map((img, i) => (
                  <div key={img.id} className="evidence-thumbnail" onClick={() => setLightbox({ index: i })}>
                    <img src={img.preview} alt={`Evidence ${i + 1}`} />
                    <button
                      className="evidence-remove-btn"
                      onClick={e => { e.stopPropagation(); removeImage(img.id); }}
                      aria-label={`Remove image ${i + 1}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1.5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="text-white text-[9px] text-center flex items-center justify-center gap-1">
                        <ZoomIn className="w-3 h-3" /> View
                      </div>
                    </div>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="evidence-thumbnail flex items-center justify-center border-2 border-dashed border-[var(--border-warm)] rounded-[var(--radius-md)] hover:border-[var(--accent-tertiary)] transition-colors cursor-pointer aspect-square"
                    aria-label="Add more images"
                  >
                    <Plus className="w-6 h-6 text-[var(--text-tertiary)]" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- STEP 3: LOCATION ---- */}
      {step === 3 && (
        <div className="space-y-6 page-enter">
          <div>
            <h2 className="text-title text-[var(--text-primary)]">{t('report.location_title')}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Accurate location helps route your report to the right department.</p>
          </div>

          <div className="card-coffee p-6 space-y-5">
            {/* Auto-detect */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${location.detected ? 'bg-[var(--status-success-bg)]' : 'bg-[var(--bg-secondary)]'}`}>
                  <MapPin className={`w-5 h-5 ${location.detected ? 'text-[var(--status-success)]' : 'text-[var(--text-tertiary)]'}`} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[var(--text-primary)]">
                    {location.detecting ? t('report.location_detecting') : 
                     location.detected ? t('report.location_detected') : 'Location'}
                  </div>
                  {location.locationName && (
                    <div className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">{location.locationName}</div>
                  )}
                </div>
              </div>
              <button
                onClick={detectLocation}
                disabled={location.detecting}
                className="btn-secondary text-xs"
              >
                {location.detecting ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting...</>
                ) : (
                  <><MapPin className="w-3.5 h-3.5" /> {t('report.use_my_location')}</>
                )}
              </button>
            </div>

            {/* Coordinates display */}
            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[var(--text-tertiary)] mb-1">Latitude</div>
                  <div className="font-mono font-bold text-[var(--text-primary)]">{location.latitude}° N</div>
                </div>
                <div>
                  <div className="text-[var(--text-tertiary)] mb-1">Longitude</div>
                  <div className="font-mono font-bold text-[var(--text-primary)]">{location.longitude}° E</div>
                </div>
              </div>
            </div>

            {/* Manual name override */}
            <div>
              <label htmlFor="location-name" className="form-label">Location Name / Landmark</label>
              <input
                id="location-name"
                type="text"
                value={location.locationName}
                onChange={e => setLocation(prev => ({ ...prev, locationName: e.target.value }))}
                placeholder="e.g., Near Gandhi Circle, MG Road, Bengaluru"
                className="form-input"
              />
            </div>

            {/* Quick presets */}
            <div>
              <div className="text-xs font-semibold text-[var(--text-tertiary)] mb-2 uppercase tracking-wide">Quick Select</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, loc: 'Bengaluru, Karnataka' },
                  { name: 'Varanasi', lat: 25.3176, lng: 82.9739, loc: 'Varanasi, Uttar Pradesh' },
                  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, loc: 'Mumbai, Maharashtra' },
                  { name: 'Chennai', lat: 13.0827, lng: 80.2707, loc: 'Chennai, Tamil Nadu' },
                  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, loc: 'Hyderabad, Telangana' },
                ].map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => setLocation({ latitude: preset.lat, longitude: preset.lng, locationName: preset.loc, detecting: false, detected: true })}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      location.locationName.includes(preset.name)
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border-warm)]'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- STEP 4: REVIEW ---- */}
      {step === 4 && (
        <div className="space-y-6 page-enter">
          <div>
            <h2 className="text-title text-[var(--text-primary)]">{t('report.review_title')}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{t('report.review_desc')}</p>
          </div>

          <div className="card-coffee divide-y divide-[var(--border-warm)]">
            {/* Category */}
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const catObj = CATEGORIES.find(c => c.id === category);
                  const Icon = catObj?.icon || FileText;
                  return (
                    <div className="w-9 h-9 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-warm)] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                  );
                })()}
                <div>
                  <div className="text-xs text-[var(--text-tertiary)]">{t('report.step_category')}</div>
                  <div className="font-semibold text-sm text-[var(--text-primary)]">{t(`categories.${CATEGORIES.find(c => c.id === category)?.key}`)}</div>
                </div>
              </div>
              <button onClick={() => setStep(0)} className="text-xs text-[var(--accent-primary)] underline cursor-pointer">{t('report.edit')}</button>
            </div>

            {/* Description */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-[var(--text-tertiary)]">{t('report.step_description')}</div>
                <button onClick={() => setStep(1)} className="text-xs text-[var(--accent-primary)] underline cursor-pointer">{t('report.edit')}</button>
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">{description}</p>
            </div>

            {/* Evidence */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-[var(--text-tertiary)]">{t('report.step_evidence')}</div>
                <button onClick={() => setStep(2)} className="text-xs text-[var(--accent-primary)] underline cursor-pointer">{t('report.edit')}</button>
              </div>
              {images.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <div key={img.id} className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer" onClick={() => setLightbox({ index: i })}>
                      <img src={img.preview} alt={`Evidence ${i+1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="text-xs text-[var(--text-tertiary)] self-end">{images.length} photo{images.length !== 1 ? 's' : ''}</div>
                </div>
              ) : (
                <div className="text-sm text-[var(--text-tertiary)]">No photos added</div>
              )}
            </div>

            {/* Location */}
            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-[var(--text-tertiary)]">{t('report.step_location')}</div>
                <div className="font-semibold text-sm text-[var(--text-primary)] mt-0.5">{location.locationName || '—'}</div>
                <div className="text-xs font-mono text-[var(--text-tertiary)] mt-0.5">{location.latitude}° N, {location.longitude}° E</div>
              </div>
              <button onClick={() => setStep(3)} className="text-xs text-[var(--accent-primary)] underline cursor-pointer">{t('report.edit')}</button>
            </div>
          </div>

          {/* AI note */}
          <div className="p-4 rounded-xl bg-[var(--status-info-bg)] border border-[var(--status-info-border)] text-sm text-[var(--status-info)] flex items-start gap-3">
            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <div className="font-semibold">{t('ai.assessment')}</div>
              <div className="text-xs mt-0.5 text-[var(--status-info)]/80">Your report will be automatically classified and severity-scored by AI. Government officers will also see this assessment with a verification note.</div>
            </div>
          </div>
        </div>
      )}

      {/* ---- NAVIGATION BUTTONS ---- */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-warm)]">
        <button
          onClick={() => setStep(v => Math.max(0, v - 1))}
          disabled={step === 0}
          className={`btn-secondary ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ArrowLeft className="w-4 h-4" />
          {t('report.back')}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(v => v + 1)}
            disabled={!canProceed()}
            className="btn-primary"
          >
            {t('report.next')}
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary btn-primary-lg"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {t('report.submitting')}</>
            ) : (
              <><CheckCircle2 className="w-5 h-5" /> {t('report.submit')}</>
            )}
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && images.length > 0 && (
        <ImageLightbox
          images={images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
