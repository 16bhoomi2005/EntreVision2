# PROJECT WORK LOG BOOK / TRAJECTORY RECORD

**Project Title:** EntreVision: Location-Aware AI Decision Support System and Automated DPR Synthesis for Citrus Agro-Enterprises  
**Department:** Information Technology, Xavier Institute of Engineering, Mumbai University  
**Academic Year:** 2025–2026  

---

| Entry # | Date Range | Phase / Module | Key Tasks Completed & Technical Milestones | Verification / Status | Guide Sign |
| :---: | :---: | :---: | :--- | :---: | :---: |
| **01** | *Week 1–2* | **Requirement Analysis & Domain Study** | • Analyzed post-harvest challenges in Nagpur Mandarin citrus clusters (Katol, Saoner, Narkhed).<br>• Studied Ministry of Food Processing Industries (MoFPI) guidelines & PMFME 35% subsidy patterns.<br>• Finalized problem statement, scope, and engineering deliverables. | Complete | [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ] |
| **02** | *Week 3–4* | **Dataset Collection & Schema Design** | • Curated 15 foundational CSV datasets: APMC mandi timeseries, tehsil distances, MSEDCL power tariffs, groundwater depth.<br>• Designed normalized relational schema in PostgreSQL.<br>• Built automated Agmarknet mandi price collector scripts in Python. | Complete | [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ] |
| **03** | *Week 5–6* | **Backend Architecture & API Setup** | • Configured FastAPI backend microservices with SQLAlchemy ORM and Pydantic validation.<br>• Implemented authentication and JWT session handling for user profiles.<br>• Established endpoints for mandi rates, opportunity catalogs, and resource requirements. | Complete | [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ] |
| **04** | *Week 7–8* | **Frontend UI & Opportunity Assessment** | • Built React (Vite) responsive UI with Tailwind styling and dark/light themes.<br>• Implemented multi-step Entrepreneur Assessment wizard (Personal Info, Capital, Land/Irrigation, Experience).<br>• Configured dynamic archetype mapper linking user inputs to viable agro models. | Complete | [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ] |
| **05** | *Week 9–10* | **Financial Engine & Waterfall Logic (M3)** | • Formulated `FinancialEngine.py` implementing PMFME/MIDH statutory calculations.<br>• Programmed 35% credit-linked capital subsidy logic (capped at ₹10 Lakhs) and promoter equity calculations.<br>• Built 5-year financial projection engine with WDV depreciation (15% machinery, 10% civil) and DSCR metrics. | Complete | [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ] |
| **06** | *Week 11–12* | **Agentic RAG & Text-to-SQL Advisor (M5)** | • Integrated Google Gemini API with RAG vector search across PMFME and MIDH policy PDFs.<br>• Implemented Text-to-SQL database querying agent for real-time spatial distances and tariffs.<br>• Connected interactive floating chatbot widget in React frontend. | Complete | [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ] |
| **07** | *Week 13–14* | **Bank-Grade MoFPI DPR Synthesis** | • Modeled DPR document after an authentic 24-page MoFPI Techno-Economic Feasibility Report.<br>• Structured comprehensive 11 chapters: Plant description, civil works, equipment specs, daily OpEx, and DSCR.<br>• Integrated cryptographic SHA-256 audit verification stamp and DRP signature blocks. | Complete | [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ] |
| **08** | *Week 15–16* | **Pagination, PDF Export & Dynamic Refinements** | • Solved browser single-page clipping via dedicated `@media print` unrolling and `.dpr-page-break`.<br>• Integrated `html2pdf.js` for instant one-click multi-page client-side PDF downloading.<br>• Scaled all daily material weights, production capacities, and equipment costs dynamically with user budget.<br>• Replaced premature clearance checkmarks with realistic pre-sanction compliance pipelines. | Complete | [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ] |

---

### Weekly Review & Guide Remarks Log
- **Review 1 (Progress Check):** System architecture approved; dataset normalization validated.
- **Review 2 (Mid-Term Assessment):** Recommendation algorithm and financial engine verified against PMFME norms.
- **Review 3 (Final Phase Preparation):** DPR synthesis and multi-page document export verified for bank submission compliance.
