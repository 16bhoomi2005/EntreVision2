# Data Collection Implementation Plan

## Overview
This document outlines the implementation plan for collecting all required data for EntreVision.

## P1 Priority Datasets (Start Here)

### ✅ D01: Agmarknet Daily Mandi Prices
- **Status**: COMPLETED
- **Access Method**: API
- **Format**: JSON/CSV
- **Difficulty**: Medium
- **Implementation**: `backend/app/modules/mandi/`
- **Notes**: API currently inaccessible, CSV import fallback available

### D02: Historical Mandi Prices
- **Status**: AVAILABLE - 30-day history on ACROP (not 10 years)
- **Access Method**: Web Scraping / Manual
- **Format**: HTML → CSV
- **Difficulty**: Medium
- **Source**: acrop.app (sources from AgMarkNet)
- **Available Data**: 
  - URL: https://acrop.app/prices/orange/maharashtra/nagpur
  - Provides 30-day history of daily prices
  - Includes: median mandi price, total arrival quantity, mandi-level prices
  - Shows 2 mandis: Nagpur APMC, Hingna APMC
- **Limitation**: Only 30 days of history (not the requested 10 years)
- **Download Steps**:
  1. Go to https://acrop.app/prices/orange/maharashtra/nagpur
  2. Scroll to "Median mandi price by date" section
  3. Select "30 days" view
  4. Copy the data from the table below the chart
  5. Alternatively, try web scraping the page for the data table
  6. Save to `data/raw/orange/acrop_30day_history.csv`
  7. Repeat for other districts if needed (Katol, Kalmeshwar, etc.)
- **Web Scraping Option**:
  - The page has a structured data table
  - Can scrape using BeautifulSoup/Selenium
  - Target the table with class containing price history
- **Plan**: 
  - Collect 30-day history from ACROP for Nagpur district
  - Store in PostgreSQL
  - Document limitation: only 30 days available, not 10 years
  - Use this data for short-term price trend analysis
  - For long-term seasonality, use current daily prices (D01) and assume patterns

### D04: PMFME Guidelines and Eligibility Rules
- **Status**: PDF downloaded and parsed; database storage and eligibility checker pending
- **Access Method**: PDF parser
- **Format**: PDF → Rules table
- **Difficulty**: Medium
- **Source**: pmfme.mofpi.gov.in
- **Download Location**: 
  - https://pmfme.mofpi.gov.in → Guidelines section
  - https://mofpi.gov.in → PMFME scheme documents
- **Download Steps**:
  1. Go to https://pmfme.mofpi.gov.in
  2. Navigate to "Guidelines" or "Scheme Guidelines"
  3. Download the latest PMFME operational guidelines PDF
  4. Also download from https://mofpi.gov.in → Schemes → PMFME
  5. Save the downloaded PDF as `data/guidelines.pdf`
- **Plan**:
  - Parse the provided PMFME operational-guidelines PDF with
    `backend/app/data_collection/collectors/pmfme_pdf_parser.py`
    (`cd backend && python -m app.data_collection.collectors.pmfme_pdf_parser`)
  - Write structured rules, including source clause and PDF page, to
    `data/proccessed/pmfme_rules_parsed.csv`
  - Store parsed rules in the database and create the eligibility checker
    (remaining implementation)

### D05: MIDH/NHB Cost Norms
- **Status**: Extracted 38 selected MIDH/NHB norms; database storage and project-specific applicability checks pending
- **Access Method**: Manual
- **Format**: PDF → Table
- **Difficulty**: Medium
- **Source**: midh.gov.in, nhb.gov.in
- **Download Location**: 
  - https://midh.gov.in → Common Guidelines
  - https://nhb.gov.in → Cost norms and schemes
- **Download Steps**:
  1. Go to https://midh.gov.in
  2. Navigate to "Guidelines" → "Common Guidelines for MIDH"
  3. Download the MIDH cost norms PDF
  4. Go to https://nhb.gov.in
  5. Navigate to "Schemes" → "Cost Norms"
  6. Download NHB cost norms PDF
  7. Save PDFs to `data/raw/financial/midh_nhb_norms.pdf`
- **Plan**:
  - Downloaded the official 99-page *MIDH Operational Guidelines 2025* from NHB
    (guidelines dated 31 December 2024) to `data/raw/financial/midh_nhb_norms.pdf`
  - Extracted selected nursery, pack-house, pre-cooling, cold-room, cold-storage,
    refrigerated-transport, and commercial-horticulture norms with annexure and
    PDF-page citations to `data/proccessed/midh_nhb_cost_norms.csv`
  - The NHB-specific Annexure VI entries include scheme-scale and capacity
    conditions; verify project applicability and store the norms in the database
    before using them in capex calculations

### D06: NABARD/AIF/CGTMSE/Mudra Loan Terms
- **Status**: NOT STARTED
- **Access Method**: Manual
- **Format**: Excel
- **Difficulty**: Medium
- **Source**: nabard.org, agriinfra.dac.gov.in, cgtmse.in
- **Download Location**: 
  - https://nabard.org (Model bankable projects, loan schemes)
  - https://agriinfra.dac.gov.in (AIF scheme details)
  - https://cgtmse.in (CGTMSE guarantee scheme)
  - https://mudra.org.in (Mudra loan schemes)
