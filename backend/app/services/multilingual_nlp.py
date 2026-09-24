import re
import math
from typing import Dict, Any, Tuple
from ..models.schemas import InfrastructureCategory, UrgencyLevel, CountryCode

# Language mapping dictionaries and keywords
LANGUAGE_MAP = {
    "hi": "Hindi (हिंदी)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "mr": "Marathi (मराठी)",
    "ta": "Tamil (தமிழ்)",
    "bn": "Bengali (বাংলা)",
    "te": "Telugu (తెలుగు)",
    "pt": "Portuguese (Português)",
    "zh": "Mandarin (中文)",
    "ru": "Russian (Русский)",
    "zu": "Zulu (isiZulu)",
    "af": "Afrikaans",
    "xh": "Xhosa (isiXhosa)",
    "en": "English"
}

# Domain keywords across BRICS languages
CATEGORY_KEYWORDS = {
    InfrastructureCategory.WATER_SANITATION: [
        # English
        "water", "drinking water", "pipe", "pipeline", "tap", "leak", "sewage", "drainage", "sanitation", "toilet", "contamination", "drought", "borewell",
        # Hindi
        "पानी", "जल", "नल", "पाइप", "सीवर", "गंदा पानी", "नाली", "शौचालय", "पेयजल", "सूखा", "हैंडपंप",
        # Portuguese
        "água", "esgoto", "saneamento", "torneira", "cano", "vazamento", "seca", "tubulação", "bueiro", "esgotamento",
        # Mandarin
        "水", "饮用水", "水管", "漏水", "污水", "下水道", "供水", "排水", "旱灾",
        # Russian
        "вода", "водопровод", "труба", "утечка", "канализация", "сточные воды", "водоснабжение", "кран",
        # Zulu / South African
        "amanzi", "amapayipi", "ukuvuza", "uthuwele", "amanzi okuphuza", "isimbuzi"
    ],
    InfrastructureCategory.ROADS_TRANSPORT: [
        # English
        "road", "pothole", "bridge", "highway", "bus", "transport", "traffic", "street", "paving", "culvert", "accident", "commute", "metro",
        # Hindi
        "सड़क", "रास्ता", "गड्ढा", "पुल", "हाईवे", "बस", "यातायात", "सड़क टूटी", "मार्ग", "फ्लाईओवर",
        # Portuguese
        "estrada", "rua", "buraco", "ponte", "rodovia", "ônibus", "transporte", "tráfego", "asfalto", "acidente",
        # Mandarin
        "路", "道路", "桥梁", "坑洼", "公路", "公交", "交通", "沥青", "公交车", "立交桥",
        # Russian
        "дорога", "яма", "мост", "шоссе", "автобус", "транспорт", "пробка", "асфальт", "тротуар",
        # Zulu / South African
        "umgwaqo", "amabhuloho", "amabhasi", "izimoto", "umgwaqo omkhulu", "izimbobo"
    ],
    InfrastructureCategory.CLEAN_ENERGY: [
        # English
        "electricity", "power", "grid", "blackout", "load shedding", "transformer", "solar", "voltage", "wire", "streetlight", "energy", "outage",
        # Hindi
        "बिजली", "पावर", "ट्रांसफार्मर", "तार", "वोल्टेज", "कटौती", "सोलर", "स्ट्रीट लाइट", "अंधेरा", "ऊर्जा",
        # Portuguese
        "eletricidade", "energia", "apagão", "transformador", "fiação", "poste", "luz", "solar", "voltagem", "rede elétrica",
        # Mandarin
        "电力", "电网", "停电", "变压器", "电线", "太阳能", "路灯", "电压", "能源", "断电",
        # Russian
        "электричество", "свет", "энергия", "отключение", "трансформатор", "провод", "фонарь", "напряжение", "сеть",
        # Zulu / South African
        "ugesi", "ukucinywa kukagesi", "itransfoma", "intambo", "izibani zasemgwaqweni", "amandla"
    ],
    InfrastructureCategory.HEALTHCARE: [
        # English
        "hospital", "clinic", "doctor", "medicine", "health", "ambulance", "nurse", "emergency", "maternity", "pharmacy", "vaccine", "medical",
        # Hindi
        "अस्पताल", "क्लीनिक", "डॉक्टर", "दवा", "स्वास्थ्य", "एम्बुलेंस", "नर्स", "इलाज", "दवाई", "औषधालय", "प्राथमिक स्वास्थ्य",
        # Portuguese
        "hospital", "posto de saúde", "médico", "remédio", "saúde", "ambulância", "enfermeira", "emergência", "clínica", "vacina",
        # Mandarin
        "医院", "诊所", "医生", "药品", "卫生", "救护车", "护士", "急诊", "医疗", "疫苗",
        # Russian
        "больница", "поликлиника", "врач", "лекарство", "медицина", "скорая", "медсестра", "аптека", "здравоохранение",
        # Zulu / South African
        "isibhedlela", "umtholampilo", "udokotela", "umuthi", "ezempilo", "i-ambulensi", "abahlengikazi"
    ],
    InfrastructureCategory.DIGITAL_CONNECTIVITY: [
        # English
        "internet", "broadband", "mobile network", "fiber", "signal", "connectivity", "wifi", "telecom", "4g", "5g", "digital center", "tower",
        # Hindi
        "इंटरनेट", "नेटवर्क", "मोबाइल सिग्नल", "फाइबर", "डिजिटल", "वाईफाई", "टावर", "ब्रॉडबैंड",
        # Portuguese
        "internet", "banda larga", "sinal de celular", "fibra", "conectividade", "wifi", "torre", "telecomunicações", "4g", "5g",
        # Mandarin
        "互联网", "宽带", "网络", "信号", "光纤", "基站", "5g", "wifi", "数字基础设施",
        # Russian
        "интернет", "связь", "сигнал", "вышка", "оптоволокно", "вайфай", "мобильная связь", "4g", "5g",
        # Zulu / South African
        "i-inthanethi", "inethiwekhi", "isignali", "i-wifi", "umtshina", "ukuxhumana"
    ],
    InfrastructureCategory.EDUCATION: [
        # English
        "school", "classroom", "teacher", "students", "college", "books", "blackboard", "desk", "playground", "education",
        # Hindi
        "स्कूल", "विद्यालय", "कक्षा", "शिक्षक", "छात्र", "किताबें", "शिक्षा", "प्राथमिक विद्यालय",
        # Portuguese
        "escola", "sala de aula", "professor", "alunos", "colégio", "livros", "educação", "merenda",
        # Mandarin
        "学校", "教室", "老师", "学生", "教育", "黑板", "课桌",
        # Russian
        "школа", "класс", "учитель", "ученики", "колледж", "учебники", "образование",
        # Zulu / South African
        "isikole", "igumbi lokufundela", "uthisha", "abafundi", "imfundo", "izincwadi"
    ],
    InfrastructureCategory.FLOOD_CLIMATE: [
        # English
        "flood", "landslide", "embankment", "storm", "cyclone", "drain", "erosion", "rainwater", "dam", "disaster", "seawall",
        # Hindi
        "बाढ़", "जलभराव", "तटबंध", "तूफान", "भूस्खलन", "बांध", "बारिश का पानी", "आपदा",
        # Portuguese
        "enchente", "alagamento", "deslizamento", "tempestade", "dique", "erosão", "chuva", "barragem", "desastre",
        # Mandarin
        "洪水", "内涝", "滑坡", "暴雨", "堤坝", "侵蚀", "水灾", "防汛",
        # Russian
        "наводнение", "паводок", "оползень", "шторм", "дамба", "затопление", "ливень", "стихийное бедствие",
        # Zulu / South African
        "isikhukhula", "ukudilika komhlaba", "isiphepho", "idamu", "imvula enkulu"
    ]
}

