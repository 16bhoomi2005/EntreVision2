"""
RAG Knowledge Base Document Chunker (Phase 6 Upgraded)
======================================================
Extracts, structures, and chunks text from official government PDFs and technical circulars:
- PMFME Guidelines (MoFPI)
- MIDH Horticulture Guidelines 2025 (NHM)
- Horticulture Statistics at a Glance 2023
- Citrus Post-Harvest Research Journal (CCRI / ICAR)
- Maharashtra Agribusiness Scheme Circulars

Preserves essential provenance metadata on every chunk:
- Document Title
- Source URL
- Page Number
- Clause Number
- Chunk ID
- Cleaned Chunk Text
"""
import re
import csv
import logging
from pathlib import Path
from typing import List, Dict, Any
import pypdf

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def clean_text(text: str) -> str:
    """Removes excessive whitespace and unprintable characters."""
    if not text:
        return ""
    text = re.sub(r'[\r\n\t]+', ' ', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()


def extract_clause(text: str) -> str:
    """Attempts to identify clause or section numbering (e.g. 4.1, 5.2.1, Section 3)."""
    match = re.search(r'(?:clause|section|para)?\s*(\d+\.\d+(?:\.\d+)?)', text, re.IGNORECASE)
    if match:
        return f"Clause {match.group(1)}"
    return "General Provision"


def chunk_page_text(
    text: str,
    doc_title: str,
    source_url: str,
    page_num: int,
    doc_code: str,
    chunk_size: int = 250,
    overlap: int = 50
) -> List[Dict[str, Any]]:
    """Splits a single page's text into sliding-window chunks with metadata."""
    cleaned = clean_text(text)
    words = cleaned.split()
    if not words:
        return []

    chunks = []
    start = 0
    sub_id = 1

    while start < len(words):
        end = start + chunk_size
        chunk_words = words[start:end]
        chunk_text = " ".join(chunk_words)

        clause = extract_clause(chunk_text)
        chunk_id = f"{doc_code}_P{page_num:02d}_C{sub_id:02d}"

        chunks.append({
            "Chunk_ID": chunk_id,
            "Document_Title": doc_title,
            "Source_URL": source_url,
            "Page_Number": f"Page {page_num}",
            "Clause_Number": clause,
            "Chunk_Text": chunk_text,
            "Word_Count": len(chunk_words)
        })

        if end >= len(words):
            break
        start += (chunk_size - overlap)
        sub_id += 1

    return chunks


def build_rag_database():
    base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
    data_dir = base_dir / "data"
    out_dir = data_dir / "proccessed"
    out_dir.mkdir(parents=True, exist_ok=True)

    sources = [
        {
            "filename": "guidelines.pdf",
            "doc_code": "PMFME",
            "doc_title": "PMFME Scheme Guidelines (MoFPI)",
            "source_url": "https://mofpi.gov.in/pmfme",
            "max_pages": 33
        },
        {
            "filename": "082825102800MIDH Guideline 2025.pdf",
            "doc_code": "MIDH",
            "doc_title": "MIDH Operational Guidelines 2025 (NHM)",
            "source_url": "https://midh.gov.in/guidelines2025",
            "max_pages": 50  # Index first 50 core operational pages
        },
        {
            "filename": "research journal.pdf",
            "doc_code": "CCRI",
            "doc_title": "Citrus Research & Processing Journal (CCRI / ICAR)",
            "source_url": "https://ccri.icar.gov.in",
            "max_pages": 4
        },
        {
            "filename": "Horticultural_Statistics_Glance_2023.pdf",
            "doc_code": "HORT_STAT",
            "doc_title": "Horticulture Statistics at a Glance 2023 (MoAFW)",
            "source_url": "https://agricoop.nic.in/horticulture-statistics-2023",
            "max_pages": 35  # First 35 overview & fruit crop pages
        }
    ]

    all_chunks: List[Dict[str, Any]] = []

    for src in sources:
        pdf_path = data_dir / src["filename"]
        if not pdf_path.exists():
            logger.warning(f"File not found: {pdf_path}")
            continue

        try:
            reader = pypdf.PdfReader(str(pdf_path))
            n_pages = min(len(reader.pages), src["max_pages"])
            logger.info(f"Extracting {src['doc_title']} ({n_pages} pages)...")

            for p_idx in range(n_pages):
                page_text = reader.pages[p_idx].extract_text() or ""
                if len(page_text.strip()) > 30:
                    page_chunks = chunk_page_text(
                        text=page_text,
                        doc_title=src["doc_title"],
                        source_url=src["source_url"],
                        page_num=p_idx + 1,
                        doc_code=src["doc_code"],
                        chunk_size=200,
                        overlap=40
                    )
                    all_chunks.extend(page_chunks)

        except Exception as e:
            logger.error(f"Error reading PDF {src['filename']}: {e}")

    # Also include government scheme text circulars if available
    gov_txt = data_dir / "raw" / "orange" / "government" / "government_schemes_and_subsidy_guidelines.txt"
    if gov_txt.exists():
        try:
            with open(gov_txt, "r", encoding="utf-8", errors="replace") as f:
                txt_content = f.read()
            paras = [p.strip() for p in txt_content.split("\n\n") if len(p.strip()) > 50]
            for idx, p in enumerate(paras, 1):
                all_chunks.append({
                    "Chunk_ID": f"GOV_CIRC_C{idx:03d}",
                    "Document_Title": "Maharashtra Agribusiness Subsidy Compendium (Govt Circulars)",
                    "Source_URL": "https://mahadhan.gov.in/schemes",
                    "Page_Number": "Circular Sec 1",
                    "Clause_Number": extract_clause(p),
                    "Chunk_Text": clean_text(p),
                    "Word_Count": len(p.split())
                })
        except Exception as e:
            logger.warning(f"Error reading government scheme text: {e}")

    if all_chunks:
        out_path = out_dir / "rag_knowledge_base_chunks.csv"
        fieldnames = ["Chunk_ID", "Document_Title", "Source_URL", "Page_Number", "Clause_Number", "Chunk_Text", "Word_Count"]
        with open(out_path, "w", newline="", encoding="utf-8", errors="replace") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_chunks)
        logger.info(f"RAG Knowledge Base successfully compiled: {len(all_chunks)} chunks written to {out_path.name}")
        return len(all_chunks)
    return 0


if __name__ == "__main__":
    count = build_rag_database()
    print(f"Total chunks created: {count}")
