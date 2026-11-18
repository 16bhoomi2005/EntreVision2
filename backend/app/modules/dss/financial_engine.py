"""
Financial Engine (M3) - EntreVision Decision Support System
============================================================
Accredited financial feasibility and project report calculation engine.
Conforms to:
- MoFPI PMFME Scheme Norms (35% Credit-Linked Back-Ended Subsidy, Cap Rs 10 Lakh)
- MIDH / NHM Horticulture Norms (35%-50% Capital Grant, Cap Rs 25-30 Lakh)
- Indian Banks' Association (IBA) & NABARD Project Appraisal Norms
- Reducing Balance EMI Amortization
"""

import math
import logging
from typing import Dict, Any, Optional, List
from app.modules.dss.financial_config import FINANCIAL_CONFIG

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


# ============================================================================
# 1. CATEGORY-SPECIFIC FINANCIAL OPERATING PROFILES
# ============================================================================
BUSINESS_FINANCIAL_PROFILES = {
    "juice": {
        "profile_name": "Citrus Juice, Squash & Ready-to-Serve (RTS) Beverages",
        "keywords": ["juice", "beverage", "rts", "squash", "syrup"],
        "revenue_multiplier": 2.40,  # Annual Revenue at 100% capacity = 2.4x CapEx
        "cost_ratios": {
            "raw_material": 0.44,   # Fresh farm-gate citrus fruits
            "packaging": 0.11,      # Glass bottles, PET, tetra-packs, closures, labels
            "electricity": 0.07,    # Pasteurizer, bottle-washing, cooling power
            "labour": 0.09,         # Processing operator, bottlers, packaging staff
            "repairs_maintenance": 0.02,
            "admin_marketing": 0.03,
        },
        "capex_split": {
            "machinery": 0.65,
            "civil_works": 0.20,
            "electrification": 0.08,
            "installation": 0.04,
            "pre_operative": 0.03,
        },
        "working_capital_cycle": {
            "raw_material_days": 21,
            "packaging_days": 15,
            "finished_goods_days": 10,
            "receivable_days": 30,
            "payable_days": 15,
            "cash_buffer_days": 10,
        },
        "default_scheme": "PMFME",
        "subsidy_rate": 0.35,
        "subsidy_cap": 1000000.0,
        "promoter_margin_rate": 0.10,
    },
    "nursery": {
        "profile_name": "Certified Disease-Free Citrus Nursery & Budwood Propagation",
        "keywords": ["nursery", "propagation", "budwood", "rootstock", "greenhouse"],
        "revenue_multiplier": 1.85,  # Annual Revenue at 100% capacity
        "cost_ratios": {
            "raw_material": 0.15,   # CCRI certified scions, rootstocks, media
            "packaging": 0.06,      # UV polybags, tagging, root protectors
            "electricity": 0.05,    # Micro-irrigation pump, misting system power
            "labour": 0.32,         # High skilled grafters, budders, nurserymen
            "repairs_maintenance": 0.03,
            "admin_marketing": 0.04, # Certification fees, soil-testing
        },
        "capex_split": {
            "machinery": 0.45,      # Net house, misting line, foggers, drip
            "civil_works": 0.38,    # Hardening shed, mother plant beds, grading floor
            "electrification": 0.08,
            "installation": 0.05,
            "pre_operative": 0.04,
        },
        "working_capital_cycle": {
            "raw_material_days": 30,
            "packaging_days": 10,
            "finished_goods_days": 15,
            "receivable_days": 30,
            "payable_days": 15,
            "cash_buffer_days": 10,
        },
        "default_scheme": "MIDH",
        "subsidy_rate": 0.35,
        "subsidy_cap": 2500000.0,
        "promoter_margin_rate": 0.20,
    },
    "cold_storage": {
        "profile_name": "Solar Pre-Cooling & Farm-Gate Controlled Atmosphere Cold Storage",
        "keywords": ["cold", "storage", "pre-cooling", "ca store", "warehouse"],
        "revenue_multiplier": 1.55,
        "cost_ratios": {
            "raw_material": 0.04,   # Disinfectants, ethylene absorbers, pallet wraps
            "packaging": 0.03,      # Crates, plastic stretch films
            "electricity": 0.36,    # High refrigeration compressors, condenser blowers
            "labour": 0.12,         # Forklift operators, loading helpers, supervisors
            "repairs_maintenance": 0.08, # Ammonia/freon compressor servicing, gasket seals
            "admin_marketing": 0.05,
        },
        "capex_split": {
            "machinery": 0.58,      # Condensing units, evaporators, solar backup
            "civil_works": 0.28,    # Insulated PUF panels, airtight doors, plinth
            "electrification": 0.08,
            "installation": 0.04,
            "pre_operative": 0.02,
        },
        "working_capital_cycle": {
            "raw_material_days": 7,
            "packaging_days": 7,
            "finished_goods_days": 5,
            "receivable_days": 30,
            "payable_days": 15,
            "cash_buffer_days": 15,
        },
        "default_scheme": "MIDH",
        "subsidy_rate": 0.35,
        "subsidy_cap": 3000000.0,
        "promoter_margin_rate": 0.20,
    },
    "essential_oil": {
        "profile_name": "Citrus Peel Essential Oil & Terpene Extraction",
        "keywords": ["essential oil", "oil", "steam distillation", "peel oil", "cold press"],
        "revenue_multiplier": 2.25,
        "cost_ratios": {
            "raw_material": 0.42,   # Waste peel sourcing from mandis/juice plants
            "packaging": 0.08,      # Aluminium airtight bottles, amber glass jars
            "electricity": 0.12,    # Steam boiler, cold-press centrifuge, distillation power
            "labour": 0.10,         # Extraction technician, packaging helper
            "repairs_maintenance": 0.03,
            "admin_marketing": 0.04,
        },
        "capex_split": {
            "machinery": 0.70,      # SS-316 Steam distillation unit, centrifuge
            "civil_works": 0.16,
            "electrification": 0.07,
            "installation": 0.04,
            "pre_operative": 0.03,
        },
        "working_capital_cycle": {
            "raw_material_days": 15,
            "packaging_days": 15,
            "finished_goods_days": 10,
            "receivable_days": 30,
            "payable_days": 15,
            "cash_buffer_days": 10,
        },
        "default_scheme": "PMFME",
        "subsidy_rate": 0.35,
        "subsidy_cap": 1000000.0,
        "promoter_margin_rate": 0.10,
    },
    "bakery_candied_peel": {
        "profile_name": "Artisanal Candied Peel, Marmalade & Bakery Inclusions",
        "keywords": ["candy", "candied", "peel", "bakery", "marmalade", "jam"],
        "revenue_multiplier": 2.30,
        "cost_ratios": {
            "raw_material": 0.38,   # Fresh peel, sugar syrup, food-grade pectin
            "packaging": 0.11,      # Pouch packaging, vacuum bags, bakery tubs
            "electricity": 0.08,    # Steam kettle, cabinet dehydrator
            "labour": 0.14,         # Manual sorting, cutting, dicing, packing
            "repairs_maintenance": 0.02,
            "admin_marketing": 0.03,
        },
        "capex_split": {
            "machinery": 0.62,
            "civil_works": 0.22,
            "electrification": 0.08,
            "installation": 0.05,
            "pre_operative": 0.03,
        },
        "working_capital_cycle": {
            "raw_material_days": 20,
            "packaging_days": 15,
            "finished_goods_days": 10,
            "receivable_days": 25,
            "payable_days": 15,
            "cash_buffer_days": 10,
        },
        "default_scheme": "PMFME",
        "subsidy_rate": 0.35,
        "subsidy_cap": 1000000.0,
        "promoter_margin_rate": 0.10,
    },
    "organic_fertilizer": {
        "profile_name": "Citrus Pomace Organic Fertilizer & Vermicompost Hub",
        "keywords": ["fertilizer", "vermicompost", "manure", "organic", "pomace"],
        "revenue_multiplier": 1.70,
        "cost_ratios": {
            "raw_material": 0.20,   # Agro-waste, cow dung, earthworms, microbial culture
            "packaging": 0.09,      # 25kg & 50kg HDPE woven bags
            "electricity": 0.04,    # Shredder, trommel sieve power
            "labour": 0.30,         # Manual bed aeration, feeding, bagging
            "repairs_maintenance": 0.04,
            "admin_marketing": 0.04,
        },
        "capex_split": {
            "machinery": 0.42,      # Rotary trommel, shredder, moisture meter
            "civil_works": 0.42,    # Vermibeds, shade net, plinth concrete flooring
            "electrification": 0.06,
            "installation": 0.05,
            "pre_operative": 0.05,
        },
        "working_capital_cycle": {
            "raw_material_days": 25,
            "packaging_days": 10,
            "finished_goods_days": 15,
            "receivable_days": 30,
            "payable_days": 15,
            "cash_buffer_days": 10,
        },
        "default_scheme": "PMEGP",
        "subsidy_rate": 0.25,
        "subsidy_cap": 1250000.0,
        "promoter_margin_rate": 0.10,
    },
    "default_agri": {
        "profile_name": "Standard Citrus Agribusiness / Post-Harvest Hub",
        "keywords": [],
        "revenue_multiplier": 2.10,
        "cost_ratios": {
            "raw_material": 0.36,
            "packaging": 0.10,
            "electricity": 0.08,
            "labour": 0.14,
            "repairs_maintenance": 0.03,
            "admin_marketing": 0.04,
        },
        "capex_split": {
            "machinery": 0.64,
            "civil_works": 0.22,
            "electrification": 0.07,
            "installation": 0.04,
            "pre_operative": 0.03,
        },
        "working_capital_cycle": {
            "raw_material_days": 21,
            "packaging_days": 15,
            "finished_goods_days": 10,
            "receivable_days": 30,
            "payable_days": 15,
            "cash_buffer_days": 10,
        },
        "default_scheme": "PMFME",
        "subsidy_rate": 0.35,
        "subsidy_cap": 1000000.0,
        "promoter_margin_rate": 0.10,
    }
}


