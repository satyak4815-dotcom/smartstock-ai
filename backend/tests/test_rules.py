"""
Automated Pytest Suite for Module 9 & 10: Rules and Expert System Conclusions
Verifies the exact 4/2/1/1/3 + 1 split on sample data.
"""

import json
import os
import pytest
from backend.ai.knowledge.chaining import run_forward_chaining, run_backward_chaining
from backend.ai.knowledge.expert_system import ExpertSystem


def load_sample_products():
    path = os.path.join(os.path.dirname(__file__), "..", "data", "products.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_sample_suppliers():
    path = os.path.join(os.path.dirname(__file__), "..", "data", "suppliers.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def test_forward_chaining_sample_data_oracle():
    """
    SECTION 7 ORACLE TEST:
    Must produce exactly:
    - Urgent reorder (R1): Milk1L, Curd 500g, Rice 5kg, Cooking Oil 1L (4)
    - Normal reorder (R2): Detergent 1kg, Soap (2)
    - Discount (R3): Bread (1)
    - Find other supplier (R4): Eggs (1)
    - Check stock (R5): Biscuits, Tea 250g, Sugar 1kg (3)
    - No action: Salt 1kg (1)
    Total conclusions = 11.
    """
    products = load_sample_products()
    result = run_forward_chaining(products, festival_season=False)

    counts = result["counts"]
    assert counts["urgent"] == 4, f"Expected 4 urgent reorders, got {counts['urgent']}"
    assert counts["normal"] == 2, f"Expected 2 normal reorders, got {counts['normal']}"
    assert counts["discount"] == 1, f"Expected 1 discount, got {counts['discount']}"
    assert counts["find_supplier"] == 1, f"Expected 1 find supplier, got {counts['find_supplier']}"
    assert counts["check_stock"] == 3, f"Expected 3 check stock, got {counts['check_stock']}"
    assert counts["no_action"] == 1, f"Expected 1 no action, got {counts['no_action']}"
    assert result["total_conclusions"] == 11, f"Expected 11 total conclusions, got {result['total_conclusions']}"

    # Verify exact product assignments
    action_map = {item["product_name"]: item["action"] for item in result["agenda"]}
    
    # Urgent
    assert action_map["Milk1L"] == "reorder_urgent"
    assert action_map["Curd 500g"] == "reorder_urgent"
    assert action_map["Rice 5kg"] == "reorder_urgent"
    assert action_map["Cooking Oil 1L"] == "reorder_urgent"

    # Normal
    assert action_map["Detergent 1kg"] == "reorder_normal"
    assert action_map["Soap"] == "reorder_normal"

    # Discount
    assert action_map["Bread"] == "discount"

    # Find supplier
    assert action_map["Eggs (tray)"] == "find_other_supplier"

    # Check stock
    assert action_map["Biscuits"] == "check_stock"
    assert action_map["Tea 250g"] == "check_stock"
    assert action_map["Sugar 1kg"] == "check_stock"

    # No action
    assert action_map["Salt 1kg"] == "no_action"


def test_festival_season_toggle_changes():
    """Festival season must increase demand and alter conclusions."""
    products = load_sample_products()
    normal_res = run_forward_chaining(products, festival_season=False)
    festival_res = run_forward_chaining(products, festival_season=True)

    assert festival_res["festival_season"] is True
    # In festival season, demand is 1.5x and thresholds are 1.5x, so conclusions shift
    assert festival_res["counts"] != normal_res["counts"]
    
    # Check that explanation mentions the festival heuristic
    urgent_items = [c for c in festival_res["conclusions"] if c["action"] == "reorder_urgent"]
    assert any("festival" in u["reason"].lower() for u in urgent_items)


def test_backward_chaining_proof_trees():
    """Tests backward chaining proof tree for Milk1L and disproof for Eggs."""
    products = load_sample_products()
    
    # Milk1L -> ReorderUrgent should be PROVEN
    proof_milk = run_backward_chaining("P1", "ReorderUrgent", products)
    assert proof_milk["proved"] is True
    assert len(proof_milk["subgoals"]) == 3

    # Eggs -> ReorderUrgent should FAIL (No supplier)
    proof_eggs_urgent = run_backward_chaining("P3", "ReorderUrgent", products)
    assert proof_eggs_urgent["proved"] is False

    # Eggs -> FindOtherSupplier should be PROVEN
    proof_eggs_supp = run_backward_chaining("P3", "FindOtherSupplier", products)
    assert proof_eggs_supp["proved"] is True
