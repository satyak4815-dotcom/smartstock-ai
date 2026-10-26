"""
SmartStock AI - Module 9: Types of Knowledge & Reasoning Paradigms
Topic: Declarative, Procedural, Meta, Heuristic, Structural Knowledge & Abductive/Inductive Reasoning
Course: BTech CSE 2nd Year Artificial Intelligence (CCSAI0301)
Team 80: NIET Greater Noida

Implements:
1. Knowledge Taxonomy: Declarative, Procedural, Meta, Heuristic, Structural examples.
2. 6 Steps of Knowledge Engineering Stepper.
3. Abduction Mini-Demo: Inference to the Best Explanation for sudden stock discrepancies.
4. Confidence Evaluation (Meta-Knowledge).
"""

from typing import Dict, List, Any


def get_types_of_knowledge() -> Dict[str, Any]:
    """Returns classification and real examples from SmartStock AI."""
    return {
        "types": [
            {
                "type": "Declarative Knowledge",
                "definition": "Explicit factual statements about what is true in the domain ('know-what').",
                "example": "Milk1L stock is 14 units; Fresh Dairy Co MOQ is 20 units; Bread expiry is in 1 day.",
                "color": "blue"
            },
            {
                "type": "Procedural Knowledge",
                "definition": "Operational rules and algorithms detailing how to achieve goals ('know-how').",
                "example": "Step 1: Check stock < threshold; Step 2: Query best supplier; Step 3: Run CSP check; Step 4: Dispatch PO.",
                "color": "green"
            },
            {
                "type": "Meta-Knowledge",
                "definition": "Knowledge about knowledge — reliability, source credibility, and certainty ('know-about-knowing').",
                "example": "Confidence is capped at 'Medium' because the system runs on a 12-item sample catalog without historical POS integration.",
                "color": "purple"
            },
            {
                "type": "Heuristic Knowledge",
                "definition": "Rules of thumb and empirical shortcuts derived from field experience ('know-rule-of-thumb').",
                "example": "Field rule from local store owner: 'During festival season, boost milk/bread reorder threshold by 50%'.",
                "color": "orange"
            },
            {
                "type": "Structural Knowledge",
                "definition": "Relationships, taxonomies, and hierarchies connecting domain concepts ('know-relationships').",
                "example": "Milk1L is-a PerishableProduct; PerishableProduct is-a Product; Cleaning incompatible-with Dairy.",
                "color": "teal"
            }
        ],
        "kb_construction_steps": [
            {"step": 1, "title": "Identify Domain", "desc": "Retail inventory replenishment for small grocer (CCSAI0301 Scope)"},
            {"step": 2, "title": "Knowledge Acquisition", "desc": "Interviewed local store manager to gather thumb rules (bread/milk daily checks, discount near-expiry)"},
            {"step": 3, "title": "Knowledge Representation", "desc": "Formalised into propositional rules (R1-R5), frames, and semantic graph"},
            {"step": 4, "title": "Knowledge Storage", "desc": "Structured into JSON catalogs with slot defaults and relational links"},
            {"step": 5, "title": "Inference Engine", "desc": "Implemented forward chaining (daily runs) and backward chaining ('Why?' proof trees)"},
            {"step": 6, "title": "Knowledge Validation & Update", "desc": "Checked truth-table completeness (added R4 gap fix) and festival heuristic toggle"}
        ]
    }


def run_abduction_demo(product_name: str = "Milk1L", previous_stock: int = 40, current_stock: int = 14) -> Dict[str, Any]:
    """
    Abductive Reasoning (Inference to the Best Explanation):
    Given an observed symptom (e.g. Stock dropped from 40 to 14, > 40% sudden drop overnight),
    we generate hypotheses and rank them by prior probability and situational evidence.
    """
    drop_units = previous_stock - current_stock
    drop_pct = (drop_units / previous_stock) * 100 if previous_stock > 0 else 0

    candidates = [
        {
            "hypothesis": "Sudden Sales Surge / Bulk Purchase",
            "prior_probability": 0.45,
            "evidence": f"Item has high daily velocity. Large family or morning event purchase.",
            "plausibility_score": 85 if drop_pct > 30 else 50,
            "recommended_action": "Verify POS cash register transaction slips for batch barcode scans."
        },
        {
            "hypothesis": "Spoilage / Expiry Batch Write-Off",
            "prior_probability": 0.30,
            "evidence": "Perishable item. If refrigerator temperature fluctuated, staff discarded bad crates.",
            "plausibility_score": 75 if product_name in ["Milk1L", "Bread", "Curd 500g"] else 20,
            "recommended_action": "Check warehouse waste/damaged goods disposal log."
        },
        {
            "hypothesis": "Data Entry / Barcode Mis-scan Error",
            "prior_probability": 0.15,
            "evidence": "Staff may have typed '14' instead of '34' during evening manual stock tally.",
            "plausibility_score": 60,
            "recommended_action": "Order physical recount of current crates on shelf."
        },
        {
            "hypothesis": "Theft / Pilferage / Warehouse Misplacement",
            "prior_probability": 0.10,
            "evidence": "Unrecorded removal from stockroom shelf or misplaced in wrong rack zone.",
            "plausibility_score": 40,
            "recommended_action": "Review CCTV footage near Dairy rack aisle."
        }
    ]

    # Rank by combined score (plausibility * prior)
    for c in candidates:
        c["overall_rank_score"] = round(c["plausibility_score"] * c["prior_probability"], 1)

    candidates.sort(key=lambda x: x["overall_rank_score"], reverse=True)

    best_explanation = candidates[0]

    return {
        "observation": f"Observed overnight drop for '{product_name}': from {previous_stock} to {current_stock} units (-{drop_pct:.1f}% drop).",
        "drop_units": drop_units,
        "drop_percent": round(drop_pct, 1),
        "hypotheses": candidates,
        "best_explanation": best_explanation["hypothesis"],
        "reasoning": f"By abductive inference, '{best_explanation['hypothesis']}' has the highest posterior likelihood score ({best_explanation['overall_rank_score']}).",
        "label": "Abduction: Best Explanation Guess"
    }
