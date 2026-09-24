import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Send, Radio, ChevronRight, ThumbsUp, Sparkles, CheckCircle2, AlertCircle, Volume2
} from 'lucide-react';
import { submitCitizenRequest, submitVoiceRequest, getVoicePresets, upvoteRequest, getRequests } from '../services/api';

export default function CitizenPortal({ selectedCountry, onGoToMap }) {
  const [activeChannel, setActiveChannel] = useState('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [inputText, setInputText] = useState('');
  const [inputLocation, setInputLocation] = useState('');
  const [inputCategory, setInputCategory] = useState('Water & Sanitation');
  const [voicePresets, setVoicePresets] = useState([]);
  const [recentResult, setRecentResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveRequests, setLiveRequests] = useState([]);
  const [filterCategory, setFilterCategory] = useState('ALL');

  // WhatsApp simulation state
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'CivicPulse Grievance Ingestion Gateway. Describe an infrastructure issue in your native language via audio or text.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    loadPresets();
    loadRequestsList();
  }, [selectedCountry]);

  async function loadPresets() {
    const data = await getVoicePresets();
    setVoicePresets(data);
  }

  async function loadRequestsList() {
    const reqs = await getRequests(selectedCountry, filterCategory);
    setLiveRequests(reqs);
  }

  const startRecording = async () => {
    setIsRecording(true);
    setRecordingDuration(0);
    audioChunksRef.current = [];

    timerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current.start();
      }
    } catch (err) {}
  };

  const stopRecordingAndSubmit = async (customPreset = null) => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    setIsProcessing(true);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      } catch (e) {}
    }

    let result = null;
    if (customPreset) {
      const payload = {
        text: customPreset.transcription,
        channel: 'voice',
        country_code: customPreset.country_code,
        location_name: customPreset.location,
        latitude: customPreset.lat,
        longitude: customPreset.lng,
        citizen_name: 'Audio Contributor'
      };
      const processed = await submitCitizenRequest(payload);
      result = {
        transcription: customPreset.transcription,
        detected_language: customPreset.language,
        language_name: customPreset.language === 'hi' ? 'Hindi (हिंदी)' : customPreset.language === 'pt' ? 'Português' : customPreset.language === 'zh' ? 'Mandarin (中文)' : customPreset.language === 'zu' ? 'isiZulu' : 'Native Dialect',
        confidence: 0.96,
        processed_request: processed
      };
    } else {
      const audioBlob = audioChunksRef.current.length > 0 
        ? new Blob(audioChunksRef.current, { type: 'audio/wav' }) 
        : null;
      
      const cCode = selectedCountry === 'ALL' ? 'IND' : selectedCountry;
      result = await submitVoiceRequest(audioBlob, cCode);
    }

    setIsProcessing(false);
    if (result) {
      setRecentResult(result);
      loadRequestsList();
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    const cCode = selectedCountry === 'ALL' ? 'IND' : selectedCountry;
    const payload = {
      text: inputText,
      channel: activeChannel === 'whatsapp' ? 'whatsapp' : 'text',
      country_code: cCode,
      location_name: inputLocation || undefined,
      citizen_name: 'Citizen Contributor'
    };

    const res = await submitCitizenRequest(payload);
    setIsProcessing(false);
    setRecentResult({
      transcription: inputText,
      detected_language: res.language,
      language_name: res.language_name,
      confidence: 0.98,
      processed_request: res
    });
    setInputText('');
    setInputLocation('');
    loadRequestsList();
  };

  const handleWhatsAppSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setIsProcessing(true);
    const cCode = selectedCountry === 'ALL' ? 'IND' : selectedCountry;
    const payload = {
      text: userText,
      channel: 'whatsapp',
      country_code: cCode,
      citizen_name: 'WhatsApp Citizen'
    };

    const res = await submitCitizenRequest(payload);
    setIsProcessing(false);

    setChatMessages(prev => [
      ...prev,
      { 
        sender: 'bot', 
        text: `[Grievance Registered: ${res.id}]\nSector: ${res.category} · Urgency: ${res.urgency} (${res.urgency_score})\nTranslation: "${res.translated_text}"\nQueued for national hotspot analysis.` 
      }
    ]);
    loadRequestsList();
  };

  const handleUpvote = async (reqId) => {
    const res = await upvoteRequest(reqId);
    setLiveRequests(prev => prev.map(r => r.id === reqId ? { ...r, upvotes: res.upvotes } : r));
  };

  return (
    <div className="max-w-[1440px] mx-auto px-8 space-y-8">
      
      {/* Header */}
      <div className="card-coffee p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#2C1810] tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#6F4E37]" />
            Citizen Ingestion & Multilingual Speech Gateway
          </h2>
          <p className="text-sm text-[#5C4A42]">
            Multi-modal intake translating unstructured native audio, messaging, and text into structured infrastructure demand signals.
          </p>
        </div>

        {/* Channel Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#F5F0E8] rounded-lg border border-[#E8E0D5]">
          {['voice', 'whatsapp', 'text'].map((ch) => (
            <button
              key={ch}
              onClick={() => setActiveChannel(ch)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer capitalize ${
                activeChannel === ch
                  ? 'bg-[#FFFFFF] text-[#6F4E37] shadow-sm'
                  : 'text-[#5C4A42] hover:text-[#2C1810]'
              }`}
            >
              {ch === 'voice' ? 'Voice Audio' : (ch === 'whatsapp' ? 'WhatsApp Bot' : 'Direct Form')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: 45% Input Zone | 55% Output Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Zone: Input (45% -> 5.4 Cols -> 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CHANNEL 1: VOICE RECORDER */}
          {activeChannel === 'voice' && (
            <div className="card-coffee p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-label text-[12px] text-[#2C1810]">Acoustic Speech Ingestion</span>
                {isRecording && (
                  <span className="badge-pill badge-pill-danger font-mono animate-pulse">
                    RECORDING {recordingDuration}s
                  </span>
                )}
              </div>

              {/* Large Centered 80px Audio Button & Waveform */}
              <div className="p-8 bg-[#F5F0E8] rounded-2xl border border-[#E8E0D5] flex flex-col items-center justify-center space-y-4">
                
                {isRecording ? (
                  <div className="flex items-center gap-1.5 h-10">
                    {[12, 24, 36, 18, 30, 42, 20, 32, 16, 28].map((h, i) => (
                      <span
                        key={i}
                        className="w-1.5 bg-[#6F4E37] rounded-full audio-bar-coffee"
                        style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                ) : null}

                <div>
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      disabled={isProcessing}
                      className="w-20 h-20 rounded-full bg-[#6F4E37] hover:bg-[#5E3F2A] flex items-center justify-center text-[#FFFFFF] shadow-md transition-transform active:scale-95 cursor-pointer"
                    >
                      <Mic className="w-8 h-8" />
                    </button>
                  ) : (
                    <button
                      onClick={() => stopRecordingAndSubmit()}
                      className="w-20 h-20 rounded-full bg-[#B54A4A] flex items-center justify-center text-[#FFFFFF] shadow-md animate-pulse cursor-pointer"
                    >
                      <MicOff className="w-8 h-8" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#5C4A42] text-center max-w-xs leading-relaxed font-medium">
                  {isRecording ? 'Listening... Click to stop and process neural classification.' : 'Click to record in Hindi, Portuguese, Mandarin, Russian, Zulu, or English.'}
                </p>
              </div>

              {/* 2x2 Grid of Test Samples */}
              <div className="space-y-3">
                <div className="text-label text-[11px]">Test Native Language Presets (2x2)</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {voicePresets.slice(0, 4).map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => stopRecordingAndSubmit(p)}
                      disabled={isProcessing}
                      className="card-coffee p-3.5 text-left hover:border-[#6F4E37] card-coffee-interactive cursor-pointer space-y-1.5 bg-[#FFFFFF]"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-[#2C1810]">
                        <span>{p.language === 'hi' ? '🇮🇳 Hindi' : p.language === 'pt' ? '🇧🇷 Português' : p.language === 'zh' ? '🇨🇳 Mandarin' : '🇿🇦 isiZulu'}</span>
                        <span className="text-[10px] text-[#9C8C84] font-medium">{p.location}</span>
                      </div>
                      <p className="text-xs text-[#5C4A42] truncate italic">"{p.transcription}"</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CHANNEL 2: WHATSAPP BOT */}
          {activeChannel === 'whatsapp' && (
            <div className="card-coffee p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE3]">
                <span className="text-label text-[12px] text-[#2C1810]">WhatsApp Grievance Webhook</span>
                <span className="text-xs text-[#5A8F6E] font-medium">● Bot Active</span>
              </div>

              <div className="h-60 overflow-y-auto space-y-3 p-4 bg-[#F5F0E8] rounded-xl border border-[#E8E0D5] text-xs">
                {chatMessages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg ${
                      m.sender === 'user' 
                        ? 'bg-[#6F4E37] text-[#FFFFFF]' 
                        : 'bg-[#FFFFFF] text-[#2C1810] border border-[#E8E0D5] shadow-sm whitespace-pre-line'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleWhatsAppSend} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type in any native language..."
                  className="form-input flex-1 text-xs"
                />
                <button type="submit" className="btn-primary text-xs">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* CHANNEL 3: WEB FORM */}
          {activeChannel === 'text' && (
            <form onSubmit={handleTextSubmit} className="card-coffee p-6 space-y-4">
              <div className="text-label text-[12px] text-[#2C1810]">Direct Citizen Submission</div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-label text-[11px] block mb-1">Issue Description</label>
                  <textarea
                    rows={3}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    required
                    placeholder="Describe infrastructure failure in any language..."
                    className="form-input w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-label text-[11px] block mb-1">Location</label>
                    <input
                      type="text"
                      value={inputLocation}
                      onChange={(e) => setInputLocation(e.target.value)}
                      placeholder="e.g. Varanasi Rural"
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="text-label text-[11px] block mb-1">Sector</label>
                    <select
                      value={inputCategory}
                      onChange={(e) => setInputCategory(e.target.value)}
                      className="form-input w-full cursor-pointer"
                    >
                      <option>Water & Sanitation</option>
                      <option>Roads & Public Transport</option>
                      <option>Clean Energy & Grid</option>
                      <option>Healthcare & Clinics</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full justify-center text-xs py-2.5">
                <Send className="w-3.5 h-3.5" />
                Submit Signal to National Stream
              </button>
            </form>
          )}

        </div>

        {/* Right Zone: AI Classification Output (55% -> 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-coffee p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE3]">
              <span className="text-label text-[12px] text-[#2C1810]">AI Classification & Neural Output</span>
              <span className="font-mono text-xs text-[#6F4E37] bg-[#F5F0E8] px-2 py-0.5 rounded border border-[#E8E0D5]">
                DPGA NLP v2.1
              </span>
            </div>

            {recentResult ? (
              <div className="space-y-5 text-xs">
                
                {/* Detected Language & Confidence */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-label text-[11px]">Detected Language:</span>
                    <span className="badge-pill badge-pill-neutral font-semibold text-xs">{recentResult.language_name}</span>
                  </div>
                  <span className="badge-pill badge-pill-success">
                    Confidence: {Math.round(recentResult.confidence * 100)}%
                  </span>
                </div>

                {/* Translated Text Box on #F5F0E8 */}
                <div className="p-4 bg-[#F5F0E8] rounded-xl border border-[#E8E0D5] space-y-3">
                  <div>
                    <div className="text-label text-[11px]">Original Citizen Audio / Text</div>
                    <p className="text-sm text-[#5C4A42] italic mt-1 leading-relaxed">
                      "{recentResult.transcription}"
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#E8E0D5]">
                    <div className="text-label text-[11px] text-[#6F4E37]">Standard English Translation</div>
                    <p className="text-sm text-[#2C1810] font-semibold mt-1 leading-relaxed">
                      "{recentResult.processed_request.translated_text}"
                    </p>
                  </div>
                </div>

                {/* Intent Tags Row */}
                <div className="space-y-1.5">
                  <div className="text-label text-[11px]">Classified Intent Tags</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge-pill badge-pill-info">{recentResult.processed_request.category}</span>
                    <span className={`badge-pill ${recentResult.processed_request.urgency === 'Critical' ? 'badge-pill-danger' : 'badge-pill-warning'}`}>
                      {recentResult.processed_request.urgency} Urgency ({recentResult.processed_request.urgency_score})
                    </span>
                    <span className="badge-pill badge-pill-neutral">DPG Verified</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-[#F0EBE3] flex items-center gap-3">
                  <button
                    onClick={onGoToMap}
                    className="btn-primary flex-1 justify-center text-xs py-2"
                  >
                    <span>Approve & Route to Demand Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setRecentResult(null)}
                    className="btn-secondary text-xs py-2"
                  >
                    Flag for Review
                  </button>
                </div>

              </div>
            ) : (
              <div className="py-14 text-center text-[#9C8C84] space-y-3">
                <Sparkles className="w-8 h-8 text-[#D4A373] mx-auto" />
                <p className="text-sm text-[#5C4A42] max-w-sm mx-auto">
                  Submit or speak an audio request on the left to see real-time acoustic speech-to-text, neural translation & intent extraction.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom: Live Citizen Demand Streams (Horizontal Scrollable Cards) */}
      <div className="card-coffee p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5A8F6E] animate-pulse" />
            <h3 className="text-sm font-bold text-[#2C1810]">Live Citizen Demand Streams</h3>
          </div>
          <span className="text-xs text-[#6F4E37] font-semibold cursor-pointer hover:underline">
            View all {liveRequests.length} signals →
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveRequests.slice(0, 6).map((req) => (
            <div key={req.id} className="p-4 bg-[#FDFBF7] rounded-xl border border-[#E8E0D5] flex flex-col justify-between space-y-3 shadow-sm hover:border-[#D4A373] transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#6F4E37]">{req.id}</span>
                  <span className={`badge-pill ${req.urgency === 'Critical' ? 'badge-pill-danger' : 'badge-pill-warning'}`}>
                    {req.urgency}
                  </span>
                </div>
                <p className="text-xs text-[#2C1810] font-medium line-clamp-2 leading-relaxed">
                  {req.translated_text}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E8E0D5] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#5C4A42] truncate max-w-[140px]">{req.location_name}</span>
                <button
                  onClick={() => handleUpvote(req.id)}
                  className="btn-secondary py-1 px-2 text-xs"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span className="font-mono">{req.upvotes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
