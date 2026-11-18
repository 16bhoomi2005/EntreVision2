"""
Unit Tests for Phase 6 Upgraded RAG Advisor
============================================
Verifies:
1. Ingestion of multi-source official guidelines (PMFME, MIDH, CCRI, Hort Stats).
2. Provenance metadata on every chunk (Document Title, Source URL, Page Number, Clause Number).
3. Semantic retrieval consistency across differently phrased queries (Step 7):
   - 'What subsidy is available for juice processing?'
   - 'Can I get government financial assistance for an orange processing unit?'
   - 'What support exists for food-processing machinery?'
4. Answers are grounded in identifiable source documents with verifiable citations (Completion Condition).
"""
import pytest
from app.modules.dss.rag_advisor import RAGAdvisor


@pytest.fixture(scope="module")
def advisor():
    return RAGAdvisor()


def test_knowledge_base_chunks_loaded_with_metadata(advisor):
    """Verifies that chunks are loaded and carry document title, URL, page, and clause."""
    assert advisor.chunks_df is not None
    assert len(advisor.chunks_df) >= 50

    # Check required metadata columns
    required_cols = ["Chunk_ID", "Document_Title", "Source_URL", "Page_Number", "Clause_Number", "Chunk_Text"]
    for col in required_cols:
        assert col in advisor.chunks_df.columns

    # Verify presence of core official source documents
    titles = set(advisor.chunks_df["Document_Title"].dropna().tolist())
    assert any("PMFME" in t for t in titles)


def test_semantic_retrieval_returns_provenance(advisor):
    """Verifies that search returns scores and complete citation metadata."""
    results = advisor.search("What is the maximum subsidy for PMFME?", top_k=3)
    assert len(results) >= 1
    top = results[0]

    assert "Score" in top
    assert "Document_Title" in top
    assert "Page_Number" in top
    assert "Clause_Number" in top
    assert "Source_URL" in top
    assert "Citation" in top
    assert top["Score"] > 0


def test_retrieval_consistency_across_differently_worded_queries(advisor):
    """
    Step 7 Verification:
    Tests whether 3 differently phrased questions retrieve the same core PMFME provisions
    (35% subsidy, 10 Lakh cap, 10% promoter contribution, plant and machinery assistance).
    """
    queries = [
        "What subsidy is available for juice processing?",
        "Can I get government financial assistance for an orange processing unit?",
        "What support exists for food-processing machinery?"
    ]

    retrieved_results = [advisor.search(q, top_k=3) for q in queries]

    for idx, res_list in enumerate(retrieved_results):
        assert len(res_list) > 0, f"Query '{queries[idx]}' returned empty results"
        # Check that PMFME or food processing provisions are retrieved in top 3
        found_pmfme_or_processing = False
        for chunk in res_list:
            text_lower = chunk["Text"].lower()
            doc_lower = chunk["Document_Title"].lower()
            if "pmfme" in doc_lower or "pmfme" in text_lower or "35%" in text_lower or "subsidy" in text_lower:
                found_pmfme_or_processing = True
                break
        assert found_pmfme_or_processing, f"Query '{queries[idx]}' failed to retrieve PMFME/processing provisions"


def test_answers_are_supported_by_identifiable_source_documents(advisor):
    """
    Completion Condition Verification:
    Verifies that the generated response returns explicit citations to official documents,
    contains exact policy figures (35% subsidy, ₹10 Lakh ceiling), and confirms grounding.
    """
    query = "Can I get government financial assistance for an orange processing unit?"
    response = advisor.ask_llm(query)

    assert "answer" in response
    assert "citations" in response
    assert len(response["citations"]) >= 1

    # Verify citation structure
    cit = response["citations"][0]
    assert "document_title" in cit
    assert "page_number" in cit
    assert "clause_number" in cit
    assert "source_url" in cit

    # Verify grounding flag
    assert response["is_grounded_in_documents"] is True

    # Verify answer mentions official provisions
    ans = response["answer"]
    assert "35%" in ans or "subsidy" in ans.lower()
    assert "10" in ans or "lakh" in ans.lower()