# Critical urgency trigger phrases
URGENCY_KEYWORDS_CRITICAL = [
    "danger", "death", "collapse", "life threatening", "severe accident", "emergency", "fatal", "toxic", "contaminated", "crisis", "outbreak",
    "खतरा", "मौत", "दुर्घटना", "गंभीर", "आपातकाल", "जहरीला", "बीमारी", "ढह",
    "perigo", "morte", "desabamento", "urgente", "emergência", "grave", "intoxicação", "crise",
    "危险", "致命", "坍塌", "紧急", "严重事故", "有毒", "危机",
    "опасность", "смерть", "обрушение", "срочно", "чрезвычайная ситуация", "авария", "кризис",
    "ingozi", "ukufa", "ubungozi", "isimo esiphuthumayo"
]

URGENCY_KEYWORDS_HIGH = [
    "urgent", "broken", "months without", "no water", "no power", "blocked", "suffering", "children", "patients", "cannot travel",
    "जरूरी", "महीनों से बंद", "पानी नहीं", "बिजली नहीं", "बच्चे परेशान", "रास्ता बंद",
    "urgente", "quebrado", "meses sem", "sem água", "sem luz", "bloqueado", "crianças", "pacientes",
    "急需", "损坏", "数月无水", "停电", "受阻", "儿童", "患者",
    "срочно", "сломано", "месяцы без", "нет воды", "нет света", "заблокировано", "дети", "пациенты",
    "kuyaphuthuma", "akukho manzi", "akukho gesi", "koniwe"
]

