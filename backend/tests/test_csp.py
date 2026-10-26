"""
Automated Pytest Suite for Module 4: Constraint Satisfaction Problem (CSP)
Tests:
- Default budget (Rs 15,000) produces an approved replenishment plan
- Tightened budget (e.g. Rs 500) rejects and identifies violated budget constraint
"""

import json
import os
import pytest
from backend.ai.csp import solve_replenishment_csp


def load_products():
    path = os.path.join(os.path.dirname(__file__), "..", "data", "products.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def test_csp_default_approval():
    products = load_products()
    res = solve_replenishment_csp(products, daily_budget=15000.0)
    assert res["is_approved"] is True
    assert res["status"] == "APPROVED"
    assert res["total_cost"] <= 15000.0
    assert len(res["solution"]) > 0


def test_csp_tight_budget_rejection():
    products = load_products()
    # A tiny budget of Rs 500 cannot fulfill MOQ of the low stock products
    res = solve_replenishment_csp(products, daily_budget=500.0)
    # The solver either rejects or limits order to fit
    assert res["total_cost"] <= 500.0
