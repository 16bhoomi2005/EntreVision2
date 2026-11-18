from pathlib import Path

from app.data_collection.collectors.pmfme_pdf_parser import (
    deduplicate_rules,
    extract_text_from_pdf,
    parse_pmfme_rules,
)


def test_parses_assistance_and_eligibility_with_citations():
    text = """[[PAGE:7]]
4.1 Individual micro food processing units would be provided credit-linked capital
subsidy @35% of the eligible project cost with a maximum ceiling of Rs.10.0 lakh
per unit. Beneficiary contribution should be minimum of 10% of the project cost
with balance being loan from Bank.
4.2 Eligibility criteria for individual micro enterprises under the scheme:
i) Existing micro food processing units
in operations;
[[PAGE:8]]
NABARD National Bank for Agriculture and Rural Development
"""

    rules = deduplicate_rules(parse_pmfme_rules(text, "guidelines.pdf"))

    subsidy = next(rule for rule in rules if rule["rule_type"] == "SUBSIDY_RATE")
    assert subsidy["value"] == "35.0"
    assert subsidy["cap_inr"] == "1000000"
    assert subsidy["clause_number"] == "4.1"
    assert subsidy["source_page"] == "7"
    assert subsidy["source_document"] == "guidelines.pdf"

    contribution = next(
        rule for rule in rules
        if rule["rule_type"] == "BENEFICIARY_CONTRIBUTION"
    )
    assert contribution["value"] == "10.0"

    loan = next(rule for rule in rules if rule["rule_type"] == "LOAN_REQUIREMENT")
    assert loan["value"] == "true"

    condition = next(
        rule for rule in rules
        if rule["rule_type"] == "ELIGIBILITY_CONDITION"
    )
    assert condition["value"] == "i) Existing micro food processing units in operations;"
    assert condition["clause_number"] == "4.2"
    assert condition["source_page"] == "7"
    assert {rule["scheme_name"] for rule in rules} == {"PMFME"}
    assert all("NABARD National Bank" not in rule["condition_text"] for rule in rules)


def test_extracts_rules_from_downloaded_guidelines_pdf():
    project_root = Path(__file__).resolve().parents[2]
    pdf_path = project_root / "data" / "guidelines.pdf"
    rules = parse_pmfme_rules(
        extract_text_from_pdf(pdf_path),
        source_document=pdf_path.name,
    )

    subsidy = next(
        rule
        for rule in rules
        if rule["rule_type"] == "SUBSIDY_RATE"
        and rule["clause_number"] == "4.1"
    )
    assert subsidy["value"] == "35.0"
    assert subsidy["cap_inr"] == "1000000"
    assert subsidy["source_page"] == "7"
