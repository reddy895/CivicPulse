import uuid
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from ..models.schemas import (
    CountryCode, InfrastructureCategory, UrgencyLevel, SubmissionChannel,
    CitizenRequestResponse, CitizenRequestCreate
)
from .multilingual_nlp import detect_language, translate_to_english, classify_infrastructure_category, evaluate_urgency, extract_entities, LANGUAGE_MAP
from .disability_adapter import load_disability_records

# Regional Demographics & Infrastructure Deficit Baselines across BRICS
BRICS_REGIONS = [
    # INDIA
    {
        "id": "IND_UP_01",
        "country_code": "IND",
        "country_name": "India",
        "state_province": "Uttar Pradesh",
        "district": "Varanasi Rural",
        "center_lat": 25.3176,
        "center_lng": 82.9739,
        "population": 3676841,
        "poverty_rate_pct": 28.4,
        "vulnerability_index": 0.74,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.78,
            "Roads & Public Transport": 0.65,
            "Clean Energy & Grid": 0.52,
            "Healthcare & Clinics": 0.70,
            "Digital Public Infrastructure": 0.45,
            "Education & Schools": 0.58,
            "Flood & Climate Resilience": 0.68
        },
        "current_allocated_budget_usd_m": 14.5
    },
    {
        "id": "IND_MH_02",
        "country_code": "IND",
        "country_name": "India",
        "state_province": "Maharashtra",
        "district": "Gadchiroli Tribal Belt",
        "center_lat": 20.1809,
        "center_lng": 79.9950,
        "population": 1072942,
        "poverty_rate_pct": 34.8,
        "vulnerability_index": 0.86,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.72,
            "Roads & Public Transport": 0.84,
            "Clean Energy & Grid": 0.81,
            "Healthcare & Clinics": 0.89,
            "Digital Public Infrastructure": 0.88,
            "Education & Schools": 0.76,
            "Flood & Climate Resilience": 0.62
        },
        "current_allocated_budget_usd_m": 6.2
    },
    {
        "id": "IND_BR_03",
        "country_code": "IND",
        "country_name": "India",
        "state_province": "Bihar",
        "district": "Kishanganj Flood Basin",
        "center_lat": 26.0903,
        "center_lng": 87.9405,
        "population": 1690400,
        "poverty_rate_pct": 42.1,
        "vulnerability_index": 0.89,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.82,
            "Roads & Public Transport": 0.79,
            "Clean Energy & Grid": 0.68,
            "Healthcare & Clinics": 0.85,
            "Digital Public Infrastructure": 0.75,
            "Education & Schools": 0.81,
            "Flood & Climate Resilience": 0.94
        },
        "current_allocated_budget_usd_m": 8.0
    },
    {
        "id": "IND_RJ_04",
        "country_code": "IND",
        "country_name": "India",
        "state_province": "Rajasthan",
        "district": "Barmer Arid Zone",
        "center_lat": 25.7521,
        "center_lng": 71.3967,
        "population": 2603751,
        "poverty_rate_pct": 29.5,
        "vulnerability_index": 0.79,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.92,
            "Roads & Public Transport": 0.58,
            "Clean Energy & Grid": 0.44,
            "Healthcare & Clinics": 0.72,
            "Digital Public Infrastructure": 0.60,
            "Education & Schools": 0.64,
            "Flood & Climate Resilience": 0.35
        },
        "current_allocated_budget_usd_m": 12.0
    },
    {
        "id": "IND_KL_05",
        "country_code": "IND",
        "country_name": "India",
        "state_province": "Kerala",
        "district": "Wayanad Hill Region",
        "center_lat": 11.6854,
        "center_lng": 76.1320,
        "population": 817420,
        "poverty_rate_pct": 8.2,
        "vulnerability_index": 0.65,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.35,
            "Roads & Public Transport": 0.62,
            "Clean Energy & Grid": 0.28,
            "Healthcare & Clinics": 0.30,
            "Digital Public Infrastructure": 0.25,
            "Education & Schools": 0.22,
            "Flood & Climate Resilience": 0.91
        },
        "current_allocated_budget_usd_m": 18.5
    },
    {
        "id": "IND_KA_06",
        "country_code": "IND",
        "country_name": "India",
        "state_province": "Karnataka",
        "district": "Bengaluru Urban & Rural",
        "center_lat": 12.9716,
        "center_lng": 77.5946,
        "population": 11440000,
        "poverty_rate_pct": 14.2,
        "vulnerability_index": 0.62,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.75,
            "Roads & Public Transport": 0.88,
            "Clean Energy & Grid": 0.45,
            "Healthcare & Clinics": 0.50,
            "Digital Public Infrastructure": 0.32,
            "Education & Schools": 0.40,
            "Flood & Climate Resilience": 0.82
        },
        "current_allocated_budget_usd_m": 24.0
    },

    # BRAZIL
    {
        "id": "BRA_BA_01",
        "country_code": "BRA",
        "country_name": "Brazil",
        "state_province": "Bahia",
        "district": "Santaluz / Sertão Semiárido",
        "center_lat": -11.2542,
        "center_lng": -39.3756,
        "population": 645000,
        "poverty_rate_pct": 36.2,
        "vulnerability_index": 0.81,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.88,
            "Roads & Public Transport": 0.76,
            "Clean Energy & Grid": 0.45,
            "Healthcare & Clinics": 0.79,
            "Digital Public Infrastructure": 0.72,
            "Education & Schools": 0.68,
            "Flood & Climate Resilience": 0.60
        },
        "current_allocated_budget_usd_m": 7.5
    },
    {
        "id": "BRA_AM_02",
        "country_code": "BRA",
        "country_name": "Brazil",
        "state_province": "Amazonas",
        "district": "Tefé River Basin",
        "center_lat": -3.3533,
        "center_lng": -64.7114,
        "population": 210000,
        "poverty_rate_pct": 44.7,
        "vulnerability_index": 0.90,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.84,
            "Roads & Public Transport": 0.91,
            "Clean Energy & Grid": 0.85,
            "Healthcare & Clinics": 0.92,
            "Digital Public Infrastructure": 0.93,
            "Education & Schools": 0.82,
            "Flood & Climate Resilience": 0.88
        },
        "current_allocated_budget_usd_m": 4.2
    },
    {
        "id": "BRA_SP_03",
        "country_code": "BRA",
        "country_name": "Brazil",
        "state_province": "São Paulo",
        "district": "Vale do Ribeira",
        "center_lat": -24.4925,
        "center_lng": -47.8447,
        "population": 480000,
        "poverty_rate_pct": 24.1,
        "vulnerability_index": 0.68,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.55,
            "Roads & Public Transport": 0.71,
            "Clean Energy & Grid": 0.38,
            "Healthcare & Clinics": 0.62,
            "Digital Public Infrastructure": 0.48,
            "Education & Schools": 0.49,
            "Flood & Climate Resilience": 0.75
        },
        "current_allocated_budget_usd_m": 16.0
    },

    # SOUTH AFRICA
    {
        "id": "ZAF_EC_01",
        "country_code": "ZAF",
        "country_name": "South Africa",
        "state_province": "Eastern Cape",
        "district": "OR Tambo Rural District",
        "center_lat": -31.5898,
        "center_lng": 28.7844,
        "population": 1450000,
        "poverty_rate_pct": 49.3,
        "vulnerability_index": 0.92,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.93,
            "Roads & Public Transport": 0.87,
            "Clean Energy & Grid": 0.74,
            "Healthcare & Clinics": 0.88,
            "Digital Public Infrastructure": 0.81,
            "Education & Schools": 0.85,
            "Flood & Climate Resilience": 0.69
        },
        "current_allocated_budget_usd_m": 8.5
    },
    {
        "id": "ZAF_KZN_02",
        "country_code": "ZAF",
        "country_name": "South Africa",
        "state_province": "KwaZulu-Natal",
        "district": "uMkhanyakude Northern Belt",
        "center_lat": -27.6256,
        "center_lng": 32.1764,
        "population": 690000,
        "poverty_rate_pct": 45.1,
        "vulnerability_index": 0.88,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.91,
            "Roads & Public Transport": 0.78,
            "Clean Energy & Grid": 0.69,
            "Healthcare & Clinics": 0.82,
            "Digital Public Infrastructure": 0.77,
            "Education & Schools": 0.79,
            "Flood & Climate Resilience": 0.83
        },
        "current_allocated_budget_usd_m": 6.8
    },
    {
        "id": "ZAF_WC_03",
        "country_code": "ZAF",
        "country_name": "South Africa",
        "state_province": "Western Cape",
        "district": "Khayelitsha Urban Township",
        "center_lat": -34.0378,
        "center_lng": 18.6792,
        "population": 450000,
        "poverty_rate_pct": 32.0,
        "vulnerability_index": 0.73,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.75,
            "Roads & Public Transport": 0.60,
            "Clean Energy & Grid": 0.65,
            "Healthcare & Clinics": 0.70,
            "Digital Public Infrastructure": 0.40,
            "Education & Schools": 0.55,
            "Flood & Climate Resilience": 0.78
        },
        "current_allocated_budget_usd_m": 19.2
    },

    # CHINA
    {
        "id": "CHN_SC_01",
        "country_code": "CHN",
        "country_name": "China",
        "state_province": "Sichuan",
        "district": "Liangshan Mountain Area",
        "center_lat": 27.8938,
        "center_lng": 102.2673,
        "population": 4850000,
        "poverty_rate_pct": 14.5,
        "vulnerability_index": 0.72,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.52,
            "Roads & Public Transport": 0.78,
            "Clean Energy & Grid": 0.48,
            "Healthcare & Clinics": 0.65,
            "Digital Public Infrastructure": 0.54,
            "Education & Schools": 0.50,
            "Flood & Climate Resilience": 0.82
        },
        "current_allocated_budget_usd_m": 35.0
    },
    {
        "id": "CHN_GZ_02",
        "country_code": "CHN",
        "country_name": "China",
        "state_province": "Guizhou",
        "district": "Bijie Karst Mountain Belt",
        "center_lat": 27.3017,
        "center_lng": 105.2863,
        "population": 6800000,
        "poverty_rate_pct": 16.2,
        "vulnerability_index": 0.70,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.68,
            "Roads & Public Transport": 0.71,
            "Clean Energy & Grid": 0.42,
            "Healthcare & Clinics": 0.59,
            "Digital Public Infrastructure": 0.45,
            "Education & Schools": 0.52,
            "Flood & Climate Resilience": 0.65
        },
        "current_allocated_budget_usd_m": 42.0
    },

    # RUSSIA
    {
        "id": "RUS_NV_01",
        "country_code": "RUS",
        "country_name": "Russia",
        "state_province": "Novgorod Oblast",
        "district": "Staraya Russa District",
        "center_lat": 57.9904,
        "center_lng": 31.3571,
        "population": 43000,
        "poverty_rate_pct": 18.0,
        "vulnerability_index": 0.64,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.65,
            "Roads & Public Transport": 0.72,
            "Clean Energy & Grid": 0.69,
            "Healthcare & Clinics": 0.68,
            "Digital Public Infrastructure": 0.50,
            "Education & Schools": 0.45,
            "Flood & Climate Resilience": 0.55
        },
        "current_allocated_budget_usd_m": 11.5
    },
    {
        "id": "RUS_IR_02",
        "country_code": "RUS",
        "country_name": "Russia",
        "state_province": "Irkutsk Oblast",
        "district": "Tulun Flood Zone",
        "center_lat": 54.5614,
        "center_lng": 100.5792,
        "population": 39000,
        "poverty_rate_pct": 21.3,
        "vulnerability_index": 0.76,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.60,
            "Roads & Public Transport": 0.65,
            "Clean Energy & Grid": 0.58,
            "Healthcare & Clinics": 0.71,
            "Digital Public Infrastructure": 0.55,
            "Education & Schools": 0.50,
            "Flood & Climate Resilience": 0.92
        },
        "current_allocated_budget_usd_m": 9.0
    },

    # USA (Veterans & Disability Compensation Infrastructure Data)
    {
        "id": "USA_CA_01",
        "country_code": "USA",
        "country_name": "United States",
        "state_province": "California",
        "district": "San Diego County",
        "center_lat": 32.7157,
        "center_lng": -117.1611,
        "population": 3298634,
        "poverty_rate_pct": 11.2,
        "vulnerability_index": 0.78,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.32,
            "Roads & Public Transport": 0.76,
            "Clean Energy & Grid": 0.35,
            "Healthcare & Clinics": 0.88,
            "Digital Public Infrastructure": 0.42,
            "Education & Schools": 0.40,
            "Flood & Climate Resilience": 0.58
        },
        "current_allocated_budget_usd_m": 42.0
    },
    {
        "id": "USA_AZ_02",
        "country_code": "USA",
        "country_name": "United States",
        "state_province": "Arizona",
        "district": "Maricopa County",
        "center_lat": 33.4484,
        "center_lng": -112.0740,
        "population": 4420568,
        "poverty_rate_pct": 13.5,
        "vulnerability_index": 0.74,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.65,
            "Roads & Public Transport": 0.72,
            "Clean Energy & Grid": 0.48,
            "Healthcare & Clinics": 0.85,
            "Digital Public Infrastructure": 0.38,
            "Education & Schools": 0.46,
            "Flood & Climate Resilience": 0.60
        },
        "current_allocated_budget_usd_m": 38.5
    },
    {
        "id": "USA_TX_03",
        "country_code": "USA",
        "country_name": "United States",
        "state_province": "Texas",
        "district": "Bexar County",
        "center_lat": 29.4241,
        "center_lng": -98.4936,
        "population": 2009324,
        "poverty_rate_pct": 16.8,
        "vulnerability_index": 0.82,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.45,
            "Roads & Public Transport": 0.82,
            "Clean Energy & Grid": 0.55,
            "Healthcare & Clinics": 0.91,
            "Digital Public Infrastructure": 0.50,
            "Education & Schools": 0.52,
            "Flood & Climate Resilience": 0.68
        },
        "current_allocated_budget_usd_m": 29.0
    },
    {
        "id": "USA_NC_04",
        "country_code": "USA",
        "country_name": "United States",
        "state_province": "North Carolina",
        "district": "Cumberland County",
        "center_lat": 35.0527,
        "center_lng": -78.8784,
        "population": 334728,
        "poverty_rate_pct": 18.2,
        "vulnerability_index": 0.86,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.42,
            "Roads & Public Transport": 0.78,
            "Clean Energy & Grid": 0.40,
            "Healthcare & Clinics": 0.94,
            "Digital Public Infrastructure": 0.58,
            "Education & Schools": 0.62,
            "Flood & Climate Resilience": 0.72
        },
        "current_allocated_budget_usd_m": 18.5
    },
    {
        "id": "USA_TX_05",
        "country_code": "USA",
        "country_name": "United States",
        "state_province": "Texas",
        "district": "El Paso County",
        "center_lat": 31.7619,
        "center_lng": -106.4850,
        "population": 865657,
        "poverty_rate_pct": 19.5,
        "vulnerability_index": 0.84,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.62,
            "Roads & Public Transport": 0.80,
            "Clean Energy & Grid": 0.51,
            "Healthcare & Clinics": 0.89,
            "Digital Public Infrastructure": 0.54,
            "Education & Schools": 0.56,
            "Flood & Climate Resilience": 0.65
        },
        "current_allocated_budget_usd_m": 15.0
    },
    {
        "id": "USA_WA_06",
        "country_code": "USA",
        "country_name": "United States",
        "state_province": "Washington",
        "district": "Pierce County",
        "center_lat": 47.0676,
        "center_lng": -122.1295,
        "population": 921130,
        "poverty_rate_pct": 10.8,
        "vulnerability_index": 0.75,
        "infrastructure_deficits": {
            "Water & Sanitation": 0.35,
            "Roads & Public Transport": 0.74,
            "Clean Energy & Grid": 0.38,
            "Healthcare & Clinics": 0.84,
            "Digital Public Infrastructure": 0.40,
            "Education & Schools": 0.45,
            "Flood & Climate Resilience": 0.62
        },
        "current_allocated_budget_usd_m": 22.0
    }
]

