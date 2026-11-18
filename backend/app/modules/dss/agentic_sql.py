import os
import json
import logging
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from app.modules.dss.rag_advisor import RAGAdvisor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgenticDatabaseAdvisor:
    def __init__(self):
        load_dotenv()
        self.db_url = os.getenv("DATABASE_URL")
        if self.db_url and self.db_url.startswith("postgresql://"):
            self.db_url = self.db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        self.api_key = os.getenv("GEMINI_API_KEY")
        try:
            self.engine = create_engine(self.db_url) if self.db_url else None
        except Exception:
            self.engine = None
        self.rag_engine = RAGAdvisor()
        
        self.schema_context = """
        Database Schema:
        1. distances (from_tehsil_id, to_site_id, distance_km, travel_minutes)
        2. mandi_prices_history (price_date, state, district, market, commodity, variety, min_price, max_price, modal_price)
        3. opportunities (business_model, category, capex_min, capex_max, opex_annual, revenue_annual, margin_pct)
        4. local_competitors (company_name, location, scale, products, notes)
        5. power_tariffs (tariff_category, connection_type, fixed_charge_rs_per_kw_month, total_variable_charge_rs, notes)
        6. demographics (tehsil_name, population_2011, hq_distance_to_nagpur_km, total_area_sq_km)
        7. processing_yields (component, average_recovery_pct, min_pct, max_pct, notes)
        8. groundwater_levels (tehsil_id, tehsil_name, groundwater_status, avg_depth_mbgl_pre_monsoon)
        9. soil_quality (tehsil_id, tehsil_name, primary_soil_type, drainage_quality, citrus_suitability)
        10. commercial_capacities (facility_id, facility_name, type, location, daily_capacity_mt, total_area_acres)
        11. export_destinations (destination_country, export_rank, transport_mode, primary_season)
        12. global_demand (product_category, global_market_size_usd_billion, cagr_pct, forecast_year)
        13. labour_wages (worker_type, zone_i_monthly_inr, zone_ii_monthly_inr, zone_iii_monthly_inr)
        14. business_models (model_id, category, model_name, est_capex_inr, est_opex_monthly_inr, margin_pct, est_roi_months)
        15. live_mandi_prices_timeseries (mandi, commodity, date, min_price, max_price, modal_price, arrivals_tonnes)
        """

    def execute_sql_query(self, query: str) -> str:
        """Executes a READ-ONLY SQL query against the PostgreSQL database."""
        logger.info(f"LLM Generated SQL: {query}")
        if not query.strip().lower().startswith("select"):
            return "Error: Only SELECT queries are allowed."
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text(query))
                rows = [dict(row._mapping) for row in result]
                return json.dumps(rows, default=str)
        except Exception as e:
            return f"SQL Error: {str(e)}"
            
    def search_guidelines(self, query: str) -> str:
        """Searches the official government PDFs for rules and guidelines."""
        logger.info(f"LLM Searching PDFs for: {query}")
        return self.rag_engine.generate_prompt_context(query)

    def ask_database(self, user_question: str) -> dict:
        if not self.api_key:
            return {"answer": "Gemini API key not configured. Please add GEMINI_API_KEY in .env.", "sql_used": None}

        # Check if database SQL query is needed and database is connected
        sql_used = None
        sql_context = ""
        if self.engine is not None:
            q_lower = user_question.lower()
            if any(k in q_lower for k in ["how far", "distance", "km", "minutes", "tariff", "rate per kwh", "yield", "mandi price"]):
                try:
                    from google import genai
                    client = genai.Client(api_key=self.api_key)
                    sql_gen_prompt = f"Given this database schema:\n{self.schema_context}\nWrite ONLY a single Postgres SELECT SQL query to answer this user question: '{user_question}'. Do not explain, return ONLY the raw SQL string."
                    sql_resp = client.models.generate_content(model="gemini-flash-latest", contents=sql_gen_prompt)
                    candidate_sql = sql_resp.text.strip().replace("```sql", "").replace("```", "").strip()
                    if candidate_sql.lower().startswith("select"):
                        sql_used = candidate_sql
                        sql_context = self.execute_sql_query(candidate_sql)
                except Exception as e:
                    logger.warning(f"SQL execution skipped or failed: {e}")

        # Use RAG Advisor + Gemini to generate the final verified response
        try:
            rag_res = self.rag_engine.ask_llm(user_question)
            if rag_res and rag_res.get("answer") and "Failed to contact LLM" not in rag_res.get("answer"):
                answer = rag_res["answer"]
                if sql_used and sql_context and "Error" not in sql_context:
                    answer += f"\n\n*(Verified with Live Database: `{sql_used}`)*"
                return {
                    "answer": answer,
                    "sql_used": sql_used,
                    "sources": rag_res.get("sources", []),
                    "citations": rag_res.get("citations", []),
                    "top_chunks": rag_res.get("top_chunks", [])
                }
        except Exception as e:
            logger.warning(f"RAG advisor failed: {e}")

        # Fallback to direct Gemini Flash answer
        try:
            from google import genai
            client = genai.Client(api_key=self.api_key)
            prompt = f"You are the EntreVision AI Agro Advisor for Nagpur and Vidarbha agribusiness, PMFME, and MIDH horticulture schemes. User asks: {user_question}"
            resp = client.models.generate_content(model="gemini-flash-latest", contents=prompt)
            return {"answer": resp.text, "sql_used": sql_used}
        except Exception as e:
            logger.error(f"Unified Agent Error: {e}")
            return {"answer": f"Error contacting AI Advisor: {e}", "sql_used": None}

if __name__ == "__main__":
    agent = AgenticDatabaseAdvisor()
    print("User: How far is Katol (T02) from Kalamna APMC (M01)?")
    res = agent.ask_database("How far is Katol (T02) from Kalamna APMC (M01)?")
    print(f"SQL Executed: {res['sql_used']}")
    print(f"AI Answer: {res['answer']}")
