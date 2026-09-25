# CivicPulse DPG: Multilingual AI Citizen Infrastructure Alignment Platform

[![Digital Public Good](https://img.shields.io/badge/DPGA-Standard%20v1.4.0%20Compliant-10b981.svg)](https://digitalpublicgoods.net)
[![License: AGPL v3](https://img.shields.io/badge/License-GNU%20AGPLv3%20%7C%20Apache%202.0-blue.svg)](LICENSE)
[![Copyright](https://img.shields.io/badge/Copyright-2026%20Praveen%20Reddy-amber.svg)](COPYRIGHT)
[![BRICS](https://img.shields.io/badge/Nations-India%20%7C%20Brazil%20%7C%20South%20Africa%20%7C%20China%20%7C%20Russia-cyan.svg)](#)

CivicPulse is a scalable, open-source, multilingual AI platform designed as a **Digital Public Good (DPG)** to bridge the critical gap between grassroots citizen infrastructure demands and national capital investment plans across **BRICS nations** (India, Brazil, South Africa, China, Russia).

---

## 🏛️ Problem Addressed

Governments frequently struggle to consolidate fragmented citizen petitions, leading to:
- **Misaligned Public Spending**: Capital expenditure allocated to low-demand projects while urgent citizen crisis hotspots remain unfunded.
- **Unaddressed Infrastructure Deficits**: Inability to identify geographic clusters experiencing acute breakdowns in drinking water, electricity grids, primary clinics, and transportation corridors.
- **Linguistic Exclusion**: Marginalized citizens unable to submit grievances in regional dialects and native languages.
- **Lack of Quantitative Impact Measurement**: Absence of multi-criteria decision models that evaluate social return on investment (SROI) and SDG alignment for large-scale digital public infrastructure (DPI) initiatives.

---

## 🚀 Key Features

### 1. Multilingual Multi-Modal Citizen Ingestion Gateway
- **Speech-to-Text Voice Processing**: Ingests voice notes and acoustic audio in native BRICS languages (Hindi, Marathi, Tamil, Bengali, Telugu, Portuguese, Mandarin Chinese, Russian, isiZulu, Afrikaans, English).
- **Automated Neural NLP Pipeline**: Instant language identification, contextual neural translation to English, 7-sector infrastructure classification (*Water & Sanitation, Roads & Mobility, Clean Energy, Healthcare Clinics, Digital Public Infrastructure, Education, Flood/Climate Resilience*), and urgency severity scoring.
- **Multi-Channel Integrations**: Voice recording portal, Web submission forms, WhatsApp bot simulation, Telegram bot mock, and Toll-free SMS gateway.
- **Community Petitions & Upvoting**: Real-time grassroots citizen demand prioritization feed.

### 2. Decision Intelligence & Geospatial GIS Hotspots
- **DBSCAN Density Clustering**: Aggregates individual citizen requests into high-urgency spatial demand hotspots with geographic radius buffers.
- **Interactive BRICS GIS Map**: Dark-theme map with multi-layer overlays (*Demand Hotspots, Infrastructure Deficit Indices, Vulnerability Choropleths, National Capital Projects*).
- **District Demographic Drilldowns**: Inspects population, poverty rates, multi-sector deficit scores, and verified citizen voices.

### 3. AI Project Prioritization (MCDA Engine)
- **Multi-Criteria Decision Analysis**: Ranks candidate infrastructure projects using customizable weights:
  $$\text{Score} = w_1 \cdot \text{Demand} + w_2 \cdot \text{Deficit} + w_3 \cdot \text{Vulnerability} + w_4 \cdot \text{Feasibility}$$
- **Quantified Social ROI & Beneficiaries**: Projects direct population reach, timeline in months, capital cost in $M USD, and UN SDG alignments.
- **Automated Tender Specification Generator**: 1-click drafting of procurement tenders for municipal engineers.

### 4. Public Expenditure Misalignment Auditor (Spend Gap Matrix)
- **Fiscal Discrepancy Detection**: Pinpoints *"Critical Ignored Hotspots"* (high demand + high deficit with zero or inadequate capital) versus *"Overfunded Inefficiencies"*.
- **Capital Reallocation Advice**: Generates actionable advisories for finance and planning ministries.

### 5. Macroeconomic Policy Sandbox & Simulator
- **Interactive Budget Sandbox**: Sliders for 7 infrastructure sectors with a tunable *Vulnerability Equity Multiplier* (1.0x to 2.0x).
- **Live Socio-Economic Forecasting**: Computes projected citizen satisfaction index, deficit reduction %, SDG progress index, and economic multiplier ($GDP return per $1 invested).

### 6. AI Policy Copilot & Executive Briefing Studio
- **Automated Policy Briefs**: Generates structured Cabinet Policy Memorandums, procurement tender drafts, and citizen status notifications.
- **Evidence-Based Citations**: Links all recommendations to underlying verified citizen feedback streams and demographic census records.

### 7. Digital Public Goods Alliance (DPGA) Open Data Hub
- **Open Standards**: Fully conforms to the 9 DPGA indicators (Open License, Open Data, Privacy Preserving, UN SDG Aligned).
- **Machine-Readable 1-Click Exports**: Direct downloads in RFC 7946 GeoJSON, CSV, and JSON-LD formats for GIS tools (QGIS, ArcGIS, PowerBI).
- **OpenAPI 3.1 Architecture**: Interactive Swagger UI and ReDoc endpoints.

---

## 📂 Repository Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints.py          # RESTful routes for Citizen Ingestion, Analytics, Simulation, DPG
│   │   ├── models/
│   │   │   └── schemas.py            # Pydantic schemas (Requests, Recommendations, Simulations)
│   │   ├── services/
│   │   │   ├── multilingual_nlp.py   # Multi-language detector, translation & intent categorization
│   │   │   ├── voice_processor.py    # Speech-to-text audio processing & presets
│   │   │   ├── data_store.py         # BRICS regional baseline demographics & complaints store
│   │   │   ├── hotspot_engine.py     # DBSCAN spatial clustering & GeoJSON generator
│   │   │   ├── recommendation_engine.py # Multi-Criteria Decision Analysis (MCDA) ranking
│   │   │   ├── misalignment_engine.py   # Spend gap detection & budget divergence
│   │   │   ├── policy_simulator.py      # Macroeconomic scenario & welfare simulation
│   │   │   └── ai_copilot.py            # Automated cabinet briefs & tender drafts
│   │   └── main.py                   # FastAPI app entrypoint & CORS configuration
│   ├── tests/
│   │   └── test_api.py               # Automated pytest suite (6 tests covering all pipelines)
│   └── requirements.txt              # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Top bar, nation switcher & multilingual selector
│   │   │   ├── GISMap.jsx             # Leaflet geospatial hotspot & heatmap explorer
│   │   │   ├── CitizenPortal.jsx      # Voice recorder, WhatsApp/SMS bot & petition feed
│   │   │   ├── RecommendationView.jsx # MCDA weight sliders & ranked project cards
│   │   │   ├── MisalignmentView.jsx   # Spend gap matrix & fiscal diagnostics
│   │   │   ├── PolicySimulator.jsx    # Sector budget allocator & welfare simulator
│   │   │   ├── AICopilotModal.jsx     # Executive brief & procurement tender studio
│   │   │   └── DPGHub.jsx             # DPGA standard scorecard & open data downloads
│   │   ├── services/
│   │   │   └── api.js                 # Unified REST client with fallback modes
│   │   ├── App.jsx                    # Root tab routing & state management
│   │   └── index.css                  # Dark-mode civic design system & glassmorphism
│   ├── index.html                     # HTML5 entry with Google Fonts & Leaflet
│   └── package.json                   # React 19, Lucide, Leaflet, Chart.js dependencies
│
└── README.md
```

---

## ⚡ Quickstart & Running Locally

### Prerequisites
- **Python 3.10+** (Tested on Python 3.14)
- **Node.js 18+** (Tested on Node.js v22/v24)
- **npm 9+**

---

### 🚀 Option 1: Run Full Stack with One Command (Recommended)

From the project root directory:

```bash
npm run dev
```
This runs both the **FastAPI Backend** (`http://localhost:8000`) and the **React Frontend** (`http://localhost:5173`) concurrently in a single terminal.

---

### Option 2: Run Backend & Frontend Separately

#### 1. Backend Service
```bash
cd backend
npm run dev
# or: uvicorn app.main:app --port 8000 --reload
```
- **Backend API**: `http://localhost:8000`
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

Run backend tests:
```bash
npm test
# or: pytest tests
```

#### 2. Frontend Web Application
```bash
cd frontend
npm run dev
```
- **Frontend Web Application**: `http://localhost:5173`

---

## 🌐 Supported BRICS Nations & Regional Data

| Country | Key Administrative Regions Seeded | Primary Languages Supported |
| :--- | :--- | :--- |
| 🇮🇳 **India** | Uttar Pradesh, Maharashtra, Bihar, Rajasthan, Kerala | Hindi (हिंदी), Marathi (मराठी), Tamil (தமிழ்), Bengali (বাংলা), Telugu (తెలుగు), English |
| 🇧🇷 **Brazil** | Bahia, Amazonas, São Paulo, Minas Gerais | Portuguese (Português) |
| 🇿🇦 **South Africa** | Eastern Cape, KwaZulu-Natal, Western Cape | isiZulu, Afrikaans, isiXhosa, English |
| 🇨🇳 **China** | Sichuan (大凉山), Guizhou (毕节), Shandong | Mandarin Chinese (简体中文) |
| 🇷🇺 **Russia** | Novgorod Oblast, Irkutsk Oblast, Sverdlovsk | Russian (Русский) |

---

## 📜 Digital Public Good (DPGA) Compliance

CivicPulse meets all **9 DPGA Standard Indicators**:
1. **Open License**: Dual-licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** and **Apache License 2.0**.
   - Copyleft guarantee: Guarantees that this software, any modifications, and network services based on it must remain permanently open-source.
   - Proprietary prohibition: No entity or third party may claim exclusive proprietary copyright over this project or close its source.
2. **Open Standards**: GeoJSON (RFC 7946), OpenAPI 3.1, W3C Schema.org.
3. **Open Data Extraction**: Machine-readable GeoJSON and CSV downloads.
4. **Differential Privacy**: Coordinate jittering & strict PII scrubbing.
5. **Privacy Regulations**: Compliant with global privacy frameworks.
6. **UN SDG Alignment**: Directly accelerates SDGs 3, 4, 6, 7, 9, 10, 11, 13, 16.
7. **Linguistic Inclusivity**: Multi-modal voice & text across native dialects.
8. **Do No Harm & Ethical AI**: Transparent MCDA weightings.
9. **Interoperability**: Standard REST APIs for sovereign e-Governance platforms.

---

## ⚖️ Copyright & License

**Copyright (C) 2026 Praveen Reddy. All rights reserved.**

This project is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE) with the [Apache License 2.0](LICENSE-APACHE) option.

- **Anti-Appropriation Clause**: See [`NOTICE`](NOTICE) and [`COPYRIGHT`](COPYRIGHT) for legal details.
- Commercial or proprietary closure of this codebase is strictly forbidden under the reciprocal terms of the GNU AGPLv3.