# ============================================================================
# 2. HELPER FUNCTIONS
# ============================================================================
def resolve_financial_profile(business_name: str, category: str = "") -> dict:
    """Finds the most specific financial profile based on business keywords."""
    combined = f"{business_name} {category}".lower()
    for key, prof in BUSINESS_FINANCIAL_PROFILES.items():
        if key == "default_agri":
            continue
        if any(kw in combined for kw in prof["keywords"]):
            return prof
    return BUSINESS_FINANCIAL_PROFILES["default_agri"]


def calculate_monthly_emi(principal: float, annual_interest_rate: float, tenure_years: int) -> float:
    """
    Standard Banking Reducing Balance EMI Formula:
    EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
    """
    if principal <= 0 or tenure_years <= 0:
        return 0.0
    r = (annual_interest_rate / 100.0) / 12.0
    n = tenure_years * 12
    if r == 0:
        return round(principal / n, 2)
    emi = (principal * r * math.pow(1 + r, n)) / (math.pow(1 + r, n) - 1)
    return round(emi, 2)


def calculate_exact_npv(initial_outlay: float, cash_flows: List[float], discount_rate: float = 0.10) -> float:
    """
    Net Present Value (NPV) discounted at the hurdle rate (10% standard for MSME/NABARD):
    NPV = -C0 + Sum_{t=1}^n [CF_t / (1 + k)^t]
    """
    if initial_outlay <= 0 or not cash_flows:
        return 0.0
    pv = sum(cf / math.pow(1 + discount_rate, t + 1) for t, cf in enumerate(cash_flows))
    return round(pv - initial_outlay, 2)


