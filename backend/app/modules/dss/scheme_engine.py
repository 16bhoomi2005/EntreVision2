"""
Scheme Eligibility Engine for Nagpur / Vidarbha Citrus & Agribusiness Ecosystem
Implements Phase 8 Requirements:
1. Verified scheme database with eligible categories, conditions, assistance %, caps, documents, portals, and audit dates.
2. Rule-based eligibility checker comparing user assessment against statutory requirements.
3. Three deterministic eligibility statuses:
   - "Potentially eligible"
   - "Not eligible based on known criteria"
   - "More information required"
4. Scheme-specific potential assistance calculation (capital subsidies, margin money, interest subvention).
5. Official application information (official portals, source documents, nodal agencies, document checklists).
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import date


# ============================================================================
# 1. SCHEMAS & DATA STRUCTURES
# ============================================================================

class DocumentRequirement(BaseModel):
    document_id: str
    name: str
    profile_key: str
    is_mandatory: bool = True
    description: str


class EligibilityRuleCondition(BaseModel):
    rule_key: str
    label: str
    requirement: str
    status: str = "satisfied"  # "satisfied" | "failed" | "info_needed"
    user_value: Optional[str] = None
    notes: Optional[str] = None


class SchemeProfile(BaseModel):
    scheme_code: str
    scheme_name: str
    short_name: str
    department: str
    category: str
    eligible_business_categories: List[str]
    assistance_percentage: float
    max_subsidy_amount: float
    min_promoter_contribution_rate: float
    official_website: str
    source_document: str
    clause_number: Optional[str] = None
    nodal_agency: str
    processing_period: str
    last_verified_date: str
    is_active: bool = True
    description: str
    assistance_points: List[str]
    required_documents: List[DocumentRequirement]
    eligibility_conditions: Dict[str, Any]


class UserAssessmentInput(BaseModel):
    business_name: Optional[str] = "Citrus Enterprise"
    business_category: str = "food_processing"  # e.g. food_processing, citrus_nursery, cold_storage, sorting_grading, peel_oil, compost
    project_cost_inr: float = 2000000.0        # ₹20.0 Lakhs default
    available_capital_inr: float = 200000.0    # ₹2.0 Lakhs promoter contribution default
    has_land: bool = True
    land_acres: float = 2.0
    location_type: str = "rural"               # "rural" | "urban"
    tehsil: str = "Katol"
    district: str = "Nagpur"
    state: str = "Maharashtra"
    social_category: str = "General"           # "General" | "OBC" | "SC" | "ST" | "Women" | "Minority"
    applicant_age: int = 32
    education: str = "Graduate"                # "Below 8th" | "8th Pass" | "10th Pass" | "12th Pass" | "Graduate"
    is_greenfield: bool = True                 # New unit
    has_prior_subsidy: bool = False
    has_bank_sanction: bool = False
    has_fssai_commitment: bool = True
    has_water_source: bool = True


class SchemeEligibilityResult(BaseModel):
    scheme_code: str
    scheme_name: str
    short_name: str
    department: str
    status: str  # "Potentially eligible" | "Not eligible based on known criteria" | "More information required"
    status_code: str  # "POTENTIALLY_ELIGIBLE" | "NOT_ELIGIBLE" | "MORE_INFO_REQUIRED"
    match_score: int  # 0 to 100
    
    # Financial assistance
    eligible_project_cost: float
    assistance_percentage: float
    calculated_subsidy_amount: float
    calculated_subsidy_lakhs: float
    min_promoter_contribution_required: float
    estimated_bank_loan: float
    interest_subvention_annual: Optional[float] = None
    calculation_formula: str
    
    # Detailed rule verification
    rule_verifications: List[EligibilityRuleCondition]
    reasons: List[str]
    disqualification_reasons: List[str]
    missing_requirements: List[str]
    
    # Official application data
    official_website: str
    source_document: str
    nodal_agency: str
    processing_period: str
    last_verified_date: str
    required_documents: List[DocumentRequirement]


# ============================================================================
# 2. MASTER VERIFIED SCHEME DATABASE
# ============================================================================

MASTER_SCHEME_DATABASE: List[SchemeProfile] = [
    SchemeProfile(
        scheme_code="PMFME-001",
        scheme_name="Pradhan Mantri Formalisation of Micro food processing Enterprises (PMFME)",
        short_name="PMFME Scheme",
        department="Ministry of Food Processing Industries (MoFPI) & Govt of Maharashtra",
        category="Central Sector Credit-Linked Capital Subsidy",
        eligible_business_categories=[
            "food_processing",
            "citrus_juice",
            "citrus_processing",
            "citrus_peel_oil",
            "marmalade_jam",
            "cold_pressed_juice",
            "value_addition",
            "sorting_grading",
            "packhouse",
            "micro_cold_storage"
        ],
        assistance_percentage=0.35,
        max_subsidy_amount=1000000.0,  # ₹10 Lakhs ceiling
        min_promoter_contribution_rate=0.10,  # 10% promoter equity
        official_website="https://mofpi.gov.in/pmfme",
        source_document="MoFPI PMFME Scheme Guidelines 2024-2026 (Clause 4.2.1 - Capital Subsidy)",
        clause_number="Clause 4.2.1",
        nodal_agency="Maharashtra State Agricultural Marketing Board (MSAMB) & DIC Nagpur",
        processing_period="30 to 45 working days for District Level Committee (DLC) sanction",
        last_verified_date="2026-04-15",
        is_active=True,
        description="Flagship central ODOP scheme providing 35% credit-linked capital subsidy (capped at ₹10 Lakhs) for micro food processing enterprises, citrus juice, and value-addition units in Nagpur.",
        assistance_points=[
            "35% credit-linked capital subsidy for plant machinery, processing equipment, and food-grade civil infrastructure.",
            "Maximum subsidy ceiling of ₹10.0 Lakhs per individual micro-enterprise.",
            "Mandatory 10% minimum beneficiary equity, with remaining financed via bank term loan.",
            "Free technical EDP and food processing training through District Resource Persons (DRP).",
            "Convergence permitted with AIF 3% interest subvention."
        ],
        required_documents=[
            DocumentRequirement(document_id="doc_aadhaar", name="Aadhaar Card of Applicant", profile_key="identity", is_mandatory=True, description="Government UIDAI proof of identity"),
            DocumentRequirement(document_id="doc_pan", name="PAN Card of Enterprise / Applicant", profile_key="pan", is_mandatory=True, description="Income tax identification"),
            DocumentRequirement(document_id="doc_bank_stmt", name="Bank Statement / Passbook (6 Months)", profile_key="financial", is_mandatory=True, description="Operating bank statement"),
            DocumentRequirement(document_id="doc_dpr", name="Detailed Project Report (DPR) / EntreVision Blueprint", profile_key="dpr", is_mandatory=True, description="Technical and financial bankable DPR"),
            DocumentRequirement(document_id="doc_land_lease", name="Land 7/12 Extract or Registered Lease (Min 3 Years)", profile_key="land", is_mandatory=True, description="Premises ownership or tenancy proof"),
            DocumentRequirement(document_id="doc_fssai", name="FSSAI Registration / Food Safety Commitment", profile_key="fssai", is_mandatory=False, description="Food safety compliance pledge"),
            DocumentRequirement(document_id="doc_udyam", name="Udyam MSME Registration Certificate", profile_key="udyam", is_mandatory=False, description="Micro enterprise registration certificate")
        ],
        eligibility_conditions={
            "min_age": 18,
            "business_types": ["food_processing", "citrus_juice", "value_addition", "sorting_grading", "packhouse", "cold_storage"],
            "max_project_cost": 50000000.0,
            "min_promoter_margin": 0.10,
            "requires_bank_loan": True,
            "requires_fssai": True
        }
    ),
    SchemeProfile(
        scheme_code="MIDH-NHB-002",
        scheme_name="Mission for Integrated Development of Horticulture / National Horticulture Board (MIDH/NHB)",
        short_name="MIDH / NHB Horticulture Subsidy",
        department="Ministry of Agriculture & Farmers Welfare & National Horticulture Board (NHB)",
        category="Central Horticulture Infrastructure Subsidy",
        eligible_business_categories=[
            "citrus_nursery",
            "nursery",
            "horticulture",
            "cold_storage",
            "packhouse",
            "sorting_grading",
            "ripening_chamber",
            "controlled_atmosphere"
        ],
        assistance_percentage=0.35,  # 35% base (50% for high-tech mother nursery)
        max_subsidy_amount=5000000.0,  # Up to ₹50 Lakhs for commercial cold chain / ₹25 Lakhs for nursery
        min_promoter_contribution_rate=0.20,
        official_website="https://nhb.gov.in",
        source_document="NHB Commercial Horticulture Development Guidelines 2024-2026 (Scheme 1 & Scheme 2)",
        clause_number="Section 3.2 - Post-Harvest & Nursery Management",
        nodal_agency="National Horticulture Board (NHB) Nagpur Office / Commissioner of Agriculture Maharashtra",
        processing_period="60 to 90 days (Joint Inspection Committee Technical Audit)",
        last_verified_date="2026-03-01",
        is_active=True,
        description="Comprehensive capital investment subsidy providing 50% assistance for certified disease-free citrus nurseries (up to ₹25L) and 35% for farm-gate sorting packhouses and CA cold storage units (up to ₹50L).",
        assistance_points=[
            "50% capital subsidy for high-tech certified mother nurseries and shade-net polyhouse propagation.",
            "35% credit-linked back-ended subsidy for integrated packhouses, mechanized grading & waxing lines.",
            "35% subsidy for multi-chamber controlled atmosphere cold storages up to 5,000 MT capacity.",
            "Assistance for automated micro-irrigation and fertigation infrastructure."
        ],
        required_documents=[
            DocumentRequirement(document_id="doc_aadhaar", name="Aadhaar Card", profile_key="identity", is_mandatory=True, description="Applicant identification"),
            DocumentRequirement(document_id="doc_land_712", name="Land 7/12 Extract (Minimum 1.0 Acre)", profile_key="land", is_mandatory=True, description="Clear land title with unencumbered ownership"),
            DocumentRequirement(document_id="doc_water_soil", name="Water & Soil Quality Test Certificate", profile_key="soil_test", is_mandatory=True, description="Certified ICAR/NABL lab test"),
            DocumentRequirement(document_id="doc_dpr_nhb", name="Bank-Appraised DPR with Civil Engineering Blueprint", profile_key="dpr", is_mandatory=True, description="Chartered engineer vetted layout"),
            DocumentRequirement(document_id="doc_bank_sanction", name="Bank Term Loan In-Principle Sanction Letter", profile_key="financial", is_mandatory=True, description="Bank credit sanction"),
            DocumentRequirement(document_id="doc_nursery_cert", name="ICAR-CCRI Technical Nursery Training Certificate", profile_key="ccri_cert", is_mandatory=False, description="Horticulture accreditation certificate")
        ],
        eligibility_conditions={
            "min_age": 18,
            "min_land_acres": 1.0,
            "requires_land": True,
            "business_types": ["citrus_nursery", "nursery", "cold_storage", "packhouse", "sorting_grading"],
            "requires_bank_loan": True,
            "requires_water_source": True
        }
    ),
    SchemeProfile(
        scheme_code="PMEGP-004",
        scheme_name="Prime Minister's Employment Generation Programme (PMEGP)",
        short_name="PMEGP MSME Margin Money",
        department="Ministry of MSME & Khadi and Village Industries Commission (KVIC)",
        category="Credit-Linked MSME Margin Money Subsidy",
        eligible_business_categories=[
            "citrus_peel_oil",
            "essential_oil",
            "marmalade_jam",
            "compost",
            "bio_fertilizer",
            "custom_hiring",
            "manufacturing",
            "agro_processing",
            "services"
        ],
        assistance_percentage=0.25,  # 25% rural general, 35% rural special, 15% urban general
        max_subsidy_amount=1750000.0,  # 35% of ₹50 Lakhs manufacturing max
        min_promoter_contribution_rate=0.10,  # 10% general, 5% special
        official_website="https://www.kviconline.gov.in/pmegpeportal",
        source_document="KVIC PMEGP Operational Scheme Guidelines (Revised 2024-2026)",
        clause_number="Operational Guidelines Clause 2.1 & 3.4",
        nodal_agency="KVIC / KVIB / District Industries Centre (DIC) Nagpur",
        processing_period="30 to 60 days (Task Force Committee interview + Bank sanction)",
        last_verified_date="2026-02-20",
        is_active=True,
        description="Credit-linked subsidy programme to generate self-employment by establishing new micro-enterprises in manufacturing and services, offering up to 35% margin money subsidy in rural areas.",
        assistance_points=[
            "25% margin money subsidy for General Category in rural areas (35% for SC/ST/OBC/Women/Minorities).",
            "15% margin money subsidy in urban areas for General Category (25% for special categories).",
            "Project cost ceiling up to ₹50 Lakhs for manufacturing units and ₹20 Lakhs for service units.",
            "Promoter contribution only 10% for general category and 5% for special categories.",
            "Mandatory free Entrepreneurship Development Programme (EDP) training conducted online."
        ],
        required_documents=[
            DocumentRequirement(document_id="doc_aadhaar", name="Aadhaar Card", profile_key="identity", is_mandatory=True, description="Identity proof"),
            DocumentRequirement(document_id="doc_edu_proof", name="Educational Proof (Min 8th Pass for >₹10L)", profile_key="education", is_mandatory=True, description="School leaving / 8th / 10th marksheet"),
            DocumentRequirement(document_id="doc_rural_cert", name="Rural Area Certificate / Gram Panchayat NOC", profile_key="rural_cert", is_mandatory=True, description="Proof that project is sited in rural jurisdiction"),
            DocumentRequirement(document_id="doc_caste_cert", name="Caste / Category Certificate (for Special 35% rate)", profile_key="caste_cert", is_mandatory=False, description="SC/ST/OBC/Minority verification"),
            DocumentRequirement(document_id="doc_dpr_pmegp", name="Project Summary DPR", profile_key="dpr", is_mandatory=True, description="EntreVision project cost summary")
        ],
        eligibility_conditions={
            "min_age": 18,
            "min_education_manufacturing_gt_10l": "8th Pass",
            "max_project_cost_manufacturing": 5000000.0,
            "max_project_cost_services": 2000000.0,
            "greenfield_only": True,
            "business_types": ["manufacturing", "agro_processing", "citrus_peel_oil", "essential_oil", "marmalade_jam", "compost", "bio_fertilizer", "custom_hiring", "services"]
        }
    ),
    SchemeProfile(
        scheme_code="AIF-003",
        scheme_name="Agriculture Infrastructure Fund (AIF)",
        short_name="AIF Interest Subvention",
        department="Department of Agriculture and Farmers Welfare (DA&FW)",
        category="Interest Subvention & Credit Guarantee",
        eligible_business_categories=[
            "post_harvest",
            "cold_storage",
            "packhouse",
            "sorting_grading",
            "warehousing",
            "primary_processing",
            "custom_hiring",
            "citrus_juice",
            "food_processing"
        ],
        assistance_percentage=0.03,  # 3% interest subvention p.a.
        max_subsidy_amount=20000000.0,  # ₹2.0 Crores subsidized loan amount
        min_promoter_contribution_rate=0.10,
        official_website="https://agriinfra.dac.gov.in",
        source_document="DA&FW Operational Guidelines for Agriculture Infrastructure Fund (Clause 3.1)",
        clause_number="Clause 3.1 & 3.2",
        nodal_agency="PMU National Agriculture Infra Fund & All Scheduled Commercial Banks",
        processing_period="15 to 30 working days via national portal routing",
        last_verified_date="2026-01-15",
        is_active=True,
        description="Medium-to-long term debt financing facility providing 3% per annum interest subvention on bank term loans up to ₹2.0 Crores for 7 years plus full CGTMSE credit guarantee fee coverage for post-harvest infrastructure.",
        assistance_points=[
            "3% per annum interest subvention on term loans up to ₹2.0 Crores for a maximum of 7 years.",
            "Credit guarantee coverage under CGTMSE for loans up to ₹2.0 Crores with fee paid by Government.",
            "Full convergence permitted with Central/State capital subsidies (e.g. PMFME + AIF or MIDH + AIF).",
            "Fast-track single-window digital loan application routed directly to selected commercial bank."
        ],
        required_documents=[
            DocumentRequirement(document_id="doc_aadhaar", name="Aadhaar Card", profile_key="identity", is_mandatory=True, description="Applicant ID"),
            DocumentRequirement(document_id="doc_pan", name="PAN Card", profile_key="pan", is_mandatory=True, description="Tax ID"),
            DocumentRequirement(document_id="doc_dpr_aif", name="EntreVision Detailed Project Report (DPR)", profile_key="dpr", is_mandatory=True, description="Feasibility report with cash flows"),
            DocumentRequirement(document_id="doc_bank_kyc", name="KYC & 1-Year Bank Statement", profile_key="financial", is_mandatory=True, description="Financial standing evidence"),
            DocumentRequirement(document_id="doc_land_title", name="Land Ownership / Registered Lease (Min 10 Years)", profile_key="land", is_mandatory=True, description="Tenure security for asset creation")
        ],
        eligibility_conditions={
            "min_age": 18,
            "business_types": ["post_harvest", "cold_storage", "packhouse", "sorting_grading", "warehousing", "primary_processing", "custom_hiring"],
            "requires_bank_loan": True,
            "max_subsidized_loan": 20000000.0
        }
    ),
    SchemeProfile(
        scheme_code="CMEGP-MH-005",
        scheme_name="Chief Minister's Employment Generation Programme (Maha CMEGP)",
        short_name="Maha CMEGP Scheme",
        department="Directorate of Industries, Government of Maharashtra",
        category="Maharashtra State Capital Subsidy",
        eligible_business_categories=[
            "citrus_juice",
            "citrus_nursery",
            "citrus_peel_oil",
            "sorting_grading",
            "agro_processing",
            "manufacturing",
            "services"
        ],
        assistance_percentage=0.25,  # 25% base in rural, up to 35% for reserved/women
        max_subsidy_amount=1750000.0,  # 35% of ₹50 Lakhs manufacturing max
        min_promoter_contribution_rate=0.10,  # 5% for reserved, 10% for general
        official_website="https://maha-cmegp.gov.in",
        source_document="Govt of Maharashtra Industries Department GR CMEGP-2024/CR-12",
        clause_number="GR Annexure A - Vidarbha Special Package",
        nodal_agency="District Industries Centre (DIC) Nagpur / KVIB",
        processing_period="30 to 45 working days",
        last_verified_date="2026-03-10",
        is_active=True,
        description="Maharashtra State flagship scheme offering 15% to 35% capital subsidy for new micro-enterprises in Vidarbha, with special priority for agro-processing and orange value-addition clusters.",
        assistance_points=[
            "25% capital subsidy for General Category in rural Vidarbha (35% for Women, SC/ST, and OBC).",
            "15% capital subsidy in urban areas (25% for special categories).",
            "Manufacturing project cost ceiling up to ₹50 Lakhs (Service up to ₹20 Lakhs).",
            "Beneficiary equity only 5% for special categories (10% for general category).",
            "Mandatory Maharashtra State Domicile requirement."
        ],
        required_documents=[
            DocumentRequirement(document_id="doc_aadhaar", name="Aadhaar Card", profile_key="identity", is_mandatory=True, description="Applicant ID"),
            DocumentRequirement(document_id="doc_domicile", name="Maharashtra Domicile Certificate", profile_key="domicile", is_mandatory=True, description="Mandatory state residency proof"),
            DocumentRequirement(document_id="doc_edu_marksheet", name="Educational Proof (Min 7th Pass; 10th for >₹25L)", profile_key="education", is_mandatory=True, description="School leaving certificate"),
            DocumentRequirement(document_id="doc_dpr_cmegp", name="Detailed Project Report (DPR)", profile_key="dpr", is_mandatory=True, description="EntreVision business plan"),
            DocumentRequirement(document_id="doc_pan_card", name="PAN Card", profile_key="pan", is_mandatory=True, description="PAN proof")
        ],
        eligibility_conditions={
            "min_age": 18,
            "max_age_general": 45,
            "max_age_special": 50,
            "requires_maharashtra_domicile": True,
            "min_education": "7th Pass",
            "max_project_cost_manufacturing": 5000000.0,
            "max_project_cost_services": 2000000.0,
            "business_types": ["manufacturing", "agro_processing", "citrus_juice", "citrus_peel_oil", "citrus_nursery", "sorting_grading", "services"]
        }
    ),
    SchemeProfile(
        scheme_code="KUSUM-006",
        scheme_name="PM-KUSUM / MahaUrja Solar Agro-Cold Storage & Pumping Scheme",
        short_name="MahaUrja Solar Grant",
        department="Maharashtra Energy Development Agency (MEDA) & MNRE",
        category="Renewable Energy Capital Grant",
        eligible_business_categories=[
            "cold_storage",
            "micro_cold_storage",
            "citrus_nursery",
            "sorting_grading",
            "solar_pumping"
        ],
        assistance_percentage=0.60,  # 60% to 90% capital grant
        max_subsidy_amount=450000.0,  # ₹4.5 Lakhs
        min_promoter_contribution_rate=0.10,
        official_website="https://www.mahaurja.com",
        source_document="MEDA PM-KUSUM Component-C & Solar Cold Chain Guidelines 2025",
        clause_number="Clause 4 - Micro Agro Solar Infrastructure",
        nodal_agency="Maharashtra Energy Development Agency (MEDA) Nagpur Divisional Office",
        processing_period="45 to 60 working days",
        last_verified_date="2026-01-10",
        is_active=True,
        description="Capital grant providing up to 60%-90% assistance for solarizing micro cold storage chambers and solar pump installations, cutting farm operating electricity costs to zero.",
        assistance_points=[
            "Up to 60% subsidy on solar PV energized micro cold storage kits (up to ₹4.5 Lakhs).",
            "Direct subsidy credit through MEDA portal to empaneled solar equipment vendors.",
            "Guarantees continuous chilling during rural grid load-shedding hours."
        ],
        required_documents=[
            DocumentRequirement(document_id="doc_aadhaar", name="Aadhaar Card", profile_key="identity", is_mandatory=True, description="Applicant ID"),
            DocumentRequirement(document_id="doc_land_712", name="Land 7/12 Extract Showing Water Source", profile_key="land", is_mandatory=True, description="Land ownership extract"),
            DocumentRequirement(document_id="doc_msedcl_noc", name="MSEDCL Electricity NOC / Agri Pump Status", profile_key="electricity_noc", is_mandatory=True, description="DISCOM verification"),
            DocumentRequirement(document_id="doc_bank_passbook", name="Bank Account Passbook", profile_key="financial", is_mandatory=True, description="Bank details for direct benefit disbursement")
        ],
        eligibility_conditions={
            "requires_land": True,
            "requires_water_source": True,
            "business_types": ["cold_storage", "micro_cold_storage", "citrus_nursery", "sorting_grading", "solar_pumping"]
        }
    ),
    SchemeProfile(
        scheme_code="MUDRA-007",
        scheme_name="Pradhan Mantri Mudra Yojana (PMMY)",
        short_name="Mudra Loan (Kishore / Tarun)",
        department="Department of Financial Services (DFS), Ministry of Finance",
        category="Collateral-Free Institutional Credit",
        eligible_business_categories=[
            "micro_enterprise",
            "trading",
            "citrus_processing",
            "small_scale_packaging",
            "citrus_juice",
            "marmalade_jam",
            "services"
        ],
        assistance_percentage=0.0,  # Pure debt with zero processing fee and concession
        max_subsidy_amount=1000000.0,  # Max ₹10.0 Lakhs credit under Tarun
        min_promoter_contribution_rate=0.10,
        official_website="https://www.mudra.org.in",
        source_document="DFS PMMY Operational Guidelines 2024-2025",
        clause_number="Clause 2.1 - Kishore & Tarun Loan Tiers",
        nodal_agency="All Member Lending Institutions (Public / Private Commercial Banks, RRBs)",
        processing_period="7 to 15 working days",
        last_verified_date="2026-02-01",
        is_active=True,
        description="Collateral-free institutional debt facility for non-farm micro and small enterprises up to ₹10.0 Lakhs (Shishu up to ₹50k, Kishore up to ₹5L, Tarun up to ₹10L).",
        assistance_points=[
            "No collateral security or third-party guarantee required.",
            "Zero processing fee for Shishu and Kishore loans (up to ₹5 Lakhs).",
            "Tenure up to 5 to 7 years with flexible repayment tailored to agro cash cycles."
        ],
        required_documents=[
            DocumentRequirement(document_id="doc_aadhaar", name="Aadhaar Card", profile_key="identity", is_mandatory=True, description="Identity proof"),
            DocumentRequirement(document_id="doc_pan", name="PAN Card", profile_key="pan", is_mandatory=True, description="Tax ID"),
            DocumentRequirement(document_id="doc_quotation", name="Quotations for Machinery / Raw Material", profile_key="quotations", is_mandatory=True, description="Vendor proforma invoices"),
            DocumentRequirement(document_id="doc_udyam", name="Udyam MSME Registration Certificate", profile_key="udyam", is_mandatory=False, description="MSME registration")
        ],
        eligibility_conditions={
            "max_project_cost": 1000000.0,
            "min_age": 18,
            "business_types": ["micro_enterprise", "trading", "citrus_processing", "small_scale_packaging", "citrus_juice", "marmalade_jam", "services"]
        }
    ),
    SchemeProfile(
        scheme_code="STANDUP-008",
        scheme_name="Stand-Up India Scheme for SC/ST and Women Entrepreneurs",
        short_name="Stand-Up India Loan",
        department="Department of Financial Services (DFS), Ministry of Finance",
        category="Composite Bank Financing for Reserved & Women Entrepreneurs",
        eligible_business_categories=[
            "manufacturing",
            "agro_processing",
            "citrus_juice",
            "citrus_peel_oil",
            "cold_storage",
            "packhouse",
            "services"
        ],
        assistance_percentage=0.15,  # Margin money convergence (loan up to 85%)
        max_subsidy_amount=10000000.0,  # ₹1.0 Crore max loan
        min_promoter_contribution_rate=0.15,  # 15% margin money
        official_website="https://www.standupmitra.in",
        source_document="DFS Stand-Up India Scheme Guidelines Revised 2024",
        clause_number="Clause 3 - Beneficiary Eligibility & Margin Money",
        nodal_agency="Scheduled Commercial Banks & SIDBI Stand-Up Mitra Portal",
        processing_period="21 to 45 working days",
        last_verified_date="2026-01-20",
        is_active=True,
        description="Composite term loan + working capital financing between ₹10 Lakhs and ₹100 Lakhs for greenfield enterprises founded by SC, ST, or Women entrepreneurs.",
        assistance_points=[
            "Bank financing covering 75% to 85% of project cost for loans between ₹10 Lakhs and ₹1 Crore.",
            "Can converge with Central/State capital subsidies to cover the 15% borrower margin money.",
            "Handholding support via Stand-Up Mitra portal for DPR and vendor quotations."
        ],
        required_documents=[
            DocumentRequirement(document_id="doc_aadhaar", name="Aadhaar Card", profile_key="identity", is_mandatory=True, description="Applicant ID"),
            DocumentRequirement(document_id="doc_caste_or_gender", name="Caste Certificate (for SC/ST) or Woman Ownership Proof", profile_key="caste_cert", is_mandatory=True, description="Reserved category verification"),
            DocumentRequirement(document_id="doc_greenfield_proof", name="Greenfield Enterprise Affidavit", profile_key="greenfield_affidavit", is_mandatory=True, description="First-time venture declaration"),
            DocumentRequirement(document_id="doc_dpr_standup", name="EntreVision DPR with Financial Projections", profile_key="dpr", is_mandatory=True, description="Project appraisal report")
        ],
        eligibility_conditions={
            "min_age": 18,
            "min_project_cost": 1000000.0,
            "max_project_cost": 10000000.0,
            "requires_sc_st_or_women": True,
            "greenfield_only": True,
            "business_types": ["manufacturing", "agro_processing", "citrus_juice", "citrus_peel_oil", "cold_storage", "packhouse", "services"]
        }
    )
]


# ============================================================================
# 3. SCHEME ELIGIBILITY EVALUATION FUNCTION
# ============================================================================

def normalize_business_category(cat_str: str) -> str:
    """Standardizes business activity strings to match scheme eligibility rules"""
    c = cat_str.lower().strip()
    if any(k in c for k in ["juice", "beverage", "rts", "squash"]):
        return "citrus_juice"
    elif any(k in c for k in ["nursery", "seedling", "propagation", "horticulture"]):
        return "citrus_nursery"
    elif any(k in c for k in ["peel", "oil", "pectin", "essential"]):
        return "citrus_peel_oil"
    elif any(k in c for k in ["cold", "storage", "ripening"]):
        return "cold_storage"
    elif any(k in c for k in ["sort", "grad", "pack", "wax"]):
        return "sorting_grading"
    elif any(k in c for k in ["compost", "fertilizer", "bio"]):
        return "compost"
    elif any(k in c for k in ["marmalade", "jam", "candy"]):
        return "marmalade_jam"
    elif any(k in c for k in ["hiring", "custom", "tractor", "machine"]):
        return "custom_hiring"
    elif any(k in c for k in ["food", "process"]):
        return "food_processing"
    elif any(k in c for k in ["manufact"]):
        return "manufacturing"
    return "agro_processing"


def evaluate_single_scheme(scheme: SchemeProfile, user: UserAssessmentInput) -> SchemeEligibilityResult:
    """
    Step 2 & 3: Compare user assessment against the selected scheme requirements.
    Deterministic evaluation producing one of the 3 specified statuses:
    - "Potentially eligible"
    - "Not eligible based on known criteria"
    - "More information required"
    Step 4: Scheme-specific potential assistance calculation.
    Step 5: Full official application information.
    """
    rule_verifications: List[EligibilityRuleCondition] = []
    reasons: List[str] = []
    disqualification_reasons: List[str] = []
    missing_requirements: List[str] = []
    
    conds = scheme.eligibility_conditions
    user_cat_normalized = normalize_business_category(user.business_category)
    
    # ----------------------------------------------------
    # Check 1: Business Category Fit
    # ----------------------------------------------------
    cat_match = False
    if user_cat_normalized in scheme.eligible_business_categories or "all" in scheme.eligible_business_categories:
        cat_match = True
    elif user.business_category.lower() in [c.lower() for c in scheme.eligible_business_categories]:
        cat_match = True
    elif "agro_processing" in scheme.eligible_business_categories and user_cat_normalized in ["citrus_juice", "citrus_peel_oil", "marmalade_jam", "food_processing"]:
        cat_match = True
    elif "post_harvest" in scheme.eligible_business_categories and user_cat_normalized in ["cold_storage", "sorting_grading"]:
        cat_match = True
        
    if cat_match:
        rule_verifications.append(EligibilityRuleCondition(
            rule_key="business_type",
            label="Eligible Activity",
            requirement=f"Permitted categories: {', '.join(scheme.eligible_business_categories[:4])}...",
            status="satisfied",
            user_value=user.business_category,
            notes="Business activity falls within scheme approved mandate."
        ))
        reasons.append(f"Proposed activity '{user.business_category}' is eligible under {scheme.short_name}.")
    else:
        rule_verifications.append(EligibilityRuleCondition(
            rule_key="business_type",
            label="Eligible Activity",
            requirement=f"Permitted categories: {', '.join(scheme.eligible_business_categories[:4])}",
            status="failed",
            user_value=user.business_category,
            notes="Activity is outside the statutory mandate of this scheme."
        ))
        disqualification_reasons.append(
            f"Business activity '{user.business_category}' is not covered. Scheme requires: {', '.join(scheme.eligible_business_categories[:3])}."
        )

    # ----------------------------------------------------
    # Check 2: Applicant Age
    # ----------------------------------------------------
    min_age = conds.get("min_age", 18)
    if user.applicant_age >= min_age:
        # Check max age for CMEGP
        max_age = conds.get("max_age_special" if user.social_category in ["SC", "ST", "OBC", "Women"] else "max_age_general", 99)
        if user.applicant_age <= max_age:
            rule_verifications.append(EligibilityRuleCondition(
                rule_key="age_limit",
                label="Age Criterion",
                requirement=f"Age between {min_age} and {max_age} years",
                status="satisfied",
                user_value=f"{user.applicant_age} years",
                notes="Age criteria satisfied."
            ))
        else:
            rule_verifications.append(EligibilityRuleCondition(
                rule_key="age_limit",
                label="Age Criterion",
                requirement=f"Maximum age limit is {max_age} years",
                status="failed",
                user_value=f"{user.applicant_age} years",
                notes="Exceeds maximum age limit."
            ))
            disqualification_reasons.append(f"Applicant age ({user.applicant_age}) exceeds maximum threshold of {max_age} years.")
    else:
        rule_verifications.append(EligibilityRuleCondition(
            rule_key="age_limit",
            label="Age Criterion",
            requirement=f"Minimum {min_age} years required",
            status="failed",
            user_value=f"{user.applicant_age} years",
            notes="Applicant must be major (>18)."
        ))
        disqualification_reasons.append(f"Applicant age ({user.applicant_age}) is below minimum requirement of {min_age} years.")

    # ----------------------------------------------------
    # Check 3: Project Cost Ceiling & Floor
    # ----------------------------------------------------
    max_cost = conds.get("max_project_cost_manufacturing" if user_cat_normalized in ["citrus_juice", "citrus_peel_oil", "manufacturing"] else "max_project_cost", conds.get("max_project_cost", 100000000.0))
    min_cost = conds.get("min_project_cost", 0.0)
    
    if user.project_cost_inr > max_cost:
        rule_verifications.append(EligibilityRuleCondition(
            rule_key="project_cost_ceiling",
            label="Project Cost Limit",
            requirement=f"Maximum project cost ceiling: ₹{max_cost/100000:.1f} Lakhs",
            status="failed",
            user_value=f"₹{user.project_cost_inr/100000:.2f} Lakhs",
            notes="Project cost exceeds maximum scheme ceiling."
        ))
        disqualification_reasons.append(f"Project cost of ₹{user.project_cost_inr/100000:.2f}L exceeds scheme ceiling of ₹{max_cost/100000:.1f}L.")
    elif user.project_cost_inr < min_cost:
        rule_verifications.append(EligibilityRuleCondition(
            rule_key="project_cost_floor",
            label="Minimum Project Cost",
            requirement=f"Minimum project investment: ₹{min_cost/100000:.1f} Lakhs",
            status="failed",
            user_value=f"₹{user.project_cost_inr/100000:.2f} Lakhs",
            notes="Project cost below minimum qualifying investment."
        ))
        disqualification_reasons.append(f"Project cost of ₹{user.project_cost_inr/100000:.2f}L is below required minimum of ₹{min_cost/100000:.1f}L.")
    else:
        rule_verifications.append(EligibilityRuleCondition(
            rule_key="project_cost",
            label="Project Investment Size",
            requirement=f"Eligible investment range: ₹{min_cost/100000:.1f}L to ₹{max_cost/100000:.1f}L",
            status="satisfied",
            user_value=f"₹{user.project_cost_inr/100000:.2f} Lakhs",
            notes="Project cost is within eligible statutory ceiling."
        ))
        reasons.append(f"Project cost of ₹{user.project_cost_inr/100000:.2f}L is within allowable ceiling (₹{max_cost/100000:.1f}L).")

    # ----------------------------------------------------
    # Check 4: Land & Water Availability (Scheme Specific)
    # ----------------------------------------------------
    if conds.get("requires_land", False):
        min_land = conds.get("min_land_acres", 1.0)
        if not user.has_land or user.land_acres < min_land:
            rule_verifications.append(EligibilityRuleCondition(
                rule_key="land_requirement",
                label="Land Requirement",
                requirement=f"Minimum {min_land} acre suitable land with title/lease",
                status="failed",
                user_value=f"{user.land_acres} acres (has_land={user.has_land})",
                notes="Scheme mandates registered land ownership or long lease."
            ))
            disqualification_reasons.append(f"Scheme mandates minimum {min_land} acre land with registered title/lease. Available: {user.land_acres} acres.")
        else:
            rule_verifications.append(EligibilityRuleCondition(
                rule_key="land_requirement",
                label="Land Requirement",
                requirement=f"Minimum {min_land} acre suitable land",
                status="satisfied",
                user_value=f"{user.land_acres} acres available",
                notes="Land availability satisfies requirement."
            ))
            reasons.append(f"Land requirement satisfied ({user.land_acres} acres >= {min_land} acre).")
            
    if conds.get("requires_water_source", False):
        if not user.has_water_source:
            missing_requirements.append("Functional borewell / dedicated irrigation water source required on site.")
            rule_verifications.append(EligibilityRuleCondition(
                rule_key="water_source",
                label="Water Resource",
                requirement="Functional irrigation / water connection",
                status="info_needed",
                user_value="Unconfirmed",
                notes="Evidence of perennial water source required on 7/12 extract."
            ))
        else:
            rule_verifications.append(EligibilityRuleCondition(
                rule_key="water_source",
                label="Water Resource",
                requirement="Functional irrigation / water connection",
                status="satisfied",
                user_value="Confirmed available",
                notes="Water source verified."
            ))

    # ----------------------------------------------------
    # Check 5: Demographic & Reserved Category (Stand-Up India / PMEGP)
    # ----------------------------------------------------
    if conds.get("requires_sc_st_or_women", False):
        is_sc_st_women = user.social_category in ["SC", "ST", "Women"]
        if not is_sc_st_women:
            rule_verifications.append(EligibilityRuleCondition(
                rule_key="demographic_reservation",
                label="Target Beneficiary Group",
                requirement="Exclusively for SC, ST, or Women entrepreneurs (>=51% equity)",
                status="failed",
                user_value=user.social_category,
                notes="Beneficiary does not belong to mandated target demographic."
            ))
            disqualification_reasons.append(f"Stand-Up India is exclusively reserved for SC, ST, or Women entrepreneurs. User category: {user.social_category}.")
        else:
            rule_verifications.append(EligibilityRuleCondition(
                rule_key="demographic_reservation",
                label="Target Beneficiary Group",
                requirement="Exclusively for SC, ST, or Women entrepreneurs",
                status="satisfied",
                user_value=f"Eligible ({user.social_category})",
                notes="Demographic category satisfies scheme mandate."
            ))
            reasons.append(f"Applicant category '{user.social_category}' qualifies for 100% Stand-Up India reservation.")

    # ----------------------------------------------------
    # Check 6: Maharashtra Domicile (CMEGP)
    # ----------------------------------------------------
    if conds.get("requires_maharashtra_domicile", False):
        if user.state.lower() != "maharashtra":
            rule_verifications.append(EligibilityRuleCondition(
                rule_key="state_domicile",
                label="State Domicile",
                requirement="Maharashtra State Domicile Certificate mandatory",
                status="failed",
                user_value=user.state,
                notes="CMEGP is restricted to Maharashtra domiciles."
            ))
            disqualification_reasons.append("Maharashtra State Domicile Certificate is mandatory for CMEGP.")
        else:
            rule_verifications.append(EligibilityRuleCondition(
                rule_key="state_domicile",
                label="State Domicile",
                requirement="Maharashtra State Domicile Certificate mandatory",
                status="satisfied",
                user_value=f"Maharashtra ({user.district})",
                notes="State residency confirmed."
            ))

    # ----------------------------------------------------
    # Check 7: Greenfield / Prior Subsidy Check
    # ----------------------------------------------------
    if conds.get("greenfield_only", False) and not user.is_greenfield:
        rule_verifications.append(EligibilityRuleCondition(
            rule_key="greenfield_status",
            label="Enterprise Type",
            requirement="Only new greenfield micro-enterprises are eligible",
            status="failed",
            user_value="Existing / Non-greenfield unit",
            notes="Existing units cannot apply for greenfield margin money."
        ))
        disqualification_reasons.append("Scheme is strictly for new greenfield micro-enterprises.")
    elif user.has_prior_subsidy and scheme.scheme_code in ["PMEGP-004", "CMEGP-MH-005"]:
        rule_verifications.append(EligibilityRuleCondition(
            rule_key="prior_subsidy",
            label="Prior Government Subsidy",
            requirement="No prior capital subsidy under Central/State schemes",
            status="failed",
            user_value="Availing prior subsidy",
            notes="Double dipping across capital subsidy schemes is barred."
        ))
        disqualification_reasons.append("Applicant has already availed a government capital subsidy; double dipping is barred.")

    # ----------------------------------------------------
    # Check 8: Minimum Promoter Equity Margin
    # ----------------------------------------------------
    req_margin_rate = scheme.min_promoter_contribution_rate
    # PMEGP & CMEGP reduce margin to 5% for SC/ST/OBC/Women/Minority
    if scheme.scheme_code in ["PMEGP-004", "CMEGP-MH-005"] and user.social_category in ["SC", "ST", "OBC", "Women", "Minority"]:
        req_margin_rate = 0.05
    required_promoter_equity = user.project_cost_inr * req_margin_rate
    
    if user.available_capital_inr < required_promoter_equity:
        missing_requirements.append(
            f"Available capital (₹{user.available_capital_inr/100000:.2f}L) is below scheme minimum promoter equity of {int(req_margin_rate*100)}% (₹{required_promoter_equity/100000:.2f}L)."
        )
        rule_verifications.append(EligibilityRuleCondition(
            rule_key="promoter_equity",
            label="Promoter Margin Contribution",
            requirement=f"Minimum {int(req_margin_rate*100)}% equity (₹{required_promoter_equity/100000:.2f} Lakhs)",
            status="info_needed",
            user_value=f"₹{user.available_capital_inr/100000:.2f} Lakhs",
            notes="Applicant must arrange additional margin money to meet bank lending norms."
        ))
    else:
        rule_verifications.append(EligibilityRuleCondition(
            rule_key="promoter_equity",
            label="Promoter Margin Contribution",
            requirement=f"Minimum {int(req_margin_rate*100)}% equity (₹{required_promoter_equity/100000:.2f} Lakhs)",
            status="satisfied",
            user_value=f"₹{user.available_capital_inr/100000:.2f} Lakhs",
            notes="Promoter capital meets minimum margin money guideline."
        ))
        reasons.append(f"Promoter equity of ₹{user.available_capital_inr/100000:.2f}L satisfies the {int(req_margin_rate*100)}% requirement (₹{required_promoter_equity/100000:.2f}L).")

    # ----------------------------------------------------
    # Check 9: Bank Sanction / In-principle requirement
    # ----------------------------------------------------
    if conds.get("requires_bank_loan", False):
        if not user.has_bank_sanction:
            missing_requirements.append("Formal bank term loan in-principle appraisal/sanction letter required before final subsidy release.")
            rule_verifications.append(EligibilityRuleCondition(
                rule_key="bank_loan_sanction",
                label="Bank Term Loan Appraisal",
                requirement="Bank in-principle term loan sanction letter",
                status="info_needed",
                user_value="Pending Bank Submission",
                notes="Subsidy is credit-linked and disbursed to the bank loan escrow account."
            ))
        else:
            rule_verifications.append(EligibilityRuleCondition(
                rule_key="bank_loan_sanction",
                label="Bank Term Loan Appraisal",
                requirement="Bank in-principle term loan sanction letter",
                status="satisfied",
                user_value="Sanction Confirmed",
                notes="Credit-linkage criteria satisfied."
            ))

    # ----------------------------------------------------
    # Check 10: Education requirement (PMEGP / CMEGP)
    # ----------------------------------------------------
    if "min_education_manufacturing_gt_10l" in conds and user.project_cost_inr > 1000000:
        if user.education in ["Below 8th"]:
            rule_verifications.append(EligibilityRuleCondition(
                rule_key="education_qualification",
                label="Educational Qualification",
                requirement="Minimum 8th standard pass for manufacturing projects >₹10 Lakhs",
                status="failed",
                user_value=user.education,
                notes="Educational requirement not satisfied for project scale."
            ))
            disqualification_reasons.append("Minimum 8th pass certificate required for manufacturing projects above ₹10 Lakhs.")
        else:
            rule_verifications.append(EligibilityRuleCondition(
                rule_key="education_qualification",
                label="Educational Qualification",
                requirement="Minimum 8th standard pass for manufacturing projects >₹10 Lakhs",
                status="satisfied",
                user_value=user.education,
                notes="Education criteria satisfied."
            ))

    # ========================================================================
    # STEP 4: CALCULATE POTENTIAL ASSISTANCE
    # ========================================================================
    applicable_subsidy_rate = scheme.assistance_percentage
    subsidy_cap = scheme.max_subsidy_amount
    eligible_capex = user.project_cost_inr
    calc_formula = ""
    interest_subvention = None
    
    if scheme.scheme_code == "PMFME-001":
        # 35% capped at ₹10 Lakhs
        applicable_subsidy_rate = 0.35
        calculated_subsidy = min(eligible_capex * applicable_subsidy_rate, subsidy_cap)
        calc_formula = f"min(Project Cost ₹{eligible_capex/100000:.2f}L × 35%, Cap ₹10.0L) = ₹{calculated_subsidy/100000:.2f} Lakhs"
        
    elif scheme.scheme_code == "MIDH-NHB-002":
        # 50% for nurseries up to 25L; 35% for packhouse/cold storage up to 50L
        if "nursery" in user_cat_normalized:
            applicable_subsidy_rate = 0.50
            subsidy_cap = 2500000.0
            calculated_subsidy = min(eligible_capex * applicable_subsidy_rate, subsidy_cap)
            calc_formula = f"High-Tech Nursery Component: min(₹{eligible_capex/100000:.2f}L × 50%, Cap ₹25.0L) = ₹{calculated_subsidy/100000:.2f} Lakhs"
        else:
            applicable_subsidy_rate = 0.35
            subsidy_cap = 5000000.0
            calculated_subsidy = min(eligible_capex * applicable_subsidy_rate, subsidy_cap)
            calc_formula = f"Post-Harvest / Cold Chain: min(₹{eligible_capex/100000:.2f}L × 35%, Cap ₹50.0L) = ₹{calculated_subsidy/100000:.2f} Lakhs"
            
    elif scheme.scheme_code in ["PMEGP-004", "CMEGP-MH-005"]:
        # Rural vs Urban, General vs Special
        is_rural = user.location_type.lower() == "rural"
        is_special = user.social_category in ["SC", "ST", "OBC", "Women", "Minority"]
        
        if is_rural and is_special:
            applicable_subsidy_rate = 0.35
            calc_tag = "Rural Special Category (35%)"
        elif is_rural and not is_special:
            applicable_subsidy_rate = 0.25
            calc_tag = "Rural General Category (25%)"
        elif not is_rural and is_special:
            applicable_subsidy_rate = 0.25
            calc_tag = "Urban Special Category (25%)"
        else:
            applicable_subsidy_rate = 0.15
            calc_tag = "Urban General Category (15%)"
            
        calculated_subsidy = min(eligible_capex * applicable_subsidy_rate, subsidy_cap)
        calc_formula = f"{calc_tag}: min(₹{eligible_capex/100000:.2f}L × {int(applicable_subsidy_rate*100)}%, Cap ₹{subsidy_cap/100000:.1f}L) = ₹{calculated_subsidy/100000:.2f} Lakhs"
        
    elif scheme.scheme_code == "AIF-003":
        # 3% interest subvention on term loan for 7 years
        subsidized_loan = min(eligible_capex * 0.90, 20000000.0)
        interest_subvention = subsidized_loan * 0.03
        calculated_subsidy = interest_subvention * 7.0  # Total 7-year interest savings
        calc_formula = f"3% Interest Subvention on Term Loan of ₹{subsidized_loan/100000:.2f}L for 7 Years = ₹{interest_subvention/100000:.2f}L/year (Total ₹{calculated_subsidy/100000:.2f}L)"
        
    elif scheme.scheme_code == "KUSUM-006":
        applicable_subsidy_rate = 0.60
        calculated_subsidy = min(eligible_capex * applicable_subsidy_rate, subsidy_cap)
        calc_formula = f"Solar Assistance: min(₹{eligible_capex/100000:.2f}L × 60%, Cap ₹4.5L) = ₹{calculated_subsidy/100000:.2f} Lakhs"
        
    elif scheme.scheme_code == "MUDRA-007":
        applicable_subsidy_rate = 0.0
        calculated_subsidy = 0.0
        calc_formula = f"Collateral-Free Loan up to ₹{min(eligible_capex, 1000000.0)/100000:.2f} Lakhs (Zero Capital Subsidy)"
        
    elif scheme.scheme_code == "STANDUP-008":
        applicable_subsidy_rate = 0.0
        calculated_subsidy = 0.0
        calc_formula = f"Bank Loan Coverage 85%: ₹{min(eligible_capex * 0.85, 10000000.0)/100000:.2f} Lakhs (Promoter Margin 15%)"
    else:
        calculated_subsidy = min(eligible_capex * applicable_subsidy_rate, subsidy_cap)
        calc_formula = f"₹{eligible_capex/100000:.2f}L × {int(applicable_subsidy_rate*100)}% = ₹{calculated_subsidy/100000:.2f} Lakhs"

    estimated_bank_loan = max(0.0, user.project_cost_inr - required_promoter_equity)

    # ========================================================================
    # STEP 3: ASSIGN ELIGIBILITY STATUS (3 OFFICIAL STATUSES)
    # ========================================================================
    has_hard_disqualification = len(disqualification_reasons) > 0
    has_info_needed = len(missing_requirements) > 0
    
    if has_hard_disqualification:
        status = "Not eligible based on known criteria"
        status_code = "NOT_ELIGIBLE"
        match_score = 20
        calculated_subsidy = 0.0  # Zero out subsidy for non-eligible
    elif has_info_needed:
        status = "More information required"
        status_code = "MORE_INFO_REQUIRED"
        match_score = 75
    else:
        status = "Potentially eligible"
        status_code = "POTENTIALLY_ELIGIBLE"
        match_score = 95
        
    return SchemeEligibilityResult(
        scheme_code=scheme.scheme_code,
        scheme_name=scheme.scheme_name,
        short_name=scheme.short_name,
        department=scheme.department,
        status=status,
        status_code=status_code,
        match_score=match_score,
        eligible_project_cost=user.project_cost_inr,
        assistance_percentage=applicable_subsidy_rate,
        calculated_subsidy_amount=round(calculated_subsidy, 2),
        calculated_subsidy_lakhs=round(calculated_subsidy / 100000.0, 2),
        min_promoter_contribution_required=round(required_promoter_equity, 2),
        estimated_bank_loan=round(estimated_bank_loan, 2),
        interest_subvention_annual=round(interest_subvention, 2) if interest_subvention else None,
        calculation_formula=calc_formula,
        rule_verifications=rule_verifications,
        reasons=reasons,
        disqualification_reasons=disqualification_reasons,
        missing_requirements=missing_requirements,
        official_website=scheme.official_website,
        source_document=scheme.source_document,
        nodal_agency=scheme.nodal_agency,
        processing_period=scheme.processing_period,
        last_verified_date=scheme.last_verified_date,
        required_documents=scheme.required_documents
    )


def evaluate_all_schemes(user: UserAssessmentInput) -> List[SchemeEligibilityResult]:
    """
    Evaluates all schemes in the database against the user's assessment profile.
    Sorts results so that 'Potentially eligible' schemes with highest subsidy appear first.
    """
    results: List[SchemeEligibilityResult] = []
    for scheme in MASTER_SCHEME_DATABASE:
        res = evaluate_single_scheme(scheme, user)
        results.append(res)
        
    # Sort order:
    # 1. Potentially eligible first (score 95)
    # 2. More info required second (score 75)
    # 3. Not eligible last (score 20)
    # Then by calculated subsidy descending
    results.sort(key=lambda x: (x.match_score, x.calculated_subsidy_amount), reverse=True)
    return results


def get_scheme_by_code(scheme_code: str) -> Optional[SchemeProfile]:
    """Retrieves a specific scheme definition by its unique identifier"""
    for s in MASTER_SCHEME_DATABASE:
        if s.scheme_code.lower() == scheme_code.lower() or s.short_name.lower() == scheme_code.lower():
            return s
    return None


def get_all_schemes_catalog() -> List[SchemeProfile]:
    """Returns the full master catalog of verified government schemes"""
    return MASTER_SCHEME_DATABASE
