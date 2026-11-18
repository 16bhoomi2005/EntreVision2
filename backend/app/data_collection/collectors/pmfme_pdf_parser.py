"""
PMFME Guidelines PDF Parser
============================
Extracts structured eligibility rules and subsidy terms from the PMFME
operational-guidelines PDF.

Usage (standalone):
    python pmfme_pdf_parser.py --pdf ../../data/guidelines.pdf

Output:
    data/proccessed/pmfme_rules_parsed.csv
"""
import re
import csv
import logging
import argparse
from pathlib import Path
from typing import List, Dict, Any, Optional

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# 1.  PDF Text Extractor
# ─────────────────────────────────────────────────────────────────────────────

def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract page-tagged text from the supplied guidelines PDF."""
    try:
        import pdfplumber
    except ImportError:
        raise ImportError(
            "pdfplumber is required to parse the guidelines PDF. "
            "Install backend dependencies with: pip install -r backend/requirements.txt"
        ) from None

    with pdfplumber.open(pdf_path) as pdf:
        pages = [
            f"[[PAGE:{page_number}]]\n{page.extract_text() or ''}"
            for page_number, page in enumerate(pdf.pages, start=1)
        ]

    text = "\n".join(pages)
    logger.info("pdfplumber extracted %s chars from %s", f"{len(text):,}", pdf_path.name)
    return text


# ─────────────────────────────────────────────────────────────────────────────
# 2.  Rule Extraction Patterns
# ─────────────────────────────────────────────────────────────────────────────

SUBSIDY_PATTERNS = [
    # "subsidy @35%" / "grant @35%"
    r'\b(?:subsidy|grant)\b\s*(?:(?:of|@)\s*)?(\d{1,3})\s*%',
    # "35% credit-linked capital subsidy"
    r'(\d{1,3})\s*%\s*(?:(?:credit[- ]?linked)\s*)?(?:(?:capital)\s*)?(?:subsidy|grant)\b',
    r'(\d{1,3})\s*%\s*for\s*(?:general|sc/st|women|obc|rural|urban)',
]

SUBSIDY_CAP_PATTERN = (
    r'\b(?:maximum\s+ceiling|maximum|max\.?|ceiling|cap(?:ped)?\s+at|up\s+to)\b'
    r'\s*(?:of\s*)?(?:Rs\.?|INR|₹)?\s*([\d][\d,.]*)\s*(lakh|crore|thousand)?'
)

MARGIN_MONEY_PATTERNS = [
    # "margin money subsidy of 25%"
    r'margin\s*money\s*(?:subsidy)?\s*(?:of\s*)?(\d{1,3})\s*%',
    # "margin money: 15% (urban)"
    r'margin\s*(?:money)?[:\s]+(\d{1,3})\s*%\s*(?:\((\w+)\))?',
]

BENEFICIARY_CONTRIB_PATTERNS = [
    # "beneficiary contribution: 10%"  /  "own contribution of 10%"
    r'(?:beneficiary|own|farmer)\s*contribution\s*(?:of\s*)?(\d{1,3})\s*%',
    # "minimum 10% of project cost"
    r'minimum\s+(?:of\s+)?(\d{1,3})\s*%\s*(?:of\s*(?:total\s*)?project\s*cost)?',
]

PROJECT_COST_PATTERNS = [
    # "project cost up to Rs. 50 Lakhs"
    r'project\s*cost\s*(?:up\s*to|limited\s*to|not\s*exceeding|maximum)\s*'
    r'(?:Rs\.?\s*)?(\d[\d,.]+)\s*(lakh|crore|thousand)?',
    # "Rs. 10 Lakh per unit"
    r'(?:Rs\.?\s*)?(\d[\d,.]+)\s*(lakh|crore)\s*per\s*(?:unit|enterprise|beneficiary)',
]

LOAN_PATTERNS = [
    # "bank loan mandatory" / "with balance being loan from Bank"
    r'bank\s*(?:term\s*)?loan\s*(?:is\s*)?(?:mandatory|required|compulsory|must)',
    r'\bbalance\s+(?:being|through)\s+(?:a\s+)?loan\s+from\s+(?:a\s+)?bank\b',
]

ELIGIBILITY_KEYWORD_PATTERNS = {
    "individual": r'\bindividual\s+(?:micro\s+)?(?:food\s+processing\s+)?(?:units?|enterprises?|entrepreneurs?)\b',
    "fpo":        r'\b(?:FPO|Farmer\s*Producer\s*Organi[sz]ation|Producer\s*Company)\b',
    "shg":        r'\b(?:SHG|Self[- ]Help\s*Group)\b',
    "cooperative":r'\bCo[- ]?operative\b',
    "women":      r'\bwomen\s*entrepreneur\b',
    "sc_st":      r'\bSC[\s/]+ST\b',
}

ELIGIBILITY_CLAUSE_PREFIXES = ("4.2", "5.2.2", "5.3.6", "5.3.7", "6.", "7.5")


# ─────────────────────────────────────────────────────────────────────────────
# 3.  Core Parser
# ─────────────────────────────────────────────────────────────────────────────

def _to_inr(value_str: str, unit: Optional[str]) -> Optional[float]:
    """Convert value + unit string to absolute INR float."""
    try:
        val = float(value_str.replace(",", ""))
        if unit:
            u = unit.lower()
            if "crore" in u:
                val *= 1_00_00_000
            elif "lakh" in u:
                val *= 1_00_000
            elif "thousand" in u:
                val *= 1_000
        return val
    except ValueError:
        return None


def parse_pmfme_rules(
    text: str,
    source_document: str = "",
) -> List[Dict[str, Any]]:
    """
    Extract PMFME eligibility and assistance rules from page-tagged PDF text.

    The downloaded operational guidelines are PMFME-specific. Scheme names
    mentioned inside the document (for example, NABARD in the acronym list)
    are not section boundaries, so every extracted rule is explicitly PMFME.
    """
    rules: List[Dict[str, Any]] = []
    rule_counter = 1
    current_page = ""
    current_clause = ""

    logical_lines = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        page_match = re.fullmatch(r"\[\[PAGE:(\d+)\]\]", line)
        if page_match:
            current_page = page_match.group(1)
            continue

        clause_match = re.match(r"^(\d+(?:\.\d+){0,3})\s+", line)
        if clause_match:
            current_clause = clause_match.group(1)

        is_eligibility_clause = current_clause.startswith(ELIGIBILITY_CLAUSE_PREFIXES)
        starts_bullet = re.match(r"^(?:[ivxlcdm]+|[a-z])\)\s+", line, re.IGNORECASE)
        if (
            is_eligibility_clause
            and logical_lines
            and logical_lines[-1][2] == current_clause
            and logical_lines[-1][1] == current_page
            and not clause_match
            and not starts_bullet
        ):
            previous_line, previous_page, previous_clause = logical_lines[-1]
            logical_lines[-1] = (
                f"{previous_line} {line}",
                previous_page,
                previous_clause,
            )
        else:
            logical_lines.append((line, current_page, current_clause))

    for line, current_page, current_clause in logical_lines:
        source_metadata = {
            "source_page": current_page,
            "clause_number": current_clause,
            "source_document": source_document,
        }

        # ── Subsidy rules ─────────────────────────────────────────────────
        for pat in SUBSIDY_PATTERNS:
            m = re.search(pat, line, re.IGNORECASE)
            if m:
                pct = float(m.group(1))
                cap_inr = None
                cap_match = re.search(SUBSIDY_CAP_PATTERN, line, re.IGNORECASE)
                if cap_match:
                    cap_inr = _to_inr(cap_match.group(1), cap_match.group(2))

                # Determine category tag from context
                category = "general"
                if re.search(r'\bsc[/ ]?st\b|\bwomen\b|\bobc\b', line, re.I):
                    category = "sc_st_women_obc"
                elif re.search(r'\brural\b', line, re.I):
                    category = "rural"

                rules.append({
                    "rule_id":            f"PR{rule_counter:04d}",
                    "scheme_name":        "PMFME",
                    "rule_type":          "SUBSIDY_RATE",
                    "category_tag":       category,
                    "parameter":          "subsidy_percent",
                    "operator":           "EQUALS",
                    "value":              str(pct),
                    "cap_inr":            str(int(cap_inr)) if cap_inr else "",
                    "condition_text":     line[:200],
                    "description":        f"PMFME: {pct}% subsidy" +
                                          (f", cap ₹{cap_inr:,.0f}" if cap_inr else ""),
                    **source_metadata,
                })
                rule_counter += 1
                break   # one rule per line

        # ── Margin money rules ────────────────────────────────────────────
        for pat in MARGIN_MONEY_PATTERNS:
            m = re.search(pat, line, re.IGNORECASE)
            if m:
                pct = float(m.group(1))
                loc_tag = (m.group(2) or "").lower() if m.lastindex >= 2 else ""
                rules.append({
                    "rule_id":            f"PR{rule_counter:04d}",
                    "scheme_name":        "PMFME",
                    "rule_type":          "MARGIN_MONEY",
                    "category_tag":       loc_tag or "general",
                    "parameter":          "margin_money_percent",
                    "operator":           "EQUALS",
                    "value":              str(pct),
                    "cap_inr":            "",
                    "condition_text":     line[:200],
                    "description":        f"PMFME: Margin money {pct}%"
                                          + (f" ({loc_tag})" if loc_tag else ""),
                    **source_metadata,
                })
                rule_counter += 1
                break

        # ── Beneficiary contribution rules ────────────────────────────────
        for pat in BENEFICIARY_CONTRIB_PATTERNS:
            m = re.search(pat, line, re.IGNORECASE)
            if m:
                pct = float(m.group(1))
                rules.append({
                    "rule_id":            f"PR{rule_counter:04d}",
                    "scheme_name":        "PMFME",
                    "rule_type":          "BENEFICIARY_CONTRIBUTION",
                    "category_tag":       "general",
                    "parameter":          "minimum_equity_percent",
                    "operator":           "GTE",
                    "value":              str(pct),
                    "cap_inr":            "",
                    "condition_text":     line[:200],
                    "description":        f"PMFME: Beneficiary must contribute ≥{pct}% own equity",
                    **source_metadata,
                })
                rule_counter += 1
                break

        # ── Project cost ceiling rules ────────────────────────────────────
        for pat in PROJECT_COST_PATTERNS:
            m = re.search(pat, line, re.IGNORECASE)
            if m:
                cap_inr = _to_inr(m.group(1), m.group(2) if m.lastindex >= 2 else None)
                if cap_inr:
                    rules.append({
                        "rule_id":            f"PR{rule_counter:04d}",
                        "scheme_name":        "PMFME",
                        "rule_type":          "PROJECT_COST_CEILING",
                        "category_tag":       "general",
                        "parameter":          "max_project_cost_inr",
                        "operator":           "LTE",
                        "value":              str(int(cap_inr)),
                        "cap_inr":            str(int(cap_inr)),
                        "condition_text":     line[:200],
                        "description":        f"PMFME: Max project cost ₹{cap_inr:,.0f}",
                        **source_metadata,
                    })
                    rule_counter += 1
                    break

        # ── Loan mandatory rules ──────────────────────────────────────────
        for pat in LOAN_PATTERNS:
            if re.search(pat, line, re.IGNORECASE):
                rules.append({
                    "rule_id":            f"PR{rule_counter:04d}",
                    "scheme_name":        "PMFME",
                    "rule_type":          "LOAN_REQUIREMENT",
                    "category_tag":       "general",
                    "parameter":          "bank_loan_mandatory",
                    "operator":           "EQUALS",
                    "value":              "true",
                    "cap_inr":            "",
                    "condition_text":     line[:200],
                    "description":        "PMFME: Bank loan is required for the remaining project cost",
                    **source_metadata,
                })
                rule_counter += 1
                break

        # Names in the acronym list and general narrative are not eligibility
        # rules; only extract applicant types from actual eligibility clauses.
        if current_clause.startswith(ELIGIBILITY_CLAUSE_PREFIXES):
            if re.match(r"^(?:[ivxlcdm]+|[a-z])\)\s+", line, re.IGNORECASE):
                rules.append({
                    "rule_id":            f"PR{rule_counter:04d}",
                    "scheme_name":        "PMFME",
                    "rule_type":          "ELIGIBILITY_CONDITION",
                    "category_tag":       "general",
                    "parameter":          "eligibility_condition",
                    "operator":           "TEXT",
                    "value":              line,
                    "cap_inr":            "",
                    "condition_text":     line[:200],
                    "description":        f"PMFME eligibility: {line}",
                    **source_metadata,
                })
                rule_counter += 1

            for tag, pat in ELIGIBILITY_KEYWORD_PATTERNS.items():
                if re.search(pat, line, re.IGNORECASE):
                    rules.append({
                        "rule_id":            f"PR{rule_counter:04d}",
                        "scheme_name":        "PMFME",
                        "rule_type":          "ELIGIBILITY_ENTITY_TYPE",
                        "category_tag":       tag,
                        "parameter":          "applicant_type",
                        "operator":           "INCLUDES",
                        "value":              tag,
                        "cap_inr":            "",
                        "condition_text":     line[:200],
                        "description":        f"PMFME: Eligible applicant type – {tag.upper()}",
                        **source_metadata,
                    })
                    rule_counter += 1
                    break  # one per line

    logger.info(f"Parsed {len(rules)} rules total from PDF")
    return rules


# ─────────────────────────────────────────────────────────────────────────────
# 4.  Deduplication
# ─────────────────────────────────────────────────────────────────────────────

def deduplicate_rules(rules: List[Dict]) -> List[Dict]:
    """
    Remove exact duplicates while retaining rules from separate clauses.
    Keep the first occurrence.
    """
    seen = set()
    unique = []
    for r in rules:
        key = (
            r["scheme_name"],
            r["rule_type"],
            r["category_tag"],
            r["parameter"],
            r["value"],
            r.get("clause_number", ""),
            r["condition_text"],
        )
        if key not in seen:
            seen.add(key)
            unique.append(r)
    logger.info(f"After dedup: {len(unique)} unique rules (removed {len(rules)-len(unique)} duplicates)")
    return unique


# ─────────────────────────────────────────────────────────────────────────────
# 5.  CSV Writer
# ─────────────────────────────────────────────────────────────────────────────

FIELDNAMES = [
    "rule_id", "scheme_name", "rule_type", "category_tag",
    "parameter", "operator", "value", "cap_inr",
    "condition_text", "description", "clause_number", "source_page",
    "source_document",
]


def save_rules_to_csv(rules: List[Dict], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        for rule in rules:
            writer.writerow({k: rule.get(k, "") for k in FIELDNAMES})
    logger.info(f"Saved {len(rules)} rules → {output_path}")


# ─────────────────────────────────────────────────────────────────────────────
# 6.  Summary Reporter
# ─────────────────────────────────────────────────────────────────────────────

def print_summary(rules: List[Dict]) -> None:
    from collections import Counter
    by_scheme = Counter(r["scheme_name"] for r in rules)
    by_type   = Counter(r["rule_type"]   for r in rules)

    print("\n" + "=" * 58)
    print("  PMFME PDF PARSER - EXTRACTION SUMMARY")
    print("=" * 58)
    print(f"  Total rules extracted  : {len(rules)}")
    print("\n  By Scheme:")
    for scheme, count in by_scheme.most_common():
        print(f"    {scheme:<20} {count:>3} rules")
    print("\n  By Rule Type:")
    for rtype, count in by_type.most_common():
        print(f"    {rtype:<30} {count:>3} rules")
    print("=" * 58 + "\n")


# ─────────────────────────────────────────────────────────────────────────────
# 7.  Main Entry Point
# ─────────────────────────────────────────────────────────────────────────────

def run_parser(pdf_path: Path, output_path: Path) -> List[Dict]:
    """Full pipeline: extract → parse → dedup → save → report."""
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    text = extract_text_from_pdf(pdf_path)
    if not text.strip():
        raise ValueError(f"No text extracted from PDF: {pdf_path}")

    rules = parse_pmfme_rules(text, source_document=pdf_path.name)
    rules = deduplicate_rules(rules)
    if not rules:
        raise ValueError(f"No PMFME rules were extracted from PDF: {pdf_path}")
    save_rules_to_csv(rules, output_path)
    print_summary(rules)
    return rules


if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent

    parser = argparse.ArgumentParser(description="Parse PMFME guidelines PDF into structured CSV rules")
    parser.add_argument(
        "--pdf",
        default=str(BASE_DIR / "data" / "guidelines.pdf"),
        help="Path to the guidelines PDF (default: data/guidelines.pdf)",
    )
    parser.add_argument(
        "--output",
        default=str(BASE_DIR / "data" / "proccessed" / "pmfme_rules_parsed.csv"),
        help="Path for the output CSV",
    )
    args = parser.parse_args()

    run_parser(Path(args.pdf), Path(args.output))