def calculate_exact_irr(initial_outlay: float, cash_flows: List[float]) -> float:
    """
    Internal Rate of Return (IRR) solved numerically via Bisection:
    -C0 + Sum_{t=1}^n [CF_t / (1 + r)^t] = 0
    """
    if initial_outlay <= 0 or not cash_flows:
        return 0.0
    total_inflows = sum(cash_flows)
    if total_inflows <= initial_outlay:
        return 0.0

    low, high = -0.50, 2.50
    tolerance = 1e-4

    for _ in range(50):
        mid = (low + high) / 2.0
        npv_mid = -initial_outlay + sum(cf / math.pow(1 + mid, t + 1) for t, cf in enumerate(cash_flows))
        if abs(npv_mid) < tolerance:
            return round(mid * 100.0, 1)

        npv_low = -initial_outlay + sum(cf / math.pow(1 + low, t + 1) for t, cf in enumerate(cash_flows))
        if npv_low * npv_mid < 0:
            high = mid
        else:
            low = mid

    return round(((low + high) / 2.0) * 100.0, 1)


def calculate_bank_credit_grade(avg_dscr: float, bep_percentage: float, equity_percentage: float, irr_pct: float, loan: float) -> Dict[str, Any]:
    """
    Bank Appraisal Credit Rating Scorecard (100 Points):
    - DSCR (40 pts): Safety of debt service
    - Break-Even (25 pts): Operating safety margin
    - Promoter Equity (20 pts): Founder skin in the game
    - IRR (15 pts): Returns relative to 10% hurdle rate
    """
    if loan <= 0:
        return {
            "credit_grade": "Grade A++ (Zero Debt / 100% Self-Funded Equity)",
            "credit_badge_color": "var(--ok)",
            "credit_score": 100
        }

    score = 0
    # 1. DSCR (40 pts)
    if avg_dscr >= 2.0: score += 40
    elif avg_dscr >= 1.6: score += 34
    elif avg_dscr >= 1.4: score += 28
    elif avg_dscr >= 1.2: score += 20
    elif avg_dscr >= 1.0: score += 10

    # 2. BEP Buffer (25 pts)
    if bep_percentage <= 35: score += 25
    elif bep_percentage <= 45: score += 20
    elif bep_percentage <= 55: score += 15
    elif bep_percentage <= 65: score += 10
    else: score += 4

    # 3. Promoter Equity Margin (20 pts)
    if equity_percentage >= 30: score += 20
    elif equity_percentage >= 20: score += 16
    elif equity_percentage >= 10: score += 12
    else: score += 4

    # 4. IRR vs Hurdle Rate (15 pts)
    if irr_pct >= 25: score += 15
    elif irr_pct >= 18: score += 12
    elif irr_pct >= 12: score += 8
    else: score += 3

    if score >= 85:
        grade = "Grade AAA (Prime Bankable - Exceptional Safety)"
        color = "var(--ok)"
    elif score >= 75:
        grade = "Grade AA (Strong Bankable - Low Risk)"
        color = "var(--ok)"
    elif score >= 65:
        grade = "Grade A+ (Bankable - Standard Institutional Risk)"
        color = "var(--ok)"
    elif score >= 50:
        grade = "Grade B (Moderate Risk - Additional Collateral/Margin Required)"
        color = "var(--amber)"
    else:
        grade = "Grade C (Sub-Standard - High Risk of Debt Servicing Stress)"
        color = "#ef4444"

    return {
        "credit_grade": grade,
        "credit_badge_color": color,
        "credit_score": score
    }


