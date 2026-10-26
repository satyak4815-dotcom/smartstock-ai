"""
Automated Pytest Suite for Module 2 & 3: Search Algorithms
Tests:
- Reorder UCS search finds valid optimal order quantity
- Heuristic h(n) on delivery network is admissible and consistent
- A* shortest distance to S0 equals expected:
  A=17, B=21, C=27, D=19, W1=5, W2=9, H1=11, H2=16
- BFS, DFS, IDS, Bidirectional return valid paths to S0
- AO* chooses O3 (split order) with total cost Rs 3210
"""

import json
import os
import pytest
from backend.ai.search_problem import solve_reorder_search_ucs
from backend.ai.uninformed import run_bfs, run_dfs, run_ids, run_bidirectional_search
from backend.ai.informed import run_astar_search, run_greedy_best_first, verify_heuristics_admissibility_and_consistency, run_ao_star_milk_fulfilment


def load_products():
    path = os.path.join(os.path.dirname(__file__), "..", "data", "products.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def test_reorder_ucs():
    products = load_products()
    milk = products[0]  # Milk1L
    res = solve_reorder_search_ucs(milk)
    assert res["optimal_order_quantity"] in [10, 20, 30, 40, 50]
    assert res["optimal_total_cost"] > 0
    assert len(res["steps"]) > 0


def test_heuristic_admissibility_and_consistency():
    res = verify_heuristics_admissibility_and_consistency()
    assert res["is_admissible"] is True, "Heuristic must be admissible (h <= h*)"
    assert res["is_consistent"] is True, "Heuristic must be consistent"


def test_astar_expected_shortest_distances():
    """
    Expected shortest distances to S0:
    A=17, B=21, C=27, D=19, W1=5, W2=9, H1=11, H2=16
    """
    expected = {
        "A": 17,
        "B": 21,
        "C": 27,
        "D": 19,
        "W1": 5,
        "W2": 9,
        "H1": 11,
        "H2": 16,
        "S0": 0
    }
    for start_node, expected_dist in expected.items():
        res = run_astar_search(start_node, "S0")
        assert res["success"] is True
        assert res["path_cost"] == expected_dist, f"Node {start_node}: expected {expected_dist}, got {res['path_cost']}"


def test_uninformed_searches():
    for fn in [run_bfs, run_dfs, run_ids, run_bidirectional_search]:
        res = fn("A", "S0")
        assert res["success"] is True
        assert res["path"][0] == "A"
        assert res["path"][-1] == "S0"


def test_ao_star_milk_fulfilment():
    """AO* must pick O3 (split order), total Rs 3210."""
    res = run_ao_star_milk_fulfilment()
    opt = res["optimal_solution"]
    assert "O3" in opt["choice"]
    assert opt["total_cost"] == 3210
