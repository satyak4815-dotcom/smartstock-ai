"""
Automated Pytest Suite for Module 5: Negotiation Game Tree
Tests:
- Minimax root value = 80, best move = "Ask 10% discount"
- Alpha-Beta root value = 80, best move = "Ask 10% discount"
- Alpha-Beta evaluates exactly 16 of 27 leaves
"""

import pytest
from backend.ai.game_tree import solve_minimax, solve_alphabeta, compare_minimax_and_alphabeta


def test_minimax_and_alphabeta_oracle():
    comp = compare_minimax_and_alphabeta()
    assert comp["identical_decision"] is True
    assert comp["optimal_value"] == 80
    assert comp["optimal_move"] == "Ask 10% discount"
    assert comp["minimax_leaves"] == 27
    assert comp["alphabeta_leaves"] == 16, f"Expected 16 leaves evaluated for alpha-beta, got {comp['alphabeta_leaves']}"