- **Download Steps**:
  1. Go to https://nabard.org → Model Bankable Projects
  2. Download 3-4 citrus-related project PDFs
  3. Extract loan terms from each (interest rate, tenure, margin, collateral)
  4. Go to https://agriinfra.dac.gov.in → AIF scheme
  5. Download AIF scheme guidelines PDF
  6. Go to https://cgtmse.in → CGTMSE scheme
  7. Download CGTMSE guarantee scheme terms
  8. Go to https://mudra.org.in → Mudra loan schemes
  9. Download Shishu, Kishore, Tarun loan terms
  10. Compile all terms into Excel: `data/raw/financial/loan_terms.xlsx`
  11. Add 2-3 bank offers (SBI, Bank of Maharashtra) as examples
- **Plan**:
  - Record terms from each scheme
  - Add bank offers as examples
  - Store with dates
  - Create loan options calculator

### D08: Equipment and Machinery Costs
- **Status**: NOT STARTED
- **Access Method**: Manual
- **Format**: Excel
- **Difficulty**: Medium
- **Source**: IndiaMART, GeM, vendor quotations
- **Download Location**: 
  - https://indiamart.com (Equipment suppliers)
  - https://gem.gov.in (Government e-Marketplace)
  - Local vendor websites and catalogs
- **Download Steps**:
  1. Create Excel file: `data/raw/financial/equipment_costs.xlsx`
  2. List 12-15 equipment items per business model (grader, extractor, pasteuriser, cold room, packing machine, etc.)
  3. For each item:
     - Search on https://indiamart.com for 3 suppliers
     - Search on https://gem.gov.in for government rates
     - Call/email 3 local vendors for quotations
     - Record: equipment, capacity, price (Rs), vendor, quote date, GST
  4. Store low/median/high prices with date
  5. Keep screenshots/quotes as proof in `data/raw/financial/equipment_quotes/`
- **Plan**:
  - List equipment items per business model
  - Get 3 quotes per item
  - Store low/median/high prices
  - Keep screenshots as proof

### D10: Reference DPR/Bankable Project Templates
- **Status**: NOT STARTED
- **Access Method**: Manual
- **Format**: PDF → Table
- **Difficulty**: Medium
- **Source**: nabard.org model projects
- **Download Location**: 
  - https://nabard.org (Model Bankable Projects section)
  - https://mofpi.gov.in (Sample DPRs)
  - https://nhb.gov.in (Project reports)
- **Download Steps**:
  1. Go to https://nabard.org → Model Bankable Projects
  2. Search for "citrus", "orange", "fruit processing"
  3. Download 8-10 model project PDFs close to your business models
  4. Go to https://mofpi.gov.in → Sample DPRs
  5. Download 2-3 sample DPRs for food processing
  6. Go to https://nhb.gov.in → Project Reports
  7. Download 2-3 horticulture project reports
  8. Save all PDFs to `data/raw/financial/reference_dprs/`
  9. Extract from each PDF: project, capacity, capex, working capital, revenue, margin, IRR, DSCR
  10. Compile into Excel: `data/raw/financial/dpr_calibration.xlsx`
- **Plan**:
  - Download 8-10 model projects
  - Extract capex, revenue, margins, IRR, DSCR
  - Use as calibration test cases
  - Validate engine outputs

## P2 Priority Datasets

### KVKs and CCRI Training Institutions
- **Status**: NOT STARTED
- **Access Method**: Manual
- **Format**: Excel
- **Difficulty**: Easy
- **Source**: ICAR KVK network, ICAR-CCRI, MCED, EDII
- **Download Location**: 
  - https://kvk.icar.gov.in (KVK directory)
  - https://ccri.org.in (Training programs section)
  - https://mced.gov.in (Entrepreneurship development)
  - https://ediindia.org (Training courses)

### D03: APEDA Citrus Export Data
- **Status**: NOT STARTED
- **Access Method**: Manual
- **Format**: Excel
- **Difficulty**: Medium
- **Source**: apeda.gov.in
- **Download Location**: 
  - https://apeda.gov.in (Export statistics section)
  - https://apeda.gov.in/apedawebsite/index.htm (Market intelligence)

### D07: Maharashtra State Schemes
- **Status**: NOT STARTED
- **Access Method**: Manual
- **Format**: Excel
- **Difficulty**: Medium
- **Source**: Maharashtra government departments
- **Download Location**: 
  - https://mahaagri.gov.in (Agriculture department schemes)
  - https://mahasheti.gov.in (Horticulture department schemes)
  - https://kvic.gov.in (CMEGP scheme)
  - https://maharashtra.gov.in (State schemes portal)

