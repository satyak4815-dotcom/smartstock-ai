"""
Automated Pytest Suite for Module 6: Classic Warehouse Puzzles
Tests:
- Water jug (rack transfer) finds 4 crates in exactly 6 moves via BFS
- Missionaries & Cannibals (zone transfer) takes 11 crossings without contamination
- STRIPS restocking planner executes all 7 operations
- 8-Tiles A* solves shelf rearrangement
"""

import pytest
from backend.ai.classic_problems import (
    solve_water_jug_rack_transfer,
    solve_zone_transfer_crates,
    solve_strips_restocking_plan,
    solve_shelf_tiles_astar
)


def test_water_jug_rack_transfer():
    res = solve_water_jug_rack_transfer()
    assert res["success"] is True
    assert res["optimal_moves"] == 6, f"Expected 6 moves, got {res['optimal_moves']}"


def test_zone_transfer_crossings():
    res = solve_zone_transfer_crates()
    assert res["success"] is True
    assert res["crossings_count"] == 11, f"Expected 11 crossings, got {res['crossings_count']}"


def test_strips_planner():
    res = solve_strips_restocking_plan()
    assert res["goal_achieved"] is True
    assert res["plan_length"] == 7
    expected_order = [
        "CheckStock", "LocateSupplier", "CheckBudget", "PlaceOrder",
        "ConfirmDelivery", "Shelve", "UpdateRecords"
    ]
    assert res["executed_plan"] == expected_order


def test_shelf_tiles_astar():
    res = solve_shelf_tiles_astar()
    assert res["solution_moves"] > 0
    assert res["nodes_expanded"] > 0
