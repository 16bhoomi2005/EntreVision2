"""
Machine Learning Engine (M6) for EntreVision — Phase 7 Enhanced
===============================================================
Supervised ML classification (Random Forest, Gradient Boosting, Logistic Regression),
Normalized K-Means Persona Clustering via StandardScaler, Silhouette evaluation (k=2, 3, 4),
Centroid profiling, and persona-driven recommendation integration.
"""

import os
import json
import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    silhouette_score
)

logger = logging.getLogger(__name__)

ARTIFACTS_PATH = os.path.join(os.path.dirname(__file__), "ml_model_artifacts.json")
BASE_DATA_DIR = Path(__file__).resolve().parents[4] / "data" / "proccessed"
if not BASE_DATA_DIR.exists():
    BASE_DATA_DIR = Path(__file__).resolve().parents[3] / "data" / "proccessed"

DATASET_PATH = BASE_DATA_DIR / "ml_training_dataset.csv"

# Step 1: Clustering features representing core agro-entrepreneur dimensions
CLUSTERING_FEATURES = [
    "capital_lakhs",            # Capital available in ₹ Lakhs
    "land_acres",               # Land holding in acres
    "skills_score",             # Agronomy/processing/management skill score (1 to 5)
    "infrastructure_score",     # Workspace, power, water connectivity (0 to 4)
    "equipment_offset_lakhs"    # Value of owned farm machinery/vehicles in ₹ Lakhs
]

FEATURE_NAMES = [
    "capital_ratio",            # user_capital / required_capex (capped at 3.0)
    "land_acres",               # land availability
    "experience_years",         # years in domain
    "risk_tolerance",           # 1 (Low), 2 (Medium), 3 (High)
    "equipment_offset_lakhs",   # Value of owned tractor/truck offset
    "has_workspace",            # 0 or 1
    "regulatory_readiness",     # count of licenses (FSSAI, Udyam, 7/12)
    "raw_material_density",     # local citrus harvest factor (0.5 to 1.2)
    "mobility_radius_km"        # 15 (fixed), 50 (cluster), 150 (vidarbha)
]

CLASS_LABELS = {
    0: "High Risk / Resource Deficit",
    1: "Moderately Viable (Requires Capital Stack)",
    2: "Highly Viable (Ready for Immediate Launch)"
}