### D09: Benchmark Interest Rates
- **Status**: NOT STARTED
- **Access Method**: Download
- **Format**: CSV/Excel
- **Difficulty**: Easy
- **Source**: RBI, public sector banks
- **Download Location**: 
  - https://rbi.org.in (Monetary Policy section - repo rate)
  - https://sbi.co.in (Interest rates section)
  - https://bankofmaharashtra.in (Loan interest rates)

### D11: Licences and Registrations
- **Status**: NOT STARTED
- **Access Method**: Manual
- **Format**: Excel
- **Difficulty**: Easy
- **Source**: FSSAI, Udyam, MPCB, APMC, GST
- **Download Location**: 
  - https://fssai.gov.in (Food licence requirements)
  - https://udyamregistration.gov.in (MSME registration)
  - https://mpcb.gov.in (Pollution control board)
  - https://apmc.gov.in (Market licence)
  - https://gst.gov.in (GST registration)

### D12: Census/PLFS Demographics
- **Status**: NOT STARTED
- **Access Method**: Download
- **Format**: Excel/PDF
- **Difficulty**: Easy
- **Source**: Census of India, MoSPI PLFS
- **Download Location**: 
  - https://censusindia.gov.in (Primary Census Abstract - tehsil level)
  - https://mospi.gov.in (Periodic Labour Force Survey)
  - https://censusindia.gov.in/census.website/data/census-tables

## P3 Priority Datasets

### D13: Labour Wage Rates
- **Status**: NOT STARTED
- **Access Method**: Download
- **Format**: Excel
- **Difficulty**: Easy
- **Source**: Maharashtra Labour Dept, MGNREGA
- **Download Location**: 
  - https://labour.gov.in (Minimum wage notifications)
  - https://mahalabour.gov.in (Maharashtra minimum wages)
  - https://nrega.nic.in (MGNREGA wage rates)

### D14: Processed Citrus Market Size
- **Status**: NOT STARTED
- **Access Method**: Manual
- **Format**: Excel
- **Difficulty**: Hard
- **Source**: Industry reports, CCRI, APEDA, news
- **Download Location**: 
  - Industry research reports (McKinsey, Nielsen, etc.)
  - https://ccri.org.in (Research publications)
  - https://apeda.gov.in (Export reports)
  - News articles and press releases

## Implementation Strategy

### Phase 1: P1 Manual/Download Datasets (Quick Wins)
1. D04: PMFME Guidelines (PDF parsing)
2. D05: MIDH/NHB Cost Norms (PDF parsing)
3. D06: Loan Terms (Excel)
4. D08: Equipment Costs (Excel)
5. D10: Reference DPRs (PDF parsing)

### Phase 2: P1 Download Datasets
6. D02: Historical Mandi Prices (bulk download)

### Phase 3: P2 Datasets
7. All P2 datasets

### Phase 4: P3 Datasets
8. All P3 datasets

## Data Collection Framework

### Components
1. **Base Collector** (`app/data_collection/base_collector.py`)
   - Abstract base class
   - Common logging
   - Error handling
   - Summary reporting

2. **Task Tracker** (`app/data_collection/models.py`)
   - Track collection status
   - Last run times
   - Error tracking
   - Progress monitoring

3. **Specific Collectors**
   - One collector per dataset
   - Inherit from BaseCollector
   - Implement collect(), parse(), store()

4. **Scheduler Integration**
   - Add to APScheduler
   - Different schedules per dataset
   - Manual trigger support

### File Structure
```
backend/
├── app/
│   ├── data_collection/
│   │   ├── __init__.py
│   │   ├── models.py (task tracker)
│   │   ├── base_collector.py (base class)
│   │   ├── parser.py (parse requirements)
│   │   ├── collectors/
│   │   │   ├── __init__.py
│   │   │   ├── mandi_collector.py (D01 - done)
│   │   │   ├── historical_mandi_collector.py (D02)
│   │   │   ├── pmfme_collector.py (D04)
│   │   │   ├── midh_collector.py (D05)
│   │   │   ├── loan_terms_collector.py (D06)
│   │   │   ├── equipment_costs_collector.py (D08)
│   │   │   └── reference_dpr_collector.py (D10)
│   │   └── routes.py (API endpoints)
```

## Next Steps

1. **Re-export req.csv from the workbook's Datasets sheet** with all 20 source columns; the current file is locked by another process
2. **Complete D04 (PMFME Guidelines)** by loading the 53 extracted rules into the database and implementing the eligibility checker
3. **Complete D05 (MIDH/NHB Cost Norms)** by loading the 38 cited norms into the database and checking project-specific applicability
4. **Implement D06 (Loan Terms)** - Excel parsing
5. **Implement D08 (Equipment Costs)** - Excel with vendor quotes
6. **Implement D10 (Reference DPRs)** - PDF parsing
7. **Implement D02 (Historical Mandi)** - Bulk download and merge

## Required Dependencies

Add to requirements.txt:
```
pandas==2.2.0
openpyxl==3.1.2
PyPDF2==3.0.1
pdfplumber==0.10.3
tabula-py==2.9.0
```

## Notes

- All collectors should be idempotent
- Store raw data for audit trail
- Log all operations
- Handle errors gracefully
- Provide fallback options
- Track data quality metrics
