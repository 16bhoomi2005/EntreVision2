"""
MCDA Scoring Configuration & Weight Matrix - EntreVision Decision Support System
==============================================================================
Centralizes Multi-Criteria Decision Analysis (MCDA) criterion weights,
infrastructure sub-weights, and score normalization parameters.

Eliminates hardcoded literal weights from service.py and enables sensitivity
analysis, administrative calibration, and auditable decision science.
"""

from dataclasses import dataclass, field, asdict
from typing import Dict, Any


@dataclass(frozen=True)
class MCDAWeights:
    """
    Primary criterion weights for the EntreVision MCDA scoring engine.
    Must strictly sum to 1.00 (100%).
    """
    capital: float = 0.25        # Multi-Attribute Utility of promoter equity vs CapEx
    infrastructure: float = 0.20 # Physical land, 3-phase power, and commercial water
    market: float = 0.20         # Tehsil citrus cluster density and APMC raw material supply
    skills: float = 0.15         # Technical domain proficiency & willingness to train
    resources: float = 0.10      # Physical assets (godowns, tractors, commercial vehicles)
    location: float = 0.10       # Closeness to regional processing & APMC clusters

    def validate(self) -> bool:
        total = round(self.capital + self.infrastructure + self.market + self.skills + self.resources + self.location, 4)
        return total == 1.0000


@dataclass(frozen=True)
class InfrastructureSubWeights:
    """
    Sub-criterion weights for Infrastructure Fit calculation.
    Must strictly sum to 1.00 (100%).
    """
    land: float = 0.45           # Farmland / covered workspace adequacy
    power: float = 0.30          # 3-phase high-tension grid sanction
    water: float = 0.25          # Processing / irrigation water supply

    def validate(self) -> bool:
        total = round(self.land + self.power + self.water, 4)
        return total == 1.0000


@dataclass
class MCDAScoringConfig:
    """
    Master configuration for EntreVision Multi-Criteria Decision Analysis.
    """
    weights: MCDAWeights = field(default_factory=MCDAWeights)
    infra_weights: InfrastructureSubWeights = field(default_factory=InfrastructureSubWeights)

    # Persona cluster affinity bonus
    persona_affinity_boost: int = 6

    # Score clamping bounds
    eligible_score_min: int = 45
    eligible_score_max: int = 98
    ineligible_score_ceiling: int = 38
    ineligible_score_floor: int = 12
    ineligible_penalty: int = 40

    def compute_infrastructure_score(self, land_score: float, power_score: float, water_score: float) -> int:
        """Computes weighted infrastructure fit (0-100)."""
        score = (
            (land_score * self.infra_weights.land) +
            (power_score * self.infra_weights.power) +
            (water_score * self.infra_weights.water)
        )
        return int(round(score))

    def compute_mcda_score(
        self,
        capital_fit: float,
        infrastructure_fit: float,
        market_fit: float,
        skill_fit: float,
        resource_fit: float,
        location_fit: float
    ) -> int:
        """
        Computes master weighted MCDA sum across all 6 core criteria.
        Returns an integer score bounded between 0 and 100.
        """
        w = self.weights
        raw_score = (
            (capital_fit * w.capital) +
            (infrastructure_fit * w.infrastructure) +
            (market_fit * w.market) +
            (skill_fit * w.skills) +
            (resource_fit * w.resources) +
            (location_fit * w.location)
        )
        return int(round(raw_score))

    def to_dict(self) -> Dict[str, Any]:
        """Serializes active configuration for API transparency."""
        return {
            "weights": asdict(self.weights),
            "infrastructure_sub_weights": asdict(self.infra_weights),
            "persona_affinity_boost": self.persona_affinity_boost,
            "bounds": {
                "eligible_min": self.eligible_score_min,
                "eligible_max": self.eligible_score_max,
                "ineligible_ceiling": self.ineligible_score_ceiling,
                "ineligible_floor": self.ineligible_score_floor
            }
        }


# Global singleton instance
MCDA_CONFIG = MCDAScoringConfig()
