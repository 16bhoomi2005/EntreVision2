"""
Financial Configuration Module - EntreVision Decision Support System
====================================================================
Centralized configuration for financial thresholds, borrowing multipliers,
and Multi-Attribute Utility Theory (MAUT) capital scoring parameters.

Design Principle:
All financial thresholds are configurable heuristics representing decision-support
utility curves based on Debt-to-Equity (D/E) leverage. They are NOT statutory RBI mandates.
Actual bank loan sanction and government subsidy release are subject to formal
appraisal by lending institutions and State Nodal Agencies (SNA).
"""

from dataclasses import dataclass
from typing import Dict, Any, Tuple


@dataclass(frozen=True)
class FinancialScoringConfig:
    """
    Configurable utility scoring thresholds based on Debt-to-Equity (D/E) ratios.
    Ratio = Total Project Cost (CapEx) / User Available Liquid Equity.
    """
    # Tier 1: Self-funded (CapEx <= 1.0x Budget) -> 100% equity, zero borrowing requirement
    TIER_1_MAX_RATIO: float = 1.0
    TIER_1_SCORE: int = 100

    # Tier 2: Low Leverage (1.0x < CapEx <= 2.0x Budget) -> D/E <= 1:1, prime bankable range
    TIER_2_MAX_RATIO: float = 2.0
    TIER_2_SCORE: int = 90

    # Tier 3: Moderate Leverage (2.0x < CapEx <= 4.0x Budget) -> D/E <= 3:1, bank loan + margin
    TIER_3_MAX_RATIO: float = 4.0
    TIER_3_SCORE: int = 75

    # Tier 4: High Leverage (4.0x < CapEx <= 7.0x Budget) -> High debt service stress
    TIER_4_MAX_RATIO: float = 7.0
    TIER_4_SCORE: int = 50

    # Tier 5: Extreme Leverage (7.0x < CapEx <= 10.0x Budget) -> Stretched feasibility
    TIER_5_MAX_RATIO: float = 10.0
    TIER_5_SCORE: int = 25

    # Minimum floor score for ventures exceeding 10x budget
    MIN_CAPITAL_SCORE: int = 5

    # Standard commercial loan parameters
    DEFAULT_LOAN_INTEREST_RATE: float = 9.0
    DEFAULT_LOAN_TENURE_YEARS: int = 5

    # Working capital financing split (Nayak Committee guidelines)
    BANK_WC_SHARE_PCT: float = 75.0
    PROMOTER_WC_MARGIN_PCT: float = 25.0

    # Mandatory disclaimer attached to all financial advice
    FINANCIAL_DISCLAIMER: str = (
        "Financial figures are illustrative scenario projections based on scheme guidelines "
        "and benchmark models. Sanction of bank loans is at the sole discretion of the financing "
        "bank based on applicant credit appraisal, collateral, and project viability. "
        "Government subsidies require formal application and verification by the State Nodal Agency (SNA)."
    )

    def calculate_capital_fit(self, capex: float, user_budget: float) -> int:
        """
        Computes the normalized Capital Fit utility score (0-100)
        based on the ratio of required capital to available user budget.
        """
        budget = max(10000.0, float(user_budget or 0.0))
        capex_val = max(1000.0, float(capex or 0.0))
        ratio = capex_val / budget

        if ratio <= self.TIER_1_MAX_RATIO:
            return self.TIER_1_SCORE
        elif ratio <= self.TIER_2_MAX_RATIO:
            return self.TIER_2_SCORE
        elif ratio <= self.TIER_3_MAX_RATIO:
            return self.TIER_3_SCORE
        elif ratio <= self.TIER_4_MAX_RATIO:
            return self.TIER_4_SCORE
        elif ratio <= self.TIER_5_MAX_RATIO:
            return self.TIER_5_SCORE
        else:
            # Smooth non-linear decay beyond 10x ratio
            excess = ratio - self.TIER_5_MAX_RATIO
            decay = int(excess * 3.0)
            return max(self.MIN_CAPITAL_SCORE, self.TIER_5_SCORE - decay)


# Singleton instance for application-wide use
FINANCIAL_CONFIG = FinancialScoringConfig()
