"""
SmartStock AI - Module 9: Propositional Logic
Topic: Propositional Logic, Truth Tables, Inference Rules, Gap Analysis
Course: BTech CSE 2nd Year Artificial Intelligence (CCSAI0301)
Team 80: NIET Greater Noida

Propositions:
  L: LowStock (stock < reorder_level)
  F: FastMoving (daily_sales >= 8)
  S: SupplierAvailable (supplier exists and is active)
  P: Perishable (item has an expiry constraint)
  N: NearExpiry (perishable and days_to_expiry <= 2)

Rules:
  R1: L ^ F ^ S -> ReorderUrgent
  R2: L ^ ~F ^ S -> ReorderNormal
  R3: P ^ N ^ ~L -> Discount
  R4: L ^ ~S -> FindOtherSupplier  (Added to close the unhandled gap found in truth table!)
  R5: ~L ^ ~N ^ (stock <= 1.25 * reorder_level) -> CheckStock
"""

from typing import Dict, List, Any


def evaluate_r1(L: bool, F: bool, S: bool) -> bool:
    """R1: L ^ F ^ S -> ReorderUrgent"""
    premise = L and F and S
    return premise


def evaluate_r2(L: bool, F: bool, S: bool) -> bool:
    """R2: L ^ ~F ^ S -> ReorderNormal"""
    premise = L and (not F) and S
    return premise


def evaluate_r3(P: bool, N: bool, L: bool) -> bool:
    """R3: P ^ N ^ ~L -> Discount"""
    premise = P and N and (not L)
    return premise


def evaluate_r4(L: bool, S: bool) -> bool:
    """R4: L ^ ~S -> FindOtherSupplier"""
    premise = L and (not S)
    return premise


def generate_truth_table_r1_r3() -> Dict[str, Any]:
    """
    Proves that Rule 1 (L ^ F ^ S) and Rule 3 (P ^ N ^ ~L) are mutually exclusive.
    Since R1 requires L = True and R3 requires ~L (L = False), both premises
    can NEVER be True simultaneously (L ^ ~L is a contradiction / unsatisfiable).
    """
    headers = ["L (LowStock)", "F (FastMoving)", "S (Supplier)", "P (Perishable)", "N (NearExpiry)", "R1 Premise", "R3 Premise", "Both Fire (R1 ^ R3)"]
    rows = []
    # Test all relevant boolean combinations of L, F, S, P, N
    # To keep table readable, iterate over L, P, N, and sample F, S = True
    for L in [True, False]:
        for F in [True, False]:
            for S in [True, False]:
                for P in [True, False]:
                    for N in [True, False]:
                        r1_val = evaluate_r1(L, F, S)
                        r3_val = evaluate_r3(P, N, L)
                        both = r1_val and r3_val
                        rows.append({
                            "L": L, "F": F, "S": S, "P": P, "N": N,
                            "R1": r1_val, "R3": r3_val, "both": both
                        })

    both_fire_count = sum(1 for r in rows if r["both"])
    return {
        "headers": headers,
        "rows": rows[:16],  # sample 16 rows for clean UI display
        "total_combinations": len(rows),
        "both_fire_count": both_fire_count,
        "is_mutually_exclusive": (both_fire_count == 0),
        "formal_proof": "Premise of R1 contains L. Premise of R3 contains ¬L. By Law of Non-Contradiction: L ∧ ¬L ≡ FALSE. Therefore R1 and R3 can never fire simultaneously."
    }


def find_propositional_gaps() -> Dict[str, Any]:
    """
    Gap Finder:
    Evaluates all 2^3 = 8 combinations of (L, F, S).
    Shows which combination was unhandled before Rule R4 was added:
    (L=True, S=False) was unhandled!
    For example, Eggs had LowStock (L=True) but No Supplier (S=False).
    Rule R4 (L ^ ~S -> FindOtherSupplier) closes this exact gap.
    """
    combinations = []
    for L in [True, False]:
        for F in [True, False]:
            for S in [True, False]:
                # Before R4
                before_action = None
                if L and F and S:
                    before_action = "ReorderUrgent (R1)"
                elif L and (not F) and S:
                    before_action = "ReorderNormal (R2)"
                
                # After R4
                after_action = before_action
                if not after_action and L and (not S):
                    after_action = "FindOtherSupplier (R4)"

                is_gap_before = (L and not S)
                
                combinations.append({
                    "L": L,
                    "F": F,
                    "S": S,
                    "state_description": f"{'Low Stock' if L else 'Normal/High Stock'}, {'Fast Moving' if F else 'Slow Moving'}, {'Supplier Available' if S else 'NO Supplier'}",
                    "action_before_r4": before_action if before_action else "GAP (Unhandled Case)",
                    "action_after_r4": after_action if after_action else "No Reorder Action",
                    "was_gap": is_gap_before,
                    "example_product": "Eggs (tray)" if (L and not S) else ("Milk1L" if (L and F and S) else ("Detergent" if (L and not F and S) else "-"))
                })

    return {
        "combinations": combinations,
        "gap_explanation": "When L=True and S=False (e.g. Eggs: stock is low, but no active supplier exists), neither R1 nor R2 could fire because both required S=True. The truth-table analysis revealed this unhandled state, leading to the creation of R4: L ∧ ¬S → FindOtherSupplier.",
        "resolved": True
    }


def get_inference_rules_demo() -> List[Dict[str, str]]:
    """
    Standard Rules of Inference demonstration with inventory examples.
    """
    return [
        {
            "name": "Modus Ponens (Affirming the Antecedent)",
            "rule": "P -> Q, P  |=  Q",
            "example": "If Milk is LowStock and FastMoving, then ReorderUrgent.\nMilk is LowStock and FastMoving.\nTherefore, ReorderUrgent(Milk)."
        },
        {
            "name": "Modus Tollens (Denying the Consequent)",
            "rule": "P -> Q, ¬Q  |=  ¬P",
            "example": "If Item is OrderedUrgent, then Supplier must be Available.\nSupplier is NOT Available (for Eggs).\nTherefore, Eggs is NOT OrderedUrgent."
        },
        {
            "name": "And-Elimination (Simplification)",
            "rule": "P ∧ Q  |=  P",
            "example": "Milk is LowStock ∧ FastMoving.\nTherefore, Milk is LowStock."
        },
        {
            "name": "Resolution",
            "rule": "P ∨ Q, ¬P ∨ R  |=  Q ∨ R",
            "example": "ReorderUrgent ∨ DiscountNearExpiry, ¬ReorderUrgent ∨ SupplierAvailable.\nTherefore: DiscountNearExpiry ∨ SupplierAvailable."
        }
    ]