# Seed Realistic Multilingual Citizen Complaints & Requests
RAW_SEED_COMPLAINTS = [
    # India - Hindi, Kannada & English
    {
        "text": "ನಮ್ಮ ಬೆಂಗಳೂರು ಮತ್ತು ಕರ್ನಾಟಕ ಪ್ರದೇಶದಲ್ಲಿ ಕಾವೇರಿ ನೀರು ಪೂರೈಕೆ ಸ್ಥಗಿತಗೊಂಡಿದೆ ಮತ್ತು ರಸ್ತೆಗಳಲ್ಲಿ ದೊಡ್ಡ ಹೊಂಡಗಳಿವೆ, ತುರ್ತು ದುರಸ್ತಿ ಬೇಕು.",
        "region_id": "IND_KA_06",
        "channel": SubmissionChannel.VOICE,
        "upvotes": 328
    },
    {
        "text": "Severe waterlogging, blocked stormwater drains and pothole hazards near Outer Ring Road & Bellandur tech corridor in Bengaluru, Karnataka.",
        "region_id": "IND_KA_06",
        "channel": SubmissionChannel.WHATSAPP,
        "upvotes": 412
    },
    {
        "text": "ಮೈಸೂರು ಗ್ರಾಮೀಣ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರದಲ್ಲಿ ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್ ಹಾಗೂ ಔಷಧಗಳ ಕೊರತೆ ಇದೆ.",
        "region_id": "IND_KA_06",
        "channel": SubmissionChannel.TEXT,
        "upvotes": 195
    },
    {
        "text": "ನಮ್ಮ ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಹೆದ್ದಾರಿ ನಿರ್ಮಾಣ ಅಪೂರ್ಣವಾಗಿದ್ದು ಅಪಘಾತಗಳು ಹೆಚ್ಚುತ್ತಿವೆ.",
        "region_id": "IND_KA_06",
        "channel": SubmissionChannel.SMS,
        "upvotes": 164
    },
    {
        "text": "हमारे ब्लॉक 4 में पीने के पानी की मुख्य पाइपलाइन टूट गई है, 500 घरों में 4 दिन से पानी नहीं आ रहा है।",
        "region_id": "IND_UP_01",
        "channel": SubmissionChannel.WHATSAPP,
        "upvotes": 142
    },
    {
        "text": "गांव की प्राथमिक स्वास्थ्य केंद्र की इमारत की छत गिर रही है और डॉक्टर हफ्ते में सिर्फ 1 दिन आते हैं।",
        "region_id": "IND_UP_01",
        "channel": SubmissionChannel.VOICE,
        "upvotes": 98
    },
    {
        "text": "गाँव को मुख्य हाइवे से जोड़ने वाली पक्की सड़क 3 साल से उखड़ी पड़ी है, बारिश में कीचड़ में गाड़ियां फंस जाती हैं।",
        "region_id": "IND_UP_01",
        "channel": SubmissionChannel.TEXT,
        "upvotes": 215
    },
    {
        "text": "The primary healthcare center in Gadchiroli lacks electricity backup and vaccine refrigeration for 15 days.",
        "region_id": "IND_MH_02",
        "channel": SubmissionChannel.TELEGRAM,
        "upvotes": 184
    },
    {
        "text": "आदिवासी बस्ती में मोबाइल नेटवर्क का कोई टावर नहीं है, ऑनलाइन पढ़ाई और आपातकालीन 108 एम्बुलेंस बुलाना असंभव है।",
        "region_id": "IND_MH_02",
        "channel": SubmissionChannel.SMS,
        "upvotes": 267
    },
    {
        "text": "बाढ़ के कारण नदी का तटबंध टूट गया है, 6 गांवों में पानी भर चुका है और लोग छतों पर फंसे हैं।",
        "region_id": "IND_BR_03",
        "channel": SubmissionChannel.VOICE,
        "upvotes": 412
    },
    {
        "text": "कक्षा 1 से 8 तक के स्कूल में पीने का पानी और शौचालय नहीं है, लड़कियों को 2 किमी दूर जाना पड़ता है।",
        "region_id": "IND_BR_03",
        "channel": SubmissionChannel.WHATSAPP,
        "upvotes": 310
    },
    {
        "text": "रेगिस्तानी इलाके में खारे पानी की गंभीर समस्या है, आरओ वाटर प्लांट 6 महीने से खराब पड़ा है।",
        "region_id": "IND_RJ_04",
        "channel": SubmissionChannel.TEXT,
        "upvotes": 189
    },
    {
        "text": "Heavy monsoon triggered a major landslide blocking Wayanad arterial road connecting hospitals and produce markets.",
        "region_id": "IND_KL_05",
        "channel": SubmissionChannel.TELEGRAM,
        "upvotes": 340
    },

    # Brazil - Portuguese
    {
        "text": "A tubulação de água potável no bairro periférico rompeu e estamos sem água potável há 5 dias.",
        "region_id": "BRA_BA_01",
        "channel": SubmissionChannel.WHATSAPP,
        "upvotes": 165
    },
    {
        "text": "A ponte de madeira que liga a comunidade rural à cidade caiu com a chuva forte, isolando 800 produtores familiares.",
        "region_id": "BRA_BA_01",
        "channel": SubmissionChannel.VOICE,
        "upvotes": 288
    },
    {
        "text": "O posto de saúde comunitário está sem médicos e sem medicamentos básicos para hipertensão e diabetes há 3 meses.",
        "region_id": "BRA_BA_01",
        "channel": SubmissionChannel.TEXT,
        "upvotes": 194
    },
    {
        "text": "Comunidade ribeirinha do Amazonas não possui energia solar nem gerador funcionando, vacinas estragaram.",
        "region_id": "BRA_AM_02",
        "channel": SubmissionChannel.SMS,
        "upvotes": 230
    },
    {
        "text": "Sem conexão de internet ou telefonia móvel em toda a bacia de Tefé, dificultando resgates de emergência no rio.",
        "region_id": "BRA_AM_02",
        "channel": SubmissionChannel.TELEGRAM,
        "upvotes": 178
    },
    {
        "text": "Alagamentos constantes na estrada de escoamento agrícola no Vale do Ribeira impedem o tráfego escolar.",
        "region_id": "BRA_SP_03",
        "channel": SubmissionChannel.WHATSAPP,
        "upvotes": 142
    },

    # South Africa - Zulu & English
    {
        "text": "Amanzi awaphumi kompompi esigodini sethu sekuphele amasonto amabili, izingane ziphuza emfuleni ongcolile.",
        "region_id": "ZAF_EC_01",
        "channel": SubmissionChannel.VOICE,
        "upvotes": 375
    },
    {
        "text": "Umgwaqo oya emtholampilo wesifunda ucekeleke phansi kakhulu, izimoto nama-ambulensi azikwazi ukuhamba.",
        "region_id": "ZAF_EC_01",
        "channel": SubmissionChannel.WHATSAPP,
        "upvotes": 290
    },
    {
        "text": "Local high school has collapsed pit latrines creating severe health and sanitation hazard for 600 learners.",
        "region_id": "ZAF_EC_01",
        "channel": SubmissionChannel.TEXT,
        "upvotes": 415
    },
    {
        "text": "Frequent electricity load shedding has caused the regional borehole water pumps to burn out completely.",
        "region_id": "ZAF_KZN_02",
        "channel": SubmissionChannel.SMS,
        "upvotes": 204
    },
    {
        "text": "No cellular network signal in the valley, community cannot report crime or call emergency fire services.",
        "region_id": "ZAF_KZN_02",
        "channel": SubmissionChannel.TELEGRAM,
        "upvotes": 160
    },
    {
        "text": "Severe stormwater drainage overflow in Khayelitsha flooded 250 informal dwellings after heavy winter storm.",
        "region_id": "ZAF_WC_03",
        "channel": SubmissionChannel.VOICE,
        "upvotes": 345
    },

    # China - Mandarin
    {
        "text": "大凉山山区通村公路遭遇多处塌方，农产品无法运出，村民出行受阻急需抢修加固挡土墙。",
        "region_id": "CHN_SC_01",
        "channel": SubmissionChannel.WHATSAPP,
        "upvotes": 250
    },
    {
        "text": "乡村卫生院缺乏基本电力供应与冷藏疫苗设备，变压器烧毁已超过两周。",
        "region_id": "CHN_SC_01",
        "channel": SubmissionChannel.VOICE,
        "upvotes": 180
    },
    {
        "text": "喀斯特山区饮水工程蓄水池开裂漏水，三个自然村千余名群众春季饮水困难。",
        "region_id": "CHN_GZ_02",
        "channel": SubmissionChannel.TEXT,
        "upvotes": 310
    },

    # Russia - Russian
    {
        "text": "Главный водопровод в поселке поврежден, более 400 семей остаются без питьевой воды третьи сутки.",
        "region_id": "RUS_NV_01",
        "channel": SubmissionChannel.WHATSAPP,
        "upvotes": 175
    },
    {
        "text": "Разрушен мост через реку, связывающий три деревни со школой и районной больницей.",
        "region_id": "RUS_NV_01",
        "channel": SubmissionChannel.VOICE,
        "upvotes": 295
    },
    {
        "text": "Защитная дамба на реке Ия требует срочного укрепления перед весенним паводком для защиты жилого сектора.",
        "region_id": "RUS_IR_02",
        "channel": SubmissionChannel.TELEGRAM,
        "upvotes": 330
    }
]

