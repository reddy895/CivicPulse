# CivicPulse DPG: Multilingual AI Citizen Infrastructure Alignment Platform

![Digital Public Good](https://img.shields.io/badge/Digital_Public_Good-DPG-10b981)
![AI](https://img.shields.io/badge/AI-Multilingual_NLP-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/Frontend-React_19-61DAFB)
![Standards](https://img.shields.io/badge/Standards-GeoJSON%20%7C%20OpenAPI-orange)
![Nations](https://img.shields.io/badge/Regions-BRICS-cyan)

**CivicPulse** is a multilingual AI-powered Digital Public Good (DPG) designed to bridge the gap between grassroots citizen infrastructure demands and government capital investment plans across BRICS nations.

The platform combines multilingual citizen grievance processing, geospatial hotspot detection, AI-powered infrastructure prioritization, public expenditure auditing, and policy simulation to support evidence-based public infrastructure planning.

**Supported nations:** India, Brazil, South Africa, China, and Russia.

---

## 🏛️ Problem Addressed

Governments frequently struggle to consolidate fragmented citizen feedback and translate it into effective infrastructure planning.

CivicPulse addresses four major challenges:

- **Misaligned Public Spending:** Public funds may be allocated to low-demand projects while urgent infrastructure problems remain unresolved.
- **Unaddressed Infrastructure Deficits:** Authorities may struggle to identify geographic clusters facing shortages in drinking water, electricity, healthcare, roads, and transportation.
- **Linguistic Exclusion:** Citizens who communicate in regional languages or dialects may face barriers when submitting grievances.
- **Lack of Quantitative Impact Measurement:** Infrastructure decisions need transparent prioritization methods that consider public demand, vulnerability, feasibility, social impact, and Sustainable Development Goals (SDGs).

CivicPulse brings these signals together in a unified decision-support platform.

---

## 🚀 Key Features

### 1. Multilingual Citizen Ingestion Gateway

CivicPulse supports multiple channels for collecting citizen feedback.

- Voice-note and audio-based grievance submission.
- Speech-to-text processing.
- Language identification and translation.
- Contextual NLP and infrastructure-sector classification.
- Urgency and severity scoring.
- Web-based complaint submission.
- WhatsApp bot simulation.
- Telegram bot mock integration.
- SMS gateway simulation.
- Community petitions and upvoting.

The platform is designed to reduce language barriers and make citizen feedback more accessible.

### 2. AI-Powered NLP Pipeline

The multilingual processing pipeline organizes citizen submissions into structured information.

Core capabilities include:

- Language identification.
- Voice transcription.
- Translation into a common processing language.
- Complaint classification.
- Infrastructure-sector identification.
- Urgency scoring.
- Structured data generation for downstream analytics.

The seven infrastructure sectors are:

1. Water and sanitation.
2. Roads and mobility.
3. Clean energy.
4. Healthcare clinics.
5. Digital public infrastructure.
6. Education.
7. Flood and climate resilience.

### 3. Geospatial GIS Hotspot Detection

CivicPulse uses geographic analytics to identify areas with concentrated infrastructure complaints.

Features include:

- DBSCAN density-based spatial clustering.
- Geographic demand-hotspot visualization.
- Interactive Leaflet maps.
- Infrastructure-deficit indicators.
- Vulnerability choropleths.
- National capital-project overlays.
- District-level demographic drilldowns.

These features help planners investigate where infrastructure needs may be concentrated.

### 4. AI Project Prioritization Engine

The Multi-Criteria Decision Analysis (MCDA) engine ranks infrastructure projects using configurable decision criteria.

The conceptual prioritization formula is:

\[
\text{Score} =
w_1D+w_2I+w_3V+w_4F
\]

Where:

- \(D\) = citizen demand.
- \(I\) = infrastructure deficit.
- \(V\) = population vulnerability.
- \(F\) = project feasibility.
- \(w_1,w_2,w_3,w_4\) = configurable criterion weights.

Additional capabilities include:

- Ranked infrastructure project recommendations.
- Adjustable decision weights.
- Estimated project costs.
- Estimated implementation timelines.
- Potential beneficiary estimates.
- SDG alignment indicators.
- Automated tender-specification drafting.

The score is a decision-support indicator and does not replace expert review or formal public procurement procedures.

### 5. Public Expenditure Misalignment Auditor

The expenditure auditor compares infrastructure needs with capital investment allocations.

It is designed to identify:

- High-demand areas with significant infrastructure deficits.
- Areas receiving inadequate capital allocations.
- Potentially overfunded or lower-priority projects.
- Discrepancies between infrastructure demand and planned spending.
- Potential opportunities for capital reallocation.

The system generates analytical advisories to support finance and planning teams.

### 6. Macroeconomic Policy Sandbox

The policy simulator allows users to explore hypothetical infrastructure budget allocations.

Features include:

- Adjustable allocations across seven infrastructure sectors.
- A configurable vulnerability equity multiplier.
- Scenario comparison.
- Projected citizen satisfaction indicators.
- Estimated infrastructure-deficit reduction.
- SDG progress indicators.
- Illustrative economic multiplier estimates.

**Important:** Simulation results are scenario estimates, not guaranteed economic outcomes. Their reliability depends on the assumptions and data used.

### 7. AI Policy Copilot

The AI Copilot supports the preparation of policy and administrative documents.

It is designed to assist with:

- Executive policy briefs.
- Cabinet memorandum drafts.
- Procurement tender specifications.
- Citizen status notifications.
- Evidence-linked recommendations.
- Structured summaries of infrastructure priorities.

Generated documents should be reviewed by authorized officials before use.

### 8. Digital Public Goods Open Data Hub

CivicPulse emphasizes open standards and data interoperability.

Features include:

- GeoJSON exports following RFC 7946.
- CSV downloads.
- JSON-LD data representations.
- OpenAPI documentation.
- Swagger UI and ReDoc.
- Integration-friendly REST endpoints.
- Privacy-aware data export mechanisms.

These capabilities are intended to make civic data easier to exchange with GIS software and other public-sector systems.

---

## 🏗️ System Architecture

CivicPulse uses a modular architecture that connects citizen-facing interfaces, backend APIs, multilingual AI processing, geospatial analytics, decision intelligence, and open-data interoperability.

![CivicPulse System Architecture](assets/civicpulse-architecture.png)

*Figure 1: CivicPulse end-to-end system architecture.*

### Architecture Layers

**1. Multi-Modal Ingestion Layer**

Accepts citizen grievances through voice notes, web forms, messaging bots, SMS gateway simulations, and community petitions.

**2. Presentation Layer**

The React 19 frontend provides the citizen portal, GIS explorer, recommendation dashboard, expenditure auditor, policy simulator, AI Copilot, and Digital Public Goods hub.

**3. API and Application Layer**

FastAPI provides REST endpoints for citizen submissions, analytics, project recommendations, policy simulation, and open-data functionality.

**4. Multilingual NLP Layer**

Voice processing and NLP services handle transcription, language identification, translation, sector classification, and urgency analysis.

**5. Data Layer**

Regional baseline data, demographic information, infrastructure deficits, citizen complaints, and capital-project records supply inputs to the analytics services.

**6. Decision Intelligence Layer**

The backend contains specialized engines for DBSCAN hotspot detection, MCDA project ranking, spending-gap analysis, policy simulation, and AI-assisted document generation.

**7. Interoperability and Privacy Layer**

Standardized APIs and machine-readable exports support data exchange. Privacy mechanisms include coordinate jittering and personally identifiable information (PII) scrubbing where implemented.

### Request Flow

1. A citizen submits a grievance.
2. The backend validates and processes the submission.
3. NLP services extract structured information.
4. The data becomes available to relevant analytics services.
5. Geospatial and decision engines generate insights.
6. The frontend displays maps, recommendations, and policy indicators.
7. Authorized users can review results and export supported datasets.

---

## 🧰 Technology Stack

| Component | Technology |
|---|---|
| Frontend framework | React 19 |
| Frontend build tool | Vite |
| Programming languages | JavaScript, Python |
| Backend framework | FastAPI |
| API architecture | REST, HTTP/JSON |
| Data validation | Pydantic |
| Geospatial visualization | Leaflet |
| Spatial clustering | DBSCAN |
| Decision intelligence | Multi-Criteria Decision Analysis |
| Mapping data | GeoJSON |
| API documentation | OpenAPI, Swagger UI, ReDoc |
| Charts and icons | Chart.js, Lucide |
| Testing | Pytest |
| Deployment | Cloudflare Workers for frontend assets; separate API hosting for backend |

---

## 📂 Repository Structure

```text
CivicPulse/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints.py
│   │   ├── models/
│   │   │   └── schemas.py
│   │   ├── services/
│   │   │   ├── multilingual_nlp.py
│   │   │   ├── voice_processor.py
│   │   │   ├── data_store.py
│   │   │   ├── hotspot_engine.py
│   │   │   ├── recommendation_engine.py
│   │   │   ├── misalignment_engine.py
│   │   │   ├── policy_simulator.py
│   │   │   └── ai_copilot.py
│   │   └── main.py
│   ├── tests/
│   │   └── test_api.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── GISMap.jsx
│   │   │   ├── CitizenPortal.jsx
│   │   │   ├── RecommendationView.jsx
│   │   │   ├── MisalignmentView.jsx
│   │   │   ├── PolicySimulator.jsx
│   │   │   ├── AICopilotModal.jsx
│   │   │   └── DPGHub.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
├── assets/
│   └── civicpulse-architecture.png
│
├── README.md
├── SECURITY.md
├── LICENSE
├── NOTICE
├── COPYRIGHT
├── .gitignore
├── .nvmrc
├── package.json
└── wrangler.jsonc
```

*Note: The tree represents the documented project structure. Optional files and configuration may differ between repository versions.*

---

## ⚡ Quickstart and Running Locally

### Prerequisites

Install the following tools:

- Python 3.10 or later.
- Node.js 18 or later; Node.js 22 is selected by the root `.nvmrc` when supported by your environment.
- npm 9 or later.
- Git.

Check your installations:

```bash
python --version
node --version
npm --version
git --version
```

### Option 1: Run the Full Stack

From the project root:

```bash
npm install
npm run dev
```

The root development script is intended to start the frontend and backend concurrently.

Expected local addresses:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Option 2: Run the Backend Separately

Open a terminal:

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```

The backend API should be available at:

http://localhost:8000

Interactive API documentation:

http://localhost:8000/docs

Alternative API documentation:

http://localhost:8000/redoc

### Run Backend Tests

From the repository root:

```bash
python -m pytest backend/tests -v
```

The documented test suite is located at `backend/tests/test_api.py`.

### Option 3: Run the Frontend Separately

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:

http://localhost:5173

**Note:** If the frontend and backend use separate hosts, configure the frontend API base URL and backend CORS settings accordingly.

---

## ⚙️ Configuration and Environment Variables

Review `SECURITY.md` before configuring a production deployment.

The documented configuration includes:

| Variable | Purpose |
|---|---|
| `CIVICPULSE_ENV` | Controls the backend environment |
| `CIVICPULSE_ALLOWED_ORIGINS` | Configures permitted frontend origins |
| `CIVICPULSE_DEMO_MODE` | Enables or disables demonstration sign-in behavior |
| `VITE_API_BASE_URL` | Sets the frontend's backend API base URL |

For a production backend, configure appropriate values for the environment and allowed origins.

When deploying the frontend separately, set `VITE_API_BASE_URL` to the HTTPS API base, including `/api` if required by the application's routes.

Example:

```env
VITE_API_BASE_URL=https://api.example.org/api
```

This value becomes part of the public frontend bundle. **Never put passwords, private API keys, database credentials, or other secrets in a `VITE_` variable.**

Demonstration sign-in buttons rely on seeded backend accounts and should only be enabled for isolated evaluations. In-memory user and session storage are demonstration-only; real deployments require durable, shared storage and appropriate authentication and session management.

---

## ☁️ Deployment

### Frontend: Cloudflare Workers

The repository includes configuration for deploying the generated frontend assets through Cloudflare Workers.

Typical configuration:

- Repository root: `/`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

The root `.nvmrc` selects Node.js 22. The root build installs frontend dependencies using `frontend/package-lock.json` before building the frontend.

The `wrangler.jsonc` configuration serves the generated `frontend/dist` assets and supports the frontend's single-page application routes.

### Backend: FastAPI

The FastAPI backend must be deployed separately. The frontend Workers configuration does not implement the backend API.

For the backend deployment:

1. Install the Python dependencies.
2. Configure the production environment.
3. Configure allowed CORS origins.
4. Set up durable storage and production authentication.
5. Deploy the FastAPI application using a suitable Python hosting environment.
6. Configure the frontend's `VITE_API_BASE_URL` to point to the deployed API.
7. Verify API health, CORS, authentication, and application routes.

For production configuration, follow `SECURITY.md`.

---

## 🌐 Supported BRICS Nations and Regional Data

| Country | Example Regional Data | Primary Languages |
|---|---|---|
| 🇮🇳 India | Uttar Pradesh, Maharashtra, Bihar, Rajasthan, Kerala | Hindi, Marathi, Tamil, Bengali, Telugu, English |
| 🇧🇷 Brazil | Bahia, Amazonas, São Paulo, Minas Gerais | Portuguese |
| 🇿🇦 South Africa | Eastern Cape, KwaZulu-Natal, Western Cape | isiZulu, Afrikaans, isiXhosa, English |
| 🇨🇳 China | Sichuan, Guizhou, Shandong | Mandarin Chinese |
| 🇷🇺 Russia | Novgorod Oblast, Irkutsk Oblast, Sverdlovsk | Russian |

The regions listed above represent the documented regional baseline data. Actual geographic coverage and language-processing quality depend on the available datasets and configured processing services.

---

## 📊 Digital Public Goods and Interoperability

CivicPulse is designed around Digital Public Good principles and open interoperability.

Its documented design addresses the following areas:

1. **Open Licensing:** AGPL-3.0 and Apache License 2.0 are referenced in the project licensing documentation.
2. **Open Standards:** GeoJSON, OpenAPI, and Schema.org-compatible data representations.
3. **Open Data Extraction:** Machine-readable CSV and GeoJSON exports.
4. **Privacy Protection:** Coordinate jittering and PII scrubbing where implemented.
5. **Privacy Governance:** Production deployments must implement appropriate data protection and access controls.
6. **UN Sustainable Development Goals:** Alignment with SDGs 3, 4, 6, 7, 9, 10, 11, 13, and 16.
7. **Linguistic Inclusivity:** Multilingual voice and text submission workflows.
8. **Ethical Decision Support:** Transparent MCDA criteria and configurable weights.
9. **Interoperability:** Standardized APIs and machine-readable datasets.

These are design goals and documented capabilities, not a claim of independent DPGA certification or legal compliance. Any formal compliance claim should be supported by the applicable assessment and evidence.

---

## 🔒 Security and Responsible Use

CivicPulse handles potentially sensitive citizen grievances and location information. Responsible deployment should include:

- Input validation and appropriate request limits.
- Authentication and authorization for administrative operations.
- Secure session management.
- HTTPS for production traffic.
- Restricted CORS origins.
- PII minimization and privacy-aware exports.
- Appropriate retention and deletion policies.
- Protection of administrative and infrastructure data.
- Review of AI-generated policy documents before official use.
- Validation of demographic datasets and simulation assumptions.

Do not deploy demonstration accounts or in-memory authentication stores as a production identity system.

Review the repository's `SECURITY.md` for project-specific configuration guidance.

---

## 🧪 Testing

Run the backend test suite from the project root:

```bash
python -m pytest backend/tests -v
```

Check the API documentation after starting the backend:

```text
http://localhost:8000/docs
```

Recommended additional checks before a release:

- Validate frontend builds.
- Test citizen grievance submission.
- Test multilingual processing with representative inputs.
- Verify map rendering and GeoJSON exports.
- Validate MCDA rankings against known test cases.
- Check policy simulation boundaries.
- Test API error handling and invalid inputs.
- Verify production CORS and authentication configuration.

---

## 🛣️ Future Improvements

Potential development directions include:

- Production integrations for messaging and SMS providers.
- Expanded regional language and dialect coverage.
- Improved speech recognition for noisy recordings.
- Verified, regularly updated infrastructure datasets.
- More transparent and explainable prioritization models.
- Integration with authorized government data systems.
- Stronger authentication and role-based access control.
- Durable databases and audit logs.
- Model evaluation and bias testing.
- Better simulation calibration against historical outcomes.
- Accessibility improvements for low-bandwidth devices.
- Independent privacy, security, and interoperability assessments.

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run the relevant tests.
5. Commit your changes with a descriptive message.
6. Open a pull request describing the change and its impact.

Example:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "feat: describe your change"
git push origin feature/your-feature
```

Please avoid committing secrets, private citizen data, or real credentials.

---

## ⚖️ Copyright and License

Copyright (C) 2026 Praveen Reddy.

The project documentation references the GNU Affero General Public License v3.0 (AGPL-3.0) and Apache License 2.0.

Refer to the repository's `LICENSE`, `NOTICE`, and `COPYRIGHT` files for the exact licensing terms and notices.

**Important:** Dual licensing, attribution requirements, and any restrictions on proprietary use must be consistent with the actual license files. Review those files before making legal claims about the project's licensing or reuse.

---

## 👨‍💻 Author

**Praveen Reddy**

AI/ML Developer | Software Developer | Digital Public Goods Enthusiast

GitHub: [@reddy895](https://github.com/reddy895)

---

<p align="center">
  Built to help turn citizen voices into data-informed infrastructure decisions.
</p>
