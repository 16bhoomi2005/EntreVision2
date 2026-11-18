from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.modules.dss.ranker import OpportunityRanker
from app.modules.dss.financial_engine import FinancialEngine
from app.modules.dss.agentic_sql import AgenticDatabaseAdvisor

router = APIRouter(
    prefix="/dss",
    tags=["Decision Support System"]
)

# Initialize the engines (Loads data into memory once at startup)
ranker_engine = OpportunityRanker()
financial_engine = FinancialEngine()
agentic_engine = AgenticDatabaseAdvisor()

# --- Pydantic Models for Requests ---
class PersonaRequest(BaseModel):
    Capital_INR: float
    Primary_Skill: str
    Risk_Appetite: str

class FinanceRequest(BaseModel):
    Project_Name: str
    Base_Capex: float
    User_Category: str = "General"

class RAGRequest(BaseModel):
    query: str
    top_k: int = 3

# --- Endpoints ---

@router.post("/rank-opportunities", response_model=List[Dict[str, Any]])
async def rank_opportunities(persona: PersonaRequest):
    """
    M1: Evaluates a user's capital, skills, and risk to return the top recommended business models.
    """
    try:
        results_df = ranker_engine.rank_for_persona(persona.model_dump())
        if results_df.empty:
            return []
        return results_df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calculate-finance", response_model=Dict[str, Any])
async def calculate_finance(req: FinanceRequest):
    """
    M3: Calculates the financial waterfall (Capex, Subsidy, Margin Money, Bank Loan)
    using live PMFME/MIDH rules based on the project category.
    """
    try:
        result = financial_engine.calculate_project_finance(
            project_name=req.Project_Name,
            base_capex=req.Base_Capex,
            user_category=req.User_Category
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/advisor/search")
async def rag_search(req: RAGRequest):
    """
    M5: RAG Agro Advisor that uses verified government PDF guidelines
    and semantic search to answer user questions with identifiable citations.
    """
    try:
        response = agentic_engine.ask_database(user_question=req.query)
        rag_direct = agentic_engine.rag_engine.ask_llm(query=req.query)
        
        answer = response.get("answer") or rag_direct.get("answer")
        citations = rag_direct.get("citations") or response.get("citations", [])
        top_chunks = rag_direct.get("top_chunks", [])

        return {
            "query": req.query,
            "answer": answer,
            "citations": citations,
            "top_chunks": top_chunks,
            "sql_used": response.get("sql_used"),
            "embedding_engine": rag_direct.get("embedding_engine"),
            "is_grounded_in_documents": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