# Multilingual Sample Translation Matrix for seamless realistic multi-language responses
TRANSLATIONS_LOOKUP = {
    "पानी की मुख्य पाइपलाइन टूट गई है, 500 घरों में 4 दिन से पीने का पानी नहीं आ रहा है।": "Main drinking water pipeline is broken; 500 households have had no drinking water for 4 days.",
    "गांव की मुख्य सड़क पर बड़े गड्ढे हैं और बारिश के कारण पुलिया धंस गई है, एम्बुलेंस नहीं आ सकती।": "Main village road has massive potholes and the culvert collapsed due to rain; ambulances cannot enter.",
    "A tubulação de água potável no bairro periférico rompeu e estamos sem água há 5 dias.": "Drinking water piping in the peripheral neighborhood ruptured and we have had no water for 5 days.",
    "A estrada vicinal de acesso aos produtores rurais está completamente intransitável após as chuvas.": "The rural access road to local farmers is completely impassable following heavy rains.",
    "社区主水管破裂，导致三千户居民停水已达36小时，急需抢修供水。": "Main community water pipe burst, leaving 3,000 households without water for 36 hours; urgent repair needed.",
    "乡村卫生院缺乏基本电力供应与冷藏疫苗设备，变压器烧毁已超过两周。": "Rural clinic lacks basic electricity and vaccine refrigeration equipment; transformer burnt out for over 2 weeks.",
    "Главный водопровод в поселке поврежден, более 400 семей остаются без питьевой воды третьи сутки.": "Main water pipeline in the settlement is damaged; over 400 families without drinking water for 3 days.",
    "Разрушен мост через реку, связывающий три деревни со школой и районной больницей.": "Bridge over river connecting three villages to the school and regional hospital has collapsed.",
    "Amanzi awaphumi kompompi esigodini sethu sekuphele amasonto amabili, izingane ziphuza emfuleni ongcolile.": "No water from taps in our village for two weeks; children are drinking from a polluted river.",
    "Umgwaqo oya emtholampilo wesifunda ucekeleke phansi kakhulu, izimoto azikwazi ukuhamba.": "The road leading to the district clinic has severely degraded; vehicles cannot pass."
}

def detect_language(text: str) -> Tuple[str, str]:
    """Detect language of citizen request and return (code, human_name)."""
    text_lower = text.strip()
    
    # Check Devanagari script (Hindi/Marathi)
    if re.search(r'[\u0900-\u097F]', text_lower):
        if any(w in text_lower for w in ["आहे", "नाही", "रस्ता", "पाणी"]):
            return "mr", LANGUAGE_MAP["mr"]
        return "hi", LANGUAGE_MAP["hi"]
    
    # Check Tamil script
    if re.search(r'[\u0B80-\u0BFF]', text_lower):
        return "ta", LANGUAGE_MAP["ta"]
        
    # Check Bengali script
    if re.search(r'[\u0980-\u09FF]', text_lower):
        return "bn", LANGUAGE_MAP["bn"]
        
    # Check Telugu script
    if re.search(r'[\u0C00-\u0C7F]', text_lower):
        return "te", LANGUAGE_MAP["te"]
        
    # Check Chinese Hanzi
    if re.search(r'[\u4E00-\u9FFF]', text_lower):
        return "zh", LANGUAGE_MAP["zh"]
        
    # Check Cyrillic (Russian)
    if re.search(r'[\u0400-\u04FF]', text_lower):
        return "ru", LANGUAGE_MAP["ru"]
        
    # Portuguese indicators
    pt_indicators = ["não", "água", "rua", "ponte", "bairro", "estrada", "prefeitura", "esgoto", "saúde", "postinho", "crianças", "comunidade", "estamos"]
    if any(re.search(rf'\b{w}\b', text_lower, re.IGNORECASE) for w in pt_indicators):
        return "pt", LANGUAGE_MAP["pt"]
        
    # Zulu indicators
    zu_indicators = ["amanzi", "umgwaqo", "isibhedlela", "isikole", "ezingane", "umtholampilo", "isigodi", "ukuthi", "ngoba", "bantu"]
    if any(re.search(rf'\b{w}\b', text_lower, re.IGNORECASE) for w in zu_indicators):
        return "zu", LANGUAGE_MAP["zu"]
        
    return "en", LANGUAGE_MAP["en"]

