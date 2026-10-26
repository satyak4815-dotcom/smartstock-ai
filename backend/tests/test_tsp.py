"""
Automated Pytest Suite for Module 8: Restocking Route (TSP)
Tests:
- 120 Hamiltonian cycles evaluated
- Best route distance = 24 km
- Worst route distance = 60 km
- Nearest-Neighbour heuristic = 24 km
"""

import pytest
from backend.ai.tsp import solve_tsp_exhaustive, solve_tsp_nearest_neighbour


def test_tsp_exhaustive_results():
    res = solve_tsp_exhaustive()
    assert res["total_routes_evaluated"] == 120
    assert res["best_distance_km"] == 24, f"Expected best 24, got {res['best_distance_km']}"
    assert res["worst_distance_km"] == 60, f"Expected worst 60, got {res['worst_distance_km']}"


def test_tsp_nearest_neighbour():
    res = solve_tsp_nearest_neighbour()
    assert res["total_distance_km"] == 24, f"Expected 24 km for nearest neighbour, got {res['total_distance_km']}"
    assert len(res["route_indices"]) == 7  # W1 + 5 stops + W1
