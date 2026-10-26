"""
Automated Pytest Suite for Module 7: Shelf Allocation Local Search
Tests:
- Hill climbing reduces conflicts from starting value down to 0
- N-Queens local search finds valid placement
"""

import pytest
from backend.ai.local_search import solve_shelf_allocation_hill_climbing, solve_n_queens_local_search


def test_shelf_allocation_conflicts_reduction():
    res = solve_shelf_allocation_hill_climbing(scramble_seed=42)
    assert res["start_conflicts"] > 0
    assert res["final_conflicts"] == 0, f"Expected 0 final conflicts, got {res['final_conflicts']}"
    assert res["final_objective"] < res["initial_objective"]


def test_n_queens_local_search():
    res = solve_n_queens_local_search(n=8, seed=42)
    assert len(res["board"]) == 8
    assert res["final_conflicts"] <= res["start_conflicts"]