class DataStore:
    """In-memory high performance store with data fusion and dynamic expansion."""
    
    def __init__(self):
        self.regions: List[Dict[str, Any]] = BRICS_REGIONS
        self.requests: List[CitizenRequestResponse] = []
        self.live_events: List[Dict[str, Any]] = []
        self._initialize_requests()
        
    def _initialize_requests(self):
        """Zero dummy complaints: start empty so only real citizen issues appear."""
        self.requests = []
            
    def get_all_requests(self, country_code: Optional[str] = None, category: Optional[str] = None, urgency: Optional[str] = None, submitter_id: Optional[str] = None) -> List[CitizenRequestResponse]:
        """Filter requests by nation, sector, urgency tier, or submitter."""
        from .evidence_storage import get_evidence_for_complaint
        results = self.requests
        if country_code and country_code != "ALL":
            results = [r for r in results if r.country_code.value == country_code]
        if category and category != "ALL":
            results = [r for r in results if r.category.value == category]
        if urgency and urgency != "ALL":
            results = [r for r in results if r.urgency.value == urgency]
        if submitter_id:
            results = [r for r in results if r.submitter_id == submitter_id]

        for r in results:
            ev_list = get_evidence_for_complaint(r.id)
            if ev_list:
                r.evidence = ev_list
                r.evidence_count = len(ev_list)
                if not r.image_url and ev_list:
                    r.image_url = ev_list[0].get("storage_url") or ev_list[0].get("url")

        return sorted(results, key=lambda x: (x.urgency_score, x.upvotes), reverse=True)

    def get_request_by_id(self, request_id: str) -> Optional[CitizenRequestResponse]:
        """Find a single citizen request by ID."""
        from .evidence_storage import get_evidence_for_complaint
        for r in self.requests:
            if r.id == request_id:
                ev_list = get_evidence_for_complaint(r.id)
                if ev_list:
                    r.evidence = ev_list
                    r.evidence_count = len(ev_list)
                    if not r.image_url and ev_list:
                        r.image_url = ev_list[0].get("storage_url") or ev_list[0].get("url")
                return r
        return None

    def clear_all_requests(self):
        """Clear all citizen complaints and related evidence."""
        self.requests = []
        self.live_events = []
        try:
            from .evidence_storage import _evidence_store
            _evidence_store.clear()
        except Exception:
            pass
        
    def add_request(self, payload: CitizenRequestCreate) -> CitizenRequestResponse:
        """Process, classify, and persist a new citizen request, broadcasting to live stream."""
        lang_code, lang_name = detect_language(payload.text)
        translated = translate_to_english(payload.text, lang_code)
        category = classify_infrastructure_category(payload.text, translated)
        if payload.category:
            for cat_enum in InfrastructureCategory:
                if cat_enum.value.lower() == payload.category.lower() or cat_enum.name.lower() == payload.category.lower():
                    category = cat_enum
                    break
        urgency, urgency_score = evaluate_urgency(payload.text, translated)
        entities = extract_entities(payload.text, payload.country_code)
        
        # Check for state/location matches in location_name or text
        loc_str = f"{payload.location_name or ''} {payload.text}".lower()
        is_karnataka = any(k in loc_str for k in [
            "karnataka", "bengaluru", "bangalore", "mysuru", "mysore", "hubli", "dharwad",
            "mangaluru", "mangalore", "belagavi", "belgaum", "bellandur", "whitefield",
            "koramangala", "indiranagar", "electronic city", "silk board", "marathahalli",
            "jayanagar", "hebbal", "kannada"
        ])
        is_maharashtra = any(k in loc_str for k in ["maharashtra", "mumbai", "pune", "gadchiroli", "nagpur", "thane"])
        is_bihar = any(k in loc_str for k in ["bihar", "patna", "kishanganj", "gaya", "muzaffarpur"])
        is_rajasthan = any(k in loc_str for k in ["rajasthan", "jaipur", "barmer", "jodhpur", "udaipur"])
        is_kerala = any(k in loc_str for k in ["kerala", "wayanad", "kochi", "thiruvananthapuram", "kozhikode"])
        is_up = any(k in loc_str for k in ["uttar pradesh", "varanasi", "lucknow", "kanpur", "agra", "noida", "ghaziabad"])

        if is_karnataka:
            matched_reg = next((r for r in self.regions if r["id"] == "IND_KA_06"), self.regions[0])
            state_prov = "Karnataka"
        elif is_maharashtra:
            matched_reg = next((r for r in self.regions if r["id"] == "IND_MH_02"), self.regions[0])
            state_prov = "Maharashtra"
        elif is_bihar:
            matched_reg = next((r for r in self.regions if r["id"] == "IND_BR_03"), self.regions[0])
            state_prov = "Bihar"
        elif is_rajasthan:
            matched_reg = next((r for r in self.regions if r["id"] == "IND_RJ_04"), self.regions[0])
            state_prov = "Rajasthan"
        elif is_kerala:
            matched_reg = next((r for r in self.regions if r["id"] == "IND_KL_05"), self.regions[0])
            state_prov = "Kerala"
        elif is_up:
            matched_reg = next((r for r in self.regions if r["id"] == "IND_UP_01"), self.regions[0])
            state_prov = "Uttar Pradesh"
        else:
            matched_reg = next((r for r in self.regions if r["country_code"] == payload.country_code.value), self.regions[0])
            state_prov = matched_reg["state_province"]

        # If Karnataka is detected, ensure coordinates fall in Karnataka (12.97° N, 77.59° E)
        if is_karnataka:
            if payload.latitude is None or not (11.5 <= payload.latitude <= 18.5 and 74.0 <= payload.longitude <= 78.5):
                lat = matched_reg["center_lat"] + random.uniform(-0.04, 0.04)
                lng = matched_reg["center_lng"] + random.uniform(-0.04, 0.04)
            else:
                lat = payload.latitude
                lng = payload.longitude
        elif payload.latitude is not None and payload.longitude is not None:
            lat = payload.latitude
            lng = payload.longitude
        else:
            lat = matched_reg["center_lat"] + random.uniform(-0.02, 0.02)
            lng = matched_reg["center_lng"] + random.uniform(-0.02, 0.02)

        loc_name = payload.location_name or matched_reg["district"]
        
        # If coordinates are in Karnataka region (11.5-18.5 N, 74-78.5 E)
        if 11.5 <= lat <= 18.5 and 74.0 <= lng <= 78.5:
            state_prov = "Karnataka"

        country_name_map = {"IND": "India", "BRA": "Brazil", "ZAF": "South Africa", "CHN": "China", "RUS": "Russia", "USA": "United States"}
        
        new_req = CitizenRequestResponse(
            id=f"CR-{payload.country_code.value}-{random.randint(5000, 9999)}",
            original_text=payload.text,
            translated_text=translated,
            language=lang_code,
            language_name=lang_name,
            channel=payload.channel,
            country_code=payload.country_code,
            country_name=country_name_map.get(payload.country_code.value, "Global"),
            category=category,
            urgency=urgency,
            urgency_score=urgency_score,
            sentiment_score=round(-1.0 * urgency_score, 2),
            location_name=loc_name,
            state_province=state_prov,
            latitude=round(lat, 5),
            longitude=round(lng, 5),
            upvotes=1,
            status="Processed & Queued for Decision Engine",
            resolution_stage="Transmitted to Gov Command Map",
            official_notes="Real-time geo-located grievance received from citizen terminal.",
            submitter_id=payload.submitter_id,
            submitter_name=payload.citizen_name or "Verified Citizen",
            created_at=datetime.utcnow().isoformat() + "Z",
            extracted_entities=entities,
            evidence_count=0,
            evidence=[],
            image_url=payload.image_url
        )
        
        self.requests.insert(0, new_req)
        
        # Record real-time event for Government Command Center Map live-sync
        event = {
            "event_type": "NEW_COMPLAINT",
            "timestamp": new_req.created_at,
            "request": new_req.model_dump(),
            "message": f"New {new_req.category.value} Grievance detected at {new_req.location_name} ({new_req.country_name})"
        }
        self.live_events.insert(0, event)
        if len(self.live_events) > 100:
            self.live_events = self.live_events[:100]
        
        # Persist to live citizen complaints CSV log
        try:
            import os
            import csv
            csv_file = os.path.join(os.path.dirname(__file__), "..", "data", "live_citizen_complaints.csv")
            file_exists = os.path.exists(csv_file)
            with open(csv_file, mode="a", encoding="utf-8", newline="") as f:
                writer = csv.writer(f)
                if not file_exists:
                    writer.writerow(["id", "country_code", "state", "location", "category", "urgency", "urgency_score", "original_text", "translated_text", "channel", "created_at"])
                writer.writerow([
                    new_req.id, new_req.country_code.value, new_req.state_province, new_req.location_name,
                    new_req.category.value, new_req.urgency.value, new_req.urgency_score,
                    new_req.original_text, new_req.translated_text, new_req.channel.value, new_req.created_at
                ])
        except Exception as e:
            pass
            
        return new_req
        
    def update_request_status(self, request_id: str, status: str, official_notes: Optional[str] = None, assigned_agency: Optional[str] = None, allocated_budget_usd: Optional[float] = None) -> Optional[CitizenRequestResponse]:
        """Update complaint resolution stage and official notes by Government authority."""
        for r in self.requests:
            if r.id == request_id:
                r.resolution_stage = status
                r.status = f"Gov Action: {status}"
                if official_notes:
                    r.official_notes = official_notes
                if assigned_agency:
                    r.extracted_entities["assigned_agency"] = assigned_agency
                if allocated_budget_usd is not None:
                    r.extracted_entities["allocated_budget_usd"] = allocated_budget_usd
                    
                # Broadcast update event
                update_event = {
                    "event_type": "STATUS_UPDATE",
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "request": r.model_dump(),
                    "message": f"Status updated to '{status}' for grievance {r.id} ({r.location_name})"
                }
                self.live_events.insert(0, update_event)
                return r
        return None

    def get_live_events(self, limit: int = 25) -> List[Dict[str, Any]]:
        """Retrieve recent real-time grievance and status events."""
        return self.live_events[:limit]

    def upvote_request(self, request_id: str) -> Optional[int]:
        """Upvote a petition/request."""
        for r in self.requests:
            if r.id == request_id:
                r.upvotes += 1
                return r.upvotes
        return None

# Singleton instance
db = DataStore()