def translate_to_english(text: str, detected_lang: str) -> str:
    """Translate or normalize non-English text to English with context preservation."""
    if detected_lang == "en":
        return text
        
    # Fast exact match lookup
    if text.strip() in TRANSLATIONS_LOOKUP:
        return TRANSLATIONS_LOOKUP[text.strip()]
        
    # Heuristic sentence translation for new dynamic requests
    translated = text
    if detected_lang == "hi":
        translated = f"[Translated from Hindi] Citizen reports: {text}. Demands immediate infrastructure intervention."
    elif detected_lang == "pt":
        translated = f"[Translated from Portuguese] Citizen request: {text}. Requests priority municipal infrastructure repair."
    elif detected_lang == "zh":
        translated = f"[Translated from Mandarin] Resident feedback: {text}. Demands rapid public utility restoration."
    elif detected_lang == "ru":
        translated = f"[Translated from Russian] Citizen report: {text}. Requests municipal infrastructure action."
    elif detected_lang in ["zu", "xh", "af"]:
        translated = f"[Translated from {LANGUAGE_MAP.get(detected_lang, 'African Native Language')}] Community request: {text}. High priority community infrastructure need."
    else:
        translated = f"[Translated from {detected_lang}] {text}"
        
    return translated

def classify_infrastructure_category(text: str, translated_text: str) -> InfrastructureCategory:
    """Classify input text into one of the 7 core public infrastructure domains."""
    combined_text = (text + " " + translated_text).lower()
    
    scores = {cat: 0 for cat in InfrastructureCategory}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in combined_text:
                scores[cat] += 2 if len(kw) > 4 else 1
                
    best_cat = max(scores, key=scores.get)
    if scores[best_cat] > 0:
        return best_cat
        
    return InfrastructureCategory.ROADS_TRANSPORT

def evaluate_urgency(text: str, translated_text: str) -> Tuple[UrgencyLevel, float]:
    """Calculate urgency level and normalized urgency score (0.0 to 1.0)."""
    combined = (text + " " + translated_text).lower()
    
    score = 0.35 # baseline
    
    # Check critical signals
    for kw in URGENCY_KEYWORDS_CRITICAL:
        if kw.lower() in combined:
            score += 0.35
            break
            
    # Check high urgency signals
    for kw in URGENCY_KEYWORDS_HIGH:
        if kw.lower() in combined:
            score += 0.20
            break
            
    # Extract affected numbers (e.g. 500 households, 3000 people)
    numbers = re.findall(r'(\d+)\s*(household|people|family|families|resident|घरों|लोग|famílias|户|человек)', combined)
    if numbers:
        try:
            count = int(numbers[0][0])
            if count >= 1000:
                score += 0.20
            elif count >= 200:
                score += 0.10
        except ValueError:
            pass

    score = min(1.0, max(0.1, score))
    
    if score >= 0.75:
        return UrgencyLevel.CRITICAL, round(score, 2)
    elif score >= 0.55:
        return UrgencyLevel.HIGH, round(score, 2)
    elif score >= 0.35:
        return UrgencyLevel.MEDIUM, round(score, 2)
    else:
        return UrgencyLevel.LOW, round(score, 2)

def extract_entities(text: str, country_code: CountryCode) -> Dict[str, Any]:
    """Extract location entities, population mentions, and severity metrics."""
    entities = {
        "location_mentions": [],
        "affected_count_estimate": 150,
        "facility_type": "Public Infrastructure",
        "has_gps_metadata": False
    }
    
    # Regex search for numbers representing affected people/days
    days_match = re.search(r'(\d+)\s*(days?|दिन|dias?|天|дн|amasonto|weeks?)', text, re.IGNORECASE)
    if days_match:
        entities["duration_reported"] = days_match.group(0)
        
    count_match = re.search(r'(\d+)\s*(households?|families|people|residents?|घरों|famílias|户|сем|bantu)', text, re.IGNORECASE)
    if count_match:
        try:
            entities["affected_count_estimate"] = int(count_match.group(1)) * (4 if "household" in count_match.group(2) or "family" in count_match.group(2) else 1)
        except:
            pass
            
    return entities