def calculate_working_capital_cycle(
    base_capex: float,
    profile: dict,
    raw_material_days: Optional[int] = None,
    packaging_days: Optional[int] = None,
    finished_goods_days: Optional[int] = None,
    receivable_days: Optional[int] = None,
    payable_days: Optional[int] = None,
    cash_buffer_days: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Computes Working Capital requirement following Tandon & Nayak Committee banking norms:
    WC = Inventory (Raw Material + Packaging + Finished Goods) + Receivables + Cash Buffer - Payables

    Steps:
    1. Inventory inputs (days)
    2. Daily operating expenses from estimated monthly expenses
    3. Working capital components (Inventory, Receivables, Cash, Creditors)
    4. Financing structure: 75% Bank Cash Credit Limit, 25% Promoter Margin Money
    """
    wc_defaults = profile.get("working_capital_cycle", {})
    rm_days = int(raw_material_days) if raw_material_days is not None else int(wc_defaults.get("raw_material_days", 21))
    pkg_days = int(packaging_days) if packaging_days is not None else int(wc_defaults.get("packaging_days", 15))
    fg_days = int(finished_goods_days) if finished_goods_days is not None else int(wc_defaults.get("finished_goods_days", 10))
    rec_days = int(receivable_days) if receivable_days is not None else int(wc_defaults.get("receivable_days", 30))
    pay_days = int(payable_days) if payable_days is not None else int(wc_defaults.get("payable_days", 15))
    cash_days = int(cash_buffer_days) if cash_buffer_days is not None else int(wc_defaults.get("cash_buffer_days", 10))

    rev_mult = profile.get("revenue_multiplier", 2.10)
    annual_revenue = base_capex * rev_mult
    cost_ratios = profile.get("cost_ratios", {})

    annual_rm = annual_revenue * cost_ratios.get("raw_material", 0.35)
    annual_pkg = annual_revenue * cost_ratios.get("packaging", 0.10)
    annual_opex = annual_revenue * sum(cost_ratios.values())
    monthly_opex = annual_opex / 12.0

    # Step 3: Daily operating figures from estimated annual/monthly expenses
    daily_revenue = annual_revenue / 365.0
    daily_rm = annual_rm / 365.0
    daily_pkg = annual_pkg / 365.0
    daily_opex = annual_opex / 365.0

    # Step 2: Component calculations
    rm_inventory = round(daily_rm * rm_days, 2)
    pkg_inventory = round(daily_pkg * pkg_days, 2)
    fg_inventory = round(daily_opex * fg_days, 2)
    total_inventory = round(rm_inventory + pkg_inventory + fg_inventory, 2)

    receivables = round(daily_revenue * rec_days, 2)
    cash_buffer = round(daily_opex * cash_days, 2)
    gross_working_capital = round(total_inventory + receivables + cash_buffer, 2)

    # Supplier credit (payables on raw material and packaging supplies)
    daily_procurement = daily_rm + daily_pkg
    payables = round(daily_procurement * pay_days, 2)

    # Net Working Capital = Inventory + Receivables + Cash - Payables
    net_working_capital = round(max(0.0, gross_working_capital - payables), 2)

    # Operating Cycle in days = RM + FG + Receivables - Payables
    operating_cycle_days = rm_days + fg_days + rec_days - pay_days

    # Step 4: Financing requirement split (Nayak Committee: 75% Bank CC, 25% Promoter Margin)
    bank_cash_credit = round(net_working_capital * 0.75, 2)
    promoter_wc_margin = round(net_working_capital * 0.25, 2)

    return {
        "operating_cycle_days": operating_cycle_days,
        "cycle_days": {
            "raw_material_days": rm_days,
            "packaging_days": pkg_days,
            "finished_goods_days": fg_days,
            "receivable_days": rec_days,
            "supplier_credit_days": pay_days,
            "cash_buffer_days": cash_days,
        },
        "daily_operating_figures": {
            "daily_revenue": round(daily_revenue, 2),
            "daily_raw_material": round(daily_rm, 2),
            "daily_packaging": round(daily_pkg, 2),
            "daily_operating_expenses": round(daily_opex, 2),
            "monthly_operating_expenses": round(monthly_opex, 2),
        },
        "working_capital_components": {
            "raw_material_inventory": rm_inventory,
            "packaging_inventory": pkg_inventory,
            "finished_goods_inventory": fg_inventory,
            "total_inventory": total_inventory,
            "receivables": receivables,
            "cash_buffer": cash_buffer,
            "gross_working_capital": gross_working_capital,
            "payables_creditors": payables,
            "net_working_capital": net_working_capital,
        },
        "financing_structure": {
            "bank_cash_credit_limit": bank_cash_credit,
            "promoter_margin_money": promoter_wc_margin,
            "bank_share_pct": 75.0,
            "promoter_share_pct": 25.0,
        }
    }


# ============================================================================
# 3. FINANCIAL ENGINE CLASS
# ============================================================================
class FinancialEngine:
    def __init__(self):
        pass

    def calculate_project_finance(
        self,
        project_name: str,
        base_capex: float,
        user_budget: Optional[float] = None,
        user_category: str = "General",
        category: str = "",
        loan_interest_rate: float = 8.5,
        loan_tenure_years: int = 5,
        working_capital_months: int = 2,
        raw_material_days: Optional[int] = None,
        packaging_days: Optional[int] = None,
        finished_goods_days: Optional[int] = None,
        receivable_days: Optional[int] = None,
        payable_days: Optional[int] = None,
        cash_buffer_days: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Calculates bank-grade financial plan:
        1. Itemized Project Cost breakdown (Machinery, Civil Works, Electrification, Installation)
        2. Working Capital requirement based on operating cycle & inventory days
        3. Promoter Contribution calculation (minimum scheme margin vs user equity)
        4. Initial Bank Finance Requirement (without upfront subsidy deduction!)
        5. Separate Subsidy Assessment (Tracked via Subsidy Reserve Fund)
        6. Monthly EMI & 5-Year Amortization Schedule
        7. Operating Statement (Revenue, Raw Material, Electricity, Labour, EBITDA, DSCR, BEP)
        8. Clear distinction: Fixed Asset Investment vs Initial Working Capital vs Total Funding
        """
        logger.info(f"Appraising bankable finance for '{project_name}' (CapEx: Rs {base_capex:,.2f})")

        profile = resolve_financial_profile(project_name, category)
        capex_split = profile["capex_split"]
        cost_ratios = profile["cost_ratios"]

        # Step 3: Project Cost Breakdown
        machinery_cost = round(base_capex * capex_split["machinery"], 2)
        civil_works_cost = round(base_capex * capex_split["civil_works"], 2)
        electrification_cost = round(base_capex * capex_split["electrification"], 2)
        installation_cost = round(base_capex * capex_split["installation"], 2)
        pre_operative_cost = round(base_capex * capex_split["pre_operative"], 2)

        # Working Capital Analysis based on operating cycle and inventory requirements
        wc_analysis = calculate_working_capital_cycle(
            base_capex=base_capex,
            profile=profile,
            raw_material_days=raw_material_days,
            packaging_days=packaging_days,
            finished_goods_days=finished_goods_days,
            receivable_days=receivable_days,
            payable_days=payable_days,
            cash_buffer_days=cash_buffer_days,
        )
        working_capital_req = wc_analysis["working_capital_components"]["net_working_capital"]
        fixed_asset_investment = round(base_capex, 2)
        total_project_funding = round(fixed_asset_investment + working_capital_req, 2)

        eligible_project_cost = base_capex  # Fixed asset eligible cost for subsidy & term loan

        annual_full_rev = round(base_capex * profile["revenue_multiplier"], 2)

        # Step 4: Promoter Contribution
        scheme = profile["default_scheme"]
        margin_rate = profile["promoter_margin_rate"]

        # Social category concessions (e.g. SC/ST/Women get 5% margin in PMEGP)
        if user_category.upper() in ["SC", "ST", "WOMEN"] and scheme == "PMEGP":
            margin_rate = 0.05
        elif user_category.upper() in ["SC", "ST"] and scheme == "MIDH":
            margin_rate = 0.15

        min_promoter_contribution = round(eligible_project_cost * margin_rate, 2)

        # If user provides more budget than the minimum, accept it up to the project cost
        if user_budget is not None and user_budget > 0:
            promoter_contribution = round(min(eligible_project_cost, max(min_promoter_contribution, user_budget)), 2)
        else:
            promoter_contribution = min_promoter_contribution

        # Step 5: Initial Bank Financing Requirement
        # Commercial banks sanction the balance after promoter equity:
        initial_bank_finance = round(eligible_project_cost - promoter_contribution, 2)

        # Step 6: Calculate Subsidy Separately (Back-Ended Credit-Linked)
        subsidy_rate = profile["subsidy_rate"]
        subsidy_cap = profile["subsidy_cap"]

        # Concessions for special categories under MIDH/PMEGP
        if user_category.upper() in ["SC", "ST", "HILLY"]:
            if scheme == "MIDH":
                subsidy_rate = 0.50
                subsidy_cap = 3000000.0
            elif scheme == "PMEGP":
                subsidy_rate = 0.35

        calculated_subsidy = round(eligible_project_cost * subsidy_rate, 2)
        estimated_subsidy = round(min(calculated_subsidy, subsidy_cap), 2)

        subsidy_record = {
            "estimated_amount": estimated_subsidy,
            "subsidy_rate_percentage": round(subsidy_rate * 100, 1),
            "subsidy_cap": subsidy_cap,
            "scheme_name": f"{scheme} Scheme Assistance",
            "eligibility_status": "Estimated Eligible / Subject to Formal SNA Verification",
            "release_mechanism": "Back-Ended Credit-Linked Capital Subsidy",
            "release_conditions": (
                "Credited by MoFPI/SNA/NABARD into borrower's Subsidy Reserve Fund (SRF) account "
                "post-inspection; 3-year minimum lock-in period applies; adjusted against the term loan "
                "in final repayment tranches once project benchmarks are verified."
            ),
            "adjustment_status": "Held in Subsidy Reserve Fund (No interest charged once credited)",
            "is_deducted_from_initial_loan": False,
        }

        # Step 7: Calculate EMI and Repayment Schedule
        monthly_emi = calculate_monthly_emi(initial_bank_finance, loan_interest_rate, loan_tenure_years)
        annual_repayment = round(monthly_emi * 12, 2)

        # 5-Year Amortization Schedule
        amortization_schedule = []
        loan_balance = initial_bank_finance
        monthly_r = (loan_interest_rate / 100.0) / 12.0

        for year in range(1, loan_tenure_years + 1):
            year_interest = 0.0
            year_principal = 0.0
            for m in range(12):
                if loan_balance <= 0:
                    break
                # In reducing balance, interest applies to current outstanding principal
                m_interest = loan_balance * monthly_r
                m_principal = min(loan_balance, monthly_emi - m_interest) if monthly_emi > m_interest else 0
                year_interest += m_interest
                year_principal += m_principal
                loan_balance = max(0.0, loan_balance - m_principal)

            amortization_schedule.append({
                "year": year,
                "opening_balance": round(loan_balance + year_principal, 2),
                "principal_paid": round(year_principal, 2),
                "interest_paid": round(year_interest, 2),
                "total_payment": round(year_principal + year_interest, 2),
                "closing_balance": round(loan_balance, 2)
            })

        # 5-Year Financial Projections (Using industry-specific operational profile)
        capacity_ramp = [0.60, 0.72, 0.82, 0.90, 0.95]
        yearly_projections = []

        curr_machinery_wdv = machinery_cost
        curr_civil_wdv = civil_works_cost

        for year_idx, util in enumerate(capacity_ramp):
            y_rev = round(annual_full_rev * util, 2)
            y_raw = round(y_rev * cost_ratios["raw_material"], 2)
            y_pack = round(y_rev * cost_ratios.get("packaging", 0.0), 2)
            y_power = round(y_rev * cost_ratios["electricity"], 2)
            y_labour = round(y_rev * cost_ratios["labour"], 2)
            y_maint = round(y_rev * cost_ratios.get("repairs_maintenance", 0.03), 2)
            y_admin = round(y_rev * cost_ratios.get("admin_marketing", 0.04), 2)

            total_opex = round(y_raw + y_pack + y_power + y_labour + y_maint + y_admin, 2)
            ebitda = round(y_rev - total_opex, 2)

            # WDV Depreciation: 15% machinery, 10% civil works
            dep_mach = round(curr_machinery_wdv * 0.15, 2)
            dep_civil = round(curr_civil_wdv * 0.10, 2)
            total_dep = round(dep_mach + dep_civil, 2)
            curr_machinery_wdv -= dep_mach
            curr_civil_wdv -= dep_civil

            # Debt service for this year from amortization schedule
            sched_entry = amortization_schedule[year_idx] if year_idx < len(amortization_schedule) else {"interest_paid": 0, "principal_paid": 0}
            interest_exp = sched_entry["interest_paid"]
            principal_paid = sched_entry["principal_paid"]

            pbt = round(ebitda - total_dep - interest_exp, 2)
            tax = round(max(0.0, pbt * 0.25), 2)  # MSME Concessional Rate 22% + Cess ~ 25%
            pat = round(pbt - tax, 2)

            cash_accruals = round(pat + total_dep, 2)
            debt_service = round(principal_paid + interest_exp, 2)
            dscr = round((cash_accruals + interest_exp) / debt_service, 2) if debt_service > 0 else 9.99

            yearly_projections.append({
                "year": f"Year {year_idx + 1}",
                "capacity_utilization": f"{int(util * 100)}%",
                "gross_revenue": y_rev,
                "raw_materials": y_raw,
                "packaging": y_pack,
                "electricity_utilities": y_power,
                "labour_wages": y_labour,
                "maintenance": y_maint,
                "admin_marketing": y_admin,
                "total_opex": total_opex,
                "ebitda": ebitda,
                "depreciation": total_dep,
                "interest_expense": interest_exp,
                "pbt": pbt,
                "tax": tax,
                "pat": pat,
                "cash_accruals": cash_accruals,
                "debt_service": debt_service,
                "dscr": dscr,
                "closing_loan_balance": sched_entry.get("closing_balance", 0.0)
            })

        # Weighted Average DSCR
        active_debt_years = [y for y in yearly_projections if y["debt_service"] > 0]
        avg_dscr = round(sum(y["dscr"] for y in active_debt_years) / len(active_debt_years), 2) if active_debt_years else 9.99

        # Break-Even Point (Year 1)
        y1 = yearly_projections[0]
        fixed_costs = y1["depreciation"] + y1["interest_expense"] + (y1["labour_wages"] * 0.60) + y1["admin_marketing"]
        variable_costs = y1["raw_materials"] + y1["packaging"] + y1["electricity_utilities"] + (y1["labour_wages"] * 0.40) + y1["maintenance"]
        contribution = y1["gross_revenue"] - variable_costs
        bep_percentage = round((fixed_costs / max(1.0, contribution)) * 100, 1) if contribution > 0 else 45.0
        bep_percentage = max(20.0, min(80.0, bep_percentage))

        # Working capital financing allocations (Nayak Committee 75% Bank CC / 25% Promoter Margin)
        promoter_wc_margin = wc_analysis["financing_structure"]["promoter_margin_money"]
        bank_wc_limit = wc_analysis["financing_structure"]["bank_cash_credit_limit"]
        total_promoter_contribution = round(promoter_contribution + promoter_wc_margin, 2)
        total_bank_financing = round(initial_bank_finance + bank_wc_limit, 2)

        return {
            "project_name": project_name,
            "financial_profile_used": profile["profile_name"],
            "total_project_cost": round(eligible_project_cost, 2),
            "fixed_asset_investment": fixed_asset_investment,
            "initial_working_capital": working_capital_req,
            "total_project_funding": total_project_funding,
            "funding_categories": [
                {
                    "category": "Fixed asset investment",
                    "amount": fixed_asset_investment,
                    "purpose": "Establishment: Plant, machinery, civil works, electrification, installation & pre-operative expenses",
                },
                {
                    "category": "Initial working capital",
                    "amount": working_capital_req,
                    "purpose": "Operation: Working capital requirement covering raw materials, packaging, inventory, receivables and operating cash buffer minus supplier credit",
                },
                {
                    "category": "Total project funding",
                    "amount": total_project_funding,
                    "purpose": "Combined project capital needed to establish and commence commercial operations of the unit",
                },
            ],
            "project_cost_breakdown": {
                "machinery_and_equipment": machinery_cost,
                "civil_works_and_shed": civil_works_cost,
                "electrification_and_utilities": electrification_cost,
                "installation_and_trial": installation_cost,
                "pre_operative_contingencies": pre_operative_cost,
                "working_capital_buffer_identified": working_capital_req,
            },
            "working_capital_analysis": wc_analysis,
            "means_of_finance": {
                "promoter_contribution": promoter_contribution,
                "promoter_contribution_pct": round((promoter_contribution / eligible_project_cost) * 100, 1),
                "initial_bank_financing_required": initial_bank_finance,
                "initial_bank_financing_pct": round((initial_bank_finance / eligible_project_cost) * 100, 1),
                "estimated_subsidy": estimated_subsidy,
                "estimated_subsidy_pct": round((estimated_subsidy / eligible_project_cost) * 100, 1),
                "working_capital_promoter_margin": promoter_wc_margin,
                "working_capital_bank_limit": bank_wc_limit,
                "total_promoter_contribution": total_promoter_contribution,
                "total_bank_financing": total_bank_financing,
                "total_combined_funding": total_project_funding,
            },
            "subsidy_details": subsidy_record,
            "loan_repayment": {
                "loan_principal": initial_bank_finance,
                "annual_interest_rate": loan_interest_rate,
                "loan_tenure_years": loan_tenure_years,
                "monthly_emi": monthly_emi,
                "annual_repayment": annual_repayment,
                "amortization_schedule": amortization_schedule,
            },
            "operating_cost_structure": cost_ratios,
            "projections_5_year": yearly_projections,
            "financial_metrics": {
                "year_1_revenue": y1["gross_revenue"],
                "year_1_pat": y1["pat"],
                "year_1_cash_accruals": y1["cash_accruals"],
                "avg_dscr": avg_dscr,
                "break_even_pct": bep_percentage,
                "npv_10_pct": calculate_exact_npv(eligible_project_cost, [y["cash_accruals"] for y in yearly_projections], 0.10),
                "irr_pct": calculate_exact_irr(eligible_project_cost, [y["cash_accruals"] for y in yearly_projections]),
                "credit_rating": calculate_bank_credit_grade(
                    avg_dscr=avg_dscr,
                    bep_percentage=bep_percentage,
                    equity_percentage=round((promoter_contribution / eligible_project_cost) * 100, 1),
                    irr_pct=calculate_exact_irr(eligible_project_cost, [y["cash_accruals"] for y in yearly_projections]),
                    loan=initial_bank_finance
                )
            },
            "financing_assumptions": {
                "is_illustrative_scenario": True,
                "disclaimer": FINANCIAL_CONFIG.FINANCIAL_DISCLAIMER,
                "loan_interest_rate_pct": loan_interest_rate,
                "loan_tenure_years": loan_tenure_years,
                "amortization_method": "Reducing Balance EMI",
                "promoter_margin_basis": (
                    f"Minimum mandatory scheme margin rate ({round(margin_rate * 100, 1)}%) "
                    f"or applicant budget contribution"
                ),
                "subsidy_mechanism": "Back-ended credit-linked capital subsidy held in Subsidy Reserve Fund (SRF)",
                "statutory_approval_required": True
            }
        }


if __name__ == "__main__":
    engine = FinancialEngine()
    # Test sample project of Rs 20 Lakhs with Rs 2 Lakhs promoter contribution
    print("\n--- TEST: Rs 20 Lakh Project, Rs 2 Lakh Promoter Contribution ---")
    sample_result = engine.calculate_project_finance(
        project_name="Citrus RTS Juice Processing Unit",
        base_capex=2000000.0,
        user_budget=200000.0,
        user_category="General"
    )

    mof = sample_result["means_of_finance"]
    print(f"Total Project Cost: Rs {sample_result['total_project_cost']:,.2f}")
    print(f"Promoter Contribution: Rs {mof['promoter_contribution']:,.2f} ({mof['promoter_contribution_pct']}%)")
    print(f"Fixed Asset Investment: Rs {sample_result['fixed_asset_investment']:,.2f}")
    print(f"Initial Working Capital: Rs {sample_result['initial_working_capital']:,.2f}")
    print(f"Total Project Funding: Rs {sample_result['total_project_funding']:,.2f}")
    print(f"Promoter Contribution (Fixed): Rs {mof['promoter_contribution']:,.2f} ({mof['promoter_contribution_pct']}%)")
    print(f"Initial Bank Financing: Rs {mof['initial_bank_financing_required']:,.2f} ({mof['initial_bank_financing_pct']}%)")
    print(f"Estimated Subsidy: Rs {mof['estimated_subsidy']:,.2f} ({mof['estimated_subsidy_pct']}%)")
    print(f"Monthly EMI: Rs {sample_result['loan_repayment']['monthly_emi']:,.2f}")
    print(f"Average DSCR: {sample_result['financial_metrics']['avg_dscr']}")
    print(f"Break-Even Point: {sample_result['financial_metrics']['break_even_pct']}%")
    wc = sample_result['working_capital_analysis']
    print(f"Operating Cycle Days: {wc['operating_cycle_days']} days")
    print(f"Net Working Capital: Rs {wc['working_capital_components']['net_working_capital']:,.2f}")
