"""
Automated Pytest Suite for Module 9: Propositional Logic and FOL
Tests:
- Truth table mutual exclusion proof (R1 and R3)
- Propositional gap finder (L ^ ~S closed by R4)
- FOL Unification with occurs-check
- FOL Resolution refutation deriving empty clause
"""

import pytest
from backend.ai.knowledge.propositional import generate_truth_table_r1_r3, find_propositional_gaps
from backend.ai.knowledge.fol import unify_terms, run_resolution_refutation_milk, occurs_check


def test_truth_table_r1_r3_mutual_exclusion():
    """Verify that R1 and R3 can NEVER fire together (contradiction)."""
    result = generate_truth_table_r1_r3()
    assert result["is_mutually_exclusive"] is True
    assert result["both_fire_count"] == 0


def test_gap_finder_closed_by_r4():
    """Verify the truth-table gap where L=True and S=False is identified and resolved by R4."""
    gap_result = find_propositional_gaps()
    assert gap_result["resolved"] is True
    combos = gap_result["combinations"]
    
    # Locate L=True, S=False
    gap_combos = [c for c in combos if c["L"] and not c["S"]]
    assert len(gap_combos) > 0
    for gc in gap_combos:
        assert gc["action_before_r4"] == "GAP (Unhandled Case)"
        assert "FindOtherSupplier (R4)" in gc["action_after_r4"]


def test_fol_unification():
    """
    Test unification returns {x/Milk1L, y/Bread}
    term1: ['Reorder', 'x', 'Bread']
    term2: ['Reorder', 'Milk1L', 'y']
    """
    term1 = ["Reorder", "x", "Bread"]
    term2 = ["Reorder", "Milk1L", "y"]
    theta = unify_terms(term1, term2)
    assert theta is not None
    assert theta.get("x") == "Milk1L"
    assert theta.get("y") == "Bread"


def test_fol_unification_occurs_check():
    """Verify occurs-check prevents unifying x with f(x)."""
    assert occurs_check("x", ["f", "x"]) is True
    theta = unify_terms("x", ["f", "x"])
    assert theta is None  # Should fail due to occurs-check


def test_fol_resolution_refutation():
    """Verify resolution refutation proves ReorderUrgent(Milk1L) by deriving □."""
    res = run_resolution_refutation_milk()
    assert res["proved"] is True
    final_step = res["steps"][-1]
    assert "□" in final_step["resolvent"]
