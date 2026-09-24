import os
import math
import random
from typing import Dict, Any, Tuple
from .multilingual_nlp import detect_language, translate_to_english, classify_infrastructure_category, evaluate_urgency, extract_entities, LANGUAGE_MAP
from ..models.schemas import CitizenRequestResponse, SubmissionChannel, CountryCode, InfrastructureCategory, UrgencyLevel

# Predefined realistic multilingual voice transcripts for BRICS demonstration samples
VOICE_PRESET_SAMPLES = [
    {
        "language": "kn",
        "audio_name": "karnataka_bengaluru_water_pot_holes.wav",
        "transcription": "ನಮ್ಮ ಬೆಂಗಳೂರು ಮತ್ತು ಕರ್ನಾಟಕ ಪ್ರದೇಶದಲ್ಲಿ ಕಾವೇರಿ ನೀರು ಪೂರೈಕೆ ಸ್ಥಗಿತಗೊಂಡಿದೆ ಮತ್ತು ರಸ್ತೆಗಳಲ್ಲಿ ದೊಡ್ಡ ಹೊಂಡಗಳಿವೆ. (Cauvery water supply blocked & severe road potholes across Bengaluru, Karnataka).",
        "country_code": "IND",
        "location": "Bengaluru / Karnataka",
        "state": "Karnataka",
        "lat": 12.9716,
        "lng": 77.5946
    },
    {
        "language": "hi",
        "audio_name": "hindi_water_pipeline_crisis.wav",
        "transcription": "हमारे ब्लॉक 4 में पीने के पानी की मुख्य पाइपलाइन टूट गई है, 500 घरों में 4 दिन से पानी नहीं आ रहा है, कृपया तत्काल ठीक कराएं।",
        "country_code": "IND",
        "location": "Varanasi District",
        "state": "Uttar Pradesh",
        "lat": 25.3176,
        "lng": 82.9739
    },
    {
        "language": "pt",
        "audio_name": "brazil_road_bridge_collapse.wav",
        "transcription": "A ponte de madeira que liga o distrito rural à cidade caiu com a chuva forte. As crianças não conseguem ir para a escola e o transporte está cortado.",
        "country_code": "BRA",
        "location": "Santaluz Municipality",
        "state": "Bahia",
        "lat": -11.2542,
        "lng": -39.3756
    },
    {
        "language": "zh",
        "audio_name": "china_transformer_outage.wav",
        "transcription": "村庄供电变压器老化跳闸严重，连续三天低电压，农田灌溉水泵无法运转，急需电网升级改造。",
        "country_code": "CHN",
        "location": "Zibo Rural Area",
        "state": "Shandong",
        "lat": 36.8135,
        "lng": 118.0548
    },
    {
        "language": "ru",
        "audio_name": "russia_district_hospital_heating.wav",
        "transcription": "В поселковой больнице сломалась котельная и отсутствует стабильное отопление, пациентам холодно, требуется срочный ремонт теплотрассы.",
        "country_code": "RUS",
        "location": "Novgorod Settlement",
        "state": "Novgorod Oblast",
        "lat": 58.5215,
        "lng": 31.2755
    },
    {
        "language": "zu",
        "audio_name": "south_africa_clinic_water.wav",
        "transcription": "Amanzi awaphumi kompompi emtholampilo waseKhayelitsha, abahlengikazi abakwazi ukusiza iziguli ngaphandle kwamanzi ahlanzekile.",
        "country_code": "ZAF",
        "location": "Khayelitsha Sub-district",
        "state": "Western Cape",
        "lat": -34.0378,
        "lng": 18.6792
    },
    {
        "language": "en",
        "audio_name": "india_solar_microgrid.wav",
        "transcription": "The local primary healthcare center faces 8 hours daily power cuts, threatening cold chain storage for life-saving pediatric vaccines. Urgent microgrid installation required.",
        "country_code": "IND",
        "location": "Gadchiroli District",
        "state": "Maharashtra",
        "lat": 20.1809,
        "lng": 79.9950
    }
]

def process_voice_audio(audio_bytes: bytes, filename: str, country_code: str = "IND") -> Tuple[str, str, float, Dict[str, Any]]:
    """
    Process incoming citizen voice audio stream.
    Emulates high-precision acoustic speech-to-text pipeline (Whisper/Wav2Vec) with language identification.
    """
    # Check if this matches or maps to a preset demo or generate synthetic transcription
    selected_sample = None
    for sample in VOICE_PRESET_SAMPLES:
        if sample["country_code"] == country_code:
            selected_sample = sample
            break
            
    if not selected_sample:
        selected_sample = random.choice(VOICE_PRESET_SAMPLES)
        
    transcription = selected_sample["transcription"]
    lang_code, lang_name = detect_language(transcription)
    confidence = round(random.uniform(0.92, 0.98), 3)
    
    metadata = {
        "audio_duration_seconds": round(random.uniform(4.5, 12.0), 1),
        "sampling_rate_hz": 16000,
        "acoustic_snr_db": round(random.uniform(18.5, 26.0), 1),
        "location_metadata": {
            "location_name": selected_sample["location"],
            "state_province": selected_sample["state"],
            "latitude": selected_sample["lat"],
            "longitude": selected_sample["lng"]
        }
    }
    
    return transcription, lang_code, confidence, metadata

def get_voice_demo_samples():
    """Return catalog of multilingual voice presets for frontend one-click testing."""
    return VOICE_PRESET_SAMPLES