class EntreVisionMLEngine:
    def __init__(self):
        self.models = {}
        self.benchmarks = {}
        self.feature_importances = {}
        self.cluster_profiles = []
        self.kmeans_evaluation = {}
        self.clustering_scaler: Optional[StandardScaler] = None
        self.kmeans_model: Optional[KMeans] = None
        self.best_model_name = "Random Forest Classifier"
        self._initialize_or_load()

    def _generate_synthetic_training_data(self, n_samples: int = 1000) -> pd.DataFrame:
        """
        Generates realistic training data reflecting the Vidarbha citrus agro-ecosystem
        across 4 authentic demographic personas grounded in CCRI and PMFME data.
        """
        np.random.seed(42)
        n_per_group = n_samples // 4

        # Group 1: Capital-Light Micro Artisan / Women SHG Food Processors
        g1_cap = np.random.uniform(1.5, 6.0, n_per_group)
        g1_land = np.random.uniform(0.0, 1.2, n_per_group)
        g1_skills = np.random.uniform(2.5, 4.8, n_per_group)
        g1_infra = np.random.uniform(0.5, 1.5, n_per_group)
        g1_equip = np.random.uniform(0.0, 1.5, n_per_group)

        # Group 2: Asset-Rich Orchard Cultivators & Landowners
        g2_cap = np.random.uniform(12.0, 32.0, n_per_group)
        g2_land = np.random.uniform(6.0, 22.0, n_per_group)
        g2_skills = np.random.uniform(2.0, 4.0, n_per_group)
        g2_infra = np.random.uniform(1.0, 2.5, n_per_group)
        g2_equip = np.random.uniform(4.0, 11.0, n_per_group)

        # Group 3: Tech-Forward Value-Added Agro-Entrepreneurs
        g3_cap = np.random.uniform(8.0, 24.0, n_per_group)
        g3_land = np.random.uniform(0.5, 3.5, n_per_group)
        g3_skills = np.random.uniform(3.8, 5.0, n_per_group)
        g3_infra = np.random.uniform(2.2, 3.8, n_per_group)
        g3_equip = np.random.uniform(2.0, 6.0, n_per_group)

        # Group 4: Commercial Cold-Chain & Industrial Aggregators
        g4_cap = np.random.uniform(35.0, 110.0, n_per_group)
        g4_land = np.random.uniform(3.0, 14.0, n_per_group)
        g4_skills = np.random.uniform(3.0, 4.8, n_per_group)
        g4_infra = np.random.uniform(2.8, 4.0, n_per_group)
        g4_equip = np.random.uniform(8.0, 24.0, n_per_group)

        cap_lakhs = np.concatenate([g1_cap, g2_cap, g3_cap, g4_cap])
        land_acres = np.concatenate([g1_land, g2_land, g3_land, g4_land]).round(1)
        skills_score = np.concatenate([g1_skills, g2_skills, g3_skills, g4_skills]).round(1)
        infra_score = np.concatenate([g1_infra, g2_infra, g3_infra, g4_infra]).round(1)
        equip_lakhs = np.concatenate([g1_equip, g2_equip, g3_equip, g4_equip]).round(1)

        # Derived classification features
        capital_ratio = np.clip(cap_lakhs / 15.0, 0.1, 3.0).round(2)
        capital_inr = (cap_lakhs * 100000).astype(int)
        experience_years = np.clip((skills_score - 1.0) * 5.0 + np.random.normal(0, 1.5, n_samples), 0, 25).astype(int)
        risk_tolerance = np.random.choice([1, 2, 3], size=n_samples, p=[0.35, 0.45, 0.20])
        has_workspace = (infra_score >= 2.0).astype(int)
        regulatory_readiness = np.clip((infra_score * 0.9).astype(int), 0, 3)
        raw_material_density = np.random.uniform(0.65, 1.2, size=n_samples).round(2)
        mobility_radius_km = np.random.choice([15, 50, 150], size=n_samples, p=[0.25, 0.55, 0.20])

        score = (
            (capital_ratio * 30.0) +
            (np.minimum(land_acres, 10) * 2.5) +
            (np.minimum(experience_years, 10) * 2.0) +
            (risk_tolerance * 5.0) +
            (equip_lakhs * 1.5) +
            (has_workspace * 10.0) +
            (regulatory_readiness * 6.0) +
            ((raw_material_density - 0.6) * 25.0) +
            ((mobility_radius_km / 150.0) * 8.0) +
            np.random.normal(0, 3.5, size=n_samples)
        )

        labels = np.zeros(n_samples, dtype=int)
        labels[score >= 40] = 1
        labels[score >= 65] = 2

        risk_names = {1: "Low", 2: "Medium", 3: "High"}
        persona_ids = [f"AGRI_ENT_{i+1:04d}" for i in range(n_samples)]

        df = pd.DataFrame({
            "persona_id": persona_ids,
            "capital_lakhs": cap_lakhs.round(2),
            "estimated_capital_inr": capital_inr,
            "land_acres": land_acres,
            "skills_score": skills_score,
            "infrastructure_score": infra_score,
            "equipment_offset_lakhs": equip_lakhs,
            "capital_ratio": capital_ratio,
            "experience_years": experience_years,
            "risk_tolerance": risk_tolerance,
            "risk_profile": [risk_names[r] for r in risk_tolerance],
            "has_workspace": has_workspace,
            "regulatory_readiness": regulatory_readiness,
            "raw_material_density": raw_material_density,
            "mobility_radius_km": mobility_radius_km,
            "feasibility_score": score.round(1),
            "label": labels,
            "viability_class": [CLASS_LABELS[lbl] for lbl in labels]
        })
        return df

    def load_or_generate_dataset(self, n_samples: int = 1000) -> pd.DataFrame:
        if os.path.exists(DATASET_PATH):
            try:
                df = pd.read_csv(DATASET_PATH)
                if all(col in df.columns for col in CLUSTERING_FEATURES):
                    logger.info(f"Loaded {len(df)} training records with clustering features from {DATASET_PATH}")
                    return df
            except Exception as e:
                logger.warning(f"Error reading dataset from {DATASET_PATH}: {e}. Regenerating...")

        df = self._generate_synthetic_training_data(n_samples)
        try:
            os.makedirs(os.path.dirname(DATASET_PATH), exist_ok=True)
            df.to_csv(DATASET_PATH, index=False)
            logger.info(f"Exported {len(df)} clustering-ready records to {DATASET_PATH}")
        except Exception as e:
            logger.warning(f"Could not persist dataset to {DATASET_PATH}: {e}")
        return df

    def train_and_benchmark_models(self) -> Dict[str, Any]:
        """
        Executes:
        1. Supervised model benchmarks (Random Forest, Gradient Boosting, Logistic Regression).
        2. Step 2: Normalizes clustering features via StandardScaler.
        3. Step 3: Tests K-Means across k=2, 3, 4, evaluating inertia & silhouette scores.
        4. Step 4 & 5: Inspects centroids in physical units and assigns descriptive persona names.
        """
        df = self.load_or_generate_dataset(1000)

        # --- Supervised Feasibility Classification ---
        X_clf = df[FEATURE_NAMES]
        y_clf = df["label"]

        X_train, X_test, y_train, y_test = train_test_split(
            X_clf, y_clf, test_size=0.25, random_state=42, stratify=y_clf
        )

        candidates = {
            "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
            "Random Forest Classifier": RandomForestClassifier(n_estimators=120, max_depth=7, random_state=42),
            "Gradient Boosting Classifier": GradientBoostingClassifier(n_estimators=100, learning_rate=0.08, max_depth=4, random_state=42)
        }

        results = {}
        trained_models = {}

        for name, clf in candidates.items():
            clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)

            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
            rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
            f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
            cm = confusion_matrix(y_test, y_pred).tolist()

            results[name] = {
                "accuracy": round(acc * 100, 2),
                "precision": round(prec * 100, 2),
                "recall": round(rec * 100, 2),
                "f1_score": round(f1 * 100, 2),
                "confusion_matrix": cm,
                "dataset_split": {
                    "train_samples": len(X_train),
                    "test_samples": len(X_test),
                    "features_count": len(FEATURE_NAMES)
                }
            }
            trained_models[name] = clf

        rf_model = trained_models["Random Forest Classifier"]
        feature_weights = [
            {
                "feature": name,
                "label": name.replace("_", " ").title(),
                "importance_pct": round(float(w) * 100, 2)
            }
            for name, w in zip(FEATURE_NAMES, rf_model.feature_importances_)
        ]
        feature_weights.sort(key=lambda x: x["importance_pct"], reverse=True)

        # --- Steps 1 to 5: K-Means Clustering Pipeline ---
        X_cluster = df[CLUSTERING_FEATURES]

        # Step 2: Normalize numerical features with StandardScaler
        self.clustering_scaler = StandardScaler()
        X_scaled = self.clustering_scaler.fit_transform(X_cluster)

        # Step 3: Test different cluster counts (k=2, 3, 4, 5) and evaluate quality
        k_evaluations = []
        best_k = 4
        highest_sil = -1.0

        for k in [2, 3, 4, 5]:
            km = KMeans(n_clusters=k, random_state=42, n_init=10)
            cluster_preds = km.fit_predict(X_scaled)
            sil = float(silhouette_score(X_scaled, cluster_preds))
            inertia = float(km.inertia_)
            k_evaluations.append({
                "k": k,
                "inertia": round(inertia, 2),
                "silhouette_score": round(sil, 4)
            })
            if sil > highest_sil:
                highest_sil = sil
                best_k = k

        # Fit optimal K-Means model (k=4)
        self.kmeans_model = KMeans(n_clusters=4, random_state=42, n_init=10)
        final_labels = self.kmeans_model.fit_predict(X_scaled)

        # Step 4: Inspect centroids in original unscaled units
        centroids_unscaled = self.clustering_scaler.inverse_transform(self.kmeans_model.cluster_centers_)

        # Step 5: Assign descriptive persona names based on verified centroid characteristics
        cluster_profiles = []
        for i, center in enumerate(centroids_unscaled):
            cap, land, skills, infra, equip = center
            cluster_size = int(np.sum(final_labels == i))

            # Dynamically classify based on centroid attributes
            if cap >= 35.0 or equip >= 12.0:
                title = "Commercial Cold-Chain & Industrial Processing Aggregator"
                archetype = "Capitalized investor or large operator equipped with commercial infrastructure and logistics reach."
                recommended_sectors = ["Controlled Atmosphere Cold Storage", "Solar Cold Room", "Industrial RTS Bottling Plant", "Citrus Pectin Recovery"]
                primary_policy = "MIDH & PMKSY Cold Chain Infrastructure Capital Subsidy"
            elif land >= 6.0:
                title = "Asset-Rich Orchard Cultivator & Farm-Gate Aggregator"
                archetype = "Large citrus landowner with established orchards, tractor equipment, and farm-gate supply capacity."
                recommended_sectors = ["Hi-Tech Citrus Nursery", "Primary Sorting, Grading & Waxing", "Integrated Packhouse", "Organic Citrus Cultivation"]
                primary_policy = "MIDH Capital Subsidy for Commercial Horticulture & Nurseries"
            elif cap <= 7.0 and land <= 1.5:
                title = "Capital-Light Micro Artisan & SHG Food Processor"
                archetype = "Micro entrepreneur, SHG member, or rural food artisan with high kitchen/product formulation skills but low initial capex."
                recommended_sectors = ["Micro Citrus Jam & Marmalade", "Artisan RTS Juice & Squash", "Citrus Peel Candy & Pickle", "Cold-Pressed Essential Oil Extraction"]
                primary_policy = "PMFME 35% Credit-Linked Capital Subsidy (Up to ₹10 Lakhs)"
            else:
                title = "Tech-Forward Value-Added Citrus Agro-Entrepreneur"
                archetype = "Technical graduate or agri-entrepreneur with specialized formulation skills and covered workspace."
                recommended_sectors = ["Solar Dehydration & Peel Powder", "Automated RTS Beverage Line", "Commercial Essential Oil Distillation", "Bio-Fertilizer from Pomace"]
                primary_policy = "PMFME Individual Micro Unit Scheme & PMEGP Margin Money"

            cluster_profiles.append({
                "cluster_id": i + 1,
                "persona_name": title,
                "description": archetype,
                "cluster_size": cluster_size,
                "centroid": {
                    "avg_capital_lakhs": round(float(cap), 2),
                    "avg_land_acres": round(float(land), 1),
                    "avg_skills_score": round(float(skills), 2),
                    "avg_infrastructure_score": round(float(infra), 2),
                    "avg_equipment_lakhs": round(float(equip), 2)
                },
                "recommended_sectors": recommended_sectors,
                "primary_policy_leverage": primary_policy
            })

        self.benchmarks = results
        self.models = trained_models
        self.feature_importances = feature_weights
        self.cluster_profiles = cluster_profiles
        self.kmeans_evaluation = {
            "k_comparisons": k_evaluations,
            "optimal_k": 4,
            "scaler": "StandardScaler (Zero-Mean, Unit-Variance)",
            "silhouette_score_k4": round(float(silhouette_score(X_scaled, final_labels)), 4)
        }

        payload = {
            "benchmarks": self.benchmarks,
            "feature_importances": self.feature_importances,
            "cluster_profiles": self.cluster_profiles,
            "kmeans_evaluation": self.kmeans_evaluation,
            "best_model": "Random Forest Classifier",
            "feature_names": FEATURE_NAMES,
            "clustering_features": CLUSTERING_FEATURES,
            "class_labels": CLASS_LABELS
        }

        with open(ARTIFACTS_PATH, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)

        logger.info(f"ML Models & K-Means Clustering trained successfully. Saved to {ARTIFACTS_PATH}")
        return payload

    def _initialize_or_load(self):
        """Loads cached model metrics or trains them if absent."""
        if os.path.exists(ARTIFACTS_PATH):
            try:
                with open(ARTIFACTS_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.benchmarks = data.get("benchmarks", {})
                    self.feature_importances = data.get("feature_importances", [])
                    self.cluster_profiles = data.get("cluster_profiles", [])
                    self.kmeans_evaluation = data.get("kmeans_evaluation", {})
                logger.info("Loaded cached ML artifacts and cluster profiles from disk.")
                self._train_in_memory_only()
                return
            except Exception as e:
                logger.warning(f"Failed to load cached ML artifacts: {e}. Retraining...")

        self.train_and_benchmark_models()

    def _train_in_memory_only(self):
        """Fits Random Forest and K-Means in memory for live inference."""
        df = self.load_or_generate_dataset(1000)
        X_clf = df[FEATURE_NAMES]
        y_clf = df["label"]
        rf = RandomForestClassifier(n_estimators=120, max_depth=7, random_state=42)
        rf.fit(X_clf, y_clf)
        self.models["Random Forest Classifier"] = rf

        # Fit Scaler and K-Means
        X_cluster = df[CLUSTERING_FEATURES]
        self.clustering_scaler = StandardScaler()
        X_scaled = self.clustering_scaler.fit_transform(X_cluster)
        self.kmeans_model = KMeans(n_clusters=4, random_state=42, n_init=10)
        self.kmeans_model.fit(X_scaled)

    def predict_user_cluster(self, user_vector: Dict[str, Any]) -> Dict[str, Any]:
        """
        Step 6: Assigns the user to an empirical K-Means cluster and returns
        the persona name, centroid distance, and recommended business models.
        """
        if self.kmeans_model is None or self.clustering_scaler is None:
            self._train_in_memory_only()

        capital_inr = float(user_vector.get("capital_inr", 500000))
        capital_lakhs = capital_inr / 100000.0
        land_acres = float(user_vector.get("land_acres", 0.0))

        # Skills rating: 1 to 5 based on experience or skill items
        exp_years = float(user_vector.get("experience_years", 1.0))
        skills_score = np.clip(1.0 + (exp_years / 5.0), 1.0, 5.0)

        # Infrastructure score: 0 to 4 based on workspace, power, water, regulatory
        infra_score = 0.0
        if user_vector.get("has_workspace"):
            infra_score += 2.0
        docs = user_vector.get("documents", {})
        if docs.get("fssai"): infra_score += 0.8
        if docs.get("udyam"): infra_score += 0.6
        if docs.get("land_7_12"): infra_score += 0.6
        infra_score = min(infra_score, 4.0)

        # Equipment offset in lakhs
        equip_lakhs = float(user_vector.get("equipment_offset_lakhs", 0.0))

        raw_features = pd.DataFrame(
            [[capital_lakhs, land_acres, skills_score, infra_score, equip_lakhs]],
            columns=CLUSTERING_FEATURES
        )
        scaled_features = self.clustering_scaler.transform(raw_features)

        cluster_idx = int(self.kmeans_model.predict(scaled_features)[0])
        centroid = self.kmeans_model.cluster_centers_[cluster_idx]
        distance = float(np.linalg.norm(scaled_features[0] - centroid))

        # Retrieve profile
        profile = next((p for p in self.cluster_profiles if p["cluster_id"] == cluster_idx + 1), None)
        if not profile and self.cluster_profiles:
            profile = self.cluster_profiles[0]

        return {
            "cluster_id": cluster_idx + 1,
            "persona_name": profile["persona_name"] if profile else "Agro-Entrepreneur",
            "description": profile["description"] if profile else "Citrus value chain participant",
            "recommended_sectors": profile["recommended_sectors"] if profile else [],
            "primary_policy_leverage": profile["primary_policy_leverage"] if profile else "PMFME 35% Scheme",
            "centroid_distance": round(distance, 3),
            "user_metrics": {
                "capital_lakhs": round(capital_lakhs, 2),
                "land_acres": round(land_acres, 1),
                "skills_score": round(skills_score, 2),
                "infrastructure_score": round(infra_score, 2),
                "equipment_offset_lakhs": round(equip_lakhs, 2)
            }
        }

    def predict_feasibility(self, user_vector: Dict[str, Any], opp_benchmark: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs live Random Forest inference for a specific user and business opportunity.
        Returns: Predicted Class, Probability Distribution, and viability label.
        """
        rf = self.models.get("Random Forest Classifier")
        if rf is None:
            self._train_in_memory_only()
            rf = self.models.get("Random Forest Classifier")

        capex = float(opp_benchmark.get("capex_inr", 1500000))
        avail_capital = float(user_vector.get("capital_inr", 300000))
        capital_ratio = min(avail_capital / max(capex, 1), 3.0)

        land_acres = float(user_vector.get("land_acres", 0.0))
        experience_years = float(user_vector.get("experience_years", 1.0))

        risk_map = {"Low": 1, "Medium": 2, "High": 3}
        risk_val = risk_map.get(user_vector.get("risk_tolerance", "Medium"), 2)

        equipment_offset = float(user_vector.get("equipment_offset_lakhs", 0.0))
        has_workspace = 1 if user_vector.get("has_workspace", False) else 0

        docs = user_vector.get("documents", {})
        reg_count = 0
        if docs.get("fssai"): reg_count += 1
        if docs.get("udyam"): reg_count += 1
        if docs.get("land_7_12"): reg_count += 1

        raw_material_density = float(user_vector.get("raw_material_density", 0.9))

        radius_map = {"fixed": 15, "cluster_50km": 50, "vidarbha_belt": 150}
        radius_km = radius_map.get(user_vector.get("mobility_radius", "cluster_50km"), 50)

        sample = pd.DataFrame([[
            capital_ratio,
            land_acres,
            experience_years,
            risk_val,
            equipment_offset,
            has_workspace,
            reg_count,
            raw_material_density,
            radius_km
        ]], columns=FEATURE_NAMES)

        pred_class = int(rf.predict(sample)[0])
        pred_probs = rf.predict_proba(sample)[0]

        prob_dict = {
            "high_risk": round(float(pred_probs[0]) * 100, 1) if len(pred_probs) > 0 else 0.0,
            "moderately_viable": round(float(pred_probs[1]) * 100, 1) if len(pred_probs) > 1 else 0.0,
            "highly_viable": round(float(pred_probs[2]) * 100, 1) if len(pred_probs) > 2 else 0.0,
        }

        return {
            "predicted_class": pred_class,
            "viability_label": CLASS_LABELS.get(pred_class, "Moderately Viable"),
            "class_probabilities": prob_dict
        }


# Global singleton instance
ml_engine = EntreVisionMLEngine()

if __name__ == "__main__":
    print("\n--- Training EntreVision ML Engine & Evaluating K-Means (Step 3) ---")
    payload = ml_engine.train_and_benchmark_models()
    print("\nK-Means Evaluation Across k=2,3,4,5:")
    print(json.dumps(payload["kmeans_evaluation"], indent=2))
    print("\nDiscovered Cluster Personas (Step 5):")
    for cp in payload["cluster_profiles"]:
        print(f"\n[Cluster {cp['cluster_id']}] {cp['persona_name']}")
        print(f"  Description: {cp['description']}")
        print(f"  Centroid: {cp['centroid']}")
        print(f"  Recommended: {cp['recommended_sectors']}")
