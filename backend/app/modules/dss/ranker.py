"""
Opportunity Ranker (M1)
=======================
Matches a user profile/persona to the best business opportunities.
"""
import re
import pandas as pd
import logging
from app.modules.dss.data_loader import DataManager

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

class OpportunityRanker:
    def __init__(self):
        self.dm = DataManager()
        self.datasets = self.dm.load_all()
        self.opportunities = self.datasets.get('opportunities')
        
        if self.opportunities is not None and not self.opportunities.empty:
            # Pre-process the investment_level string to extract a numeric max budget
            self.opportunities['Max_Budget_Extracted'] = self.opportunities['investment_level'].apply(self._extract_budget)
        
    def _extract_budget(self, text):
        """Extracts rough max investment from strings like 'Low (Rs 1.75 Lakhs)'"""
        if pd.isna(text):
            return 10000000 # Default high
        text = str(text).lower()
        # Find numbers near 'lakh' or 'cr'
        match = re.search(r'rs\s*([\d\.]+)\s*(lakh|cr)', text)
        if match:
            val = float(match.group(1))
            mult = 100000 if 'lakh' in match.group(2) else 10000000
            return val * mult
            
        # Fallbacks based on category wording
        if 'micro' in text or 'low' in text: return 500000
        if 'medium' in text: return 2500000
        if 'high' in text or 'large' in text: return 10000000
        return 10000000

    def rank_for_persona(self, persona: dict, top_n=3) -> pd.DataFrame:
        """
        Ranks opportunities based on Persona inputs.
        Persona expects:
        - Capital_INR (float)
        - Primary_Skill (str)
        - Risk_Appetite (str)
        """
        if self.opportunities is None or self.opportunities.empty:
            logger.error("Opportunities dataset not loaded.")
            return pd.DataFrame()

        df = self.opportunities.copy()
        
        capital = persona.get('Capital_INR', 0)
        # We allow a 3x multiplier on capital assuming bank loans (AIF/Mudra) cover 70-75%
        max_project_cost = capital * 3 
        
        scores = []
        for idx, row in df.iterrows():
            score = 100
            reasons = []
            
            # 1. Budget Constraint
            req_budget = row['Max_Budget_Extracted']
            if req_budget > max_project_cost:
                score -= 60
                reasons.append("Project exceeds budget (even with loan)")
            elif req_budget <= capital:
                score += 20
                reasons.append("Easily affordable with equity")
            else:
                score += 10
                reasons.append("Affordable via Bank Loan")
                
            # 2. Skill/Category Alignment
            skill = str(persona.get('Primary_Skill', '')).lower()
            cat = str(row['category']).lower()
            desc = str(row['description']).lower()
            
            if 'agro' in skill or 'farm' in skill:
                if 'cultivation' in cat: 
                    score += 30
                    reasons.append("Matches farming background")
            if 'supply' in skill or 'logistics' in skill:
                if 'trading' in cat or 'supply' in cat or 'cold' in desc:
                    score += 30
                    reasons.append("Matches logistics/supply chain skills")
            if 'food' in skill or 'process' in skill:
                if 'processing' in cat or 'value' in cat:
                    score += 30
                    reasons.append("Matches food processing skills")
                    
            # 3. Risk Alignment
            risk = str(persona.get('Risk_Appetite', 'Medium')).lower()
            tech = str(row['technology_level']).lower()
            
            if risk == 'low' and 'high' in tech:
                score -= 20
                reasons.append("Technology risk too high for preference")
            if risk == 'high' and 'high' in tech:
                score += 15
                reasons.append("Fits high-tech risk appetite")

            scores.append({
                "Opportunity": row['name'],
                "Category": row['category'],
                "Match_Score": score,
                "Investment_Level": row['investment_level'],
                "Why_Recommended": " | ".join(reasons) if reasons else "General Fit"
            })
            
        result_df = pd.DataFrame(scores)
        result_df = result_df.sort_values(by="Match_Score", ascending=False).head(top_n)
        return result_df

if __name__ == "__main__":
    ranker = OpportunityRanker()
    # Test with a synthetic persona
    test_persona = {
        "Capital_INR": 500000,
        "Primary_Skill": "Agronomy knowledge",
        "Risk_Appetite": "Low"
    }
    
    print(f"Ranking for Persona: Capital Rs 5L, Skill: Agronomy, Risk: Low")
    print("-" * 60)
    top_picks = ranker.rank_for_persona(test_persona)
    for idx, row in top_picks.iterrows():
        print(f"[{row['Match_Score']}%] {row['Opportunity']}")
        print(f"   Why: {row['Why_Recommended']}")
        print(f"   Cost: {row['Investment_Level']}\n")
