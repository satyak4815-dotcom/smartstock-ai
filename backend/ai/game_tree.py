"""
SmartStock AI - Module 5: Negotiation Game Tree
Topic: Adversarial Search, Minimax Algorithm, Alpha-Beta Pruning
Course: BTech CSE 2nd Year Artificial Intelligence (CCSAI0301)
Team 80: NIET Greater Noida

Implements:
1. Two-Player Game: Platform (MAX, moves 1 & 3) vs Supplier (MIN, move 2).
2. Tree Structure: Depth 3, Branching factor 3, 27 leaves.
   Leaves: [40,30,60, 30,90,90, 90,80,50, 30,90,20, 80,80,20, 90,60,50, 30,70,20, 20,20,20, 80,50,80]
3. Minimax Search: Recursively explores all 27 leaves -> Root Value = 80.
4. Alpha-Beta Pruning: Prunes branches where beta <= alpha -> Evaluates exactly 16 leaves, derives identical root move.
"""

from typing import Dict, List, Any, Optional, Tuple
import json
import os


DEFAULT_LEAVES = [
    40, 30, 60,
    30, 90, 90,
    90, 80, 50,
    30, 90, 20,
    80, 80, 20,
    90, 60, 50,
    30, 70, 20,
    20, 20, 20,
    80, 50, 80
]

ROOT_MOVES = ["Ask 5% discount", "Ask 10% discount", "Ask free delivery"]
LEVEL2_MOVES = ["Accept", "Counter", "Reject"]
LEVEL3_MOVES = ["Take deal", "Bulk order", "Walk away"]


def solve_minimax(leaves: Optional[List[int]] = None) -> Dict[str, Any]:
    """
    Standard Minimax algorithm without pruning.
    Evaluates every node and leaf in the tree.
    """
    if leaves is None or len(leaves) != 27:
        leaves = list(DEFAULT_LEAVES)

    eval_count = 0
    steps = []

    # Level 2 (MAX nodes): 9 nodes, each taking max over 3 leaves
    level2_values = []
    for i in range(9):
        child_leaves = leaves[i*3 : (i+1)*3]
        eval_count += 3
        val = max(child_leaves)
        level2_values.append(val)
        steps.append({
            "step": len(steps) + 1,
            "level": 2,
            "player": "Platform (MAX)",
            "node_index": i,
            "examined_leaves": child_leaves,
            "chosen_value": val,
            "log": f"Level 2 (MAX) node {i}: max({child_leaves}) = {val}"
        })

    # Level 1 (MIN nodes): 3 nodes, each taking min over 3 level-2 nodes
    level1_values = []
    for j in range(3):
        child_vals = level2_values[j*3 : (j+1)*3]
        val = min(child_vals)
        level1_values.append(val)
        steps.append({
            "step": len(steps) + 1,
            "level": 1,
            "player": "Supplier (MIN)",
            "node_index": j,
            "child_values": child_vals,
            "chosen_value": val,
            "log": f"Level 1 (MIN) node {j} ({ROOT_MOVES[j]}): min({child_vals}) = {val}"
        })

    # Level 0 (Root MAX): max over 3 level-1 nodes
    root_value = max(level1_values)
    best_move_idx = level1_values.index(root_value)
    best_move = ROOT_MOVES[best_move_idx]

    steps.append({
        "step": len(steps) + 1,
        "level": 0,
        "player": "Platform (MAX - Root)",
        "child_values": level1_values,
        "chosen_value": root_value,
        "best_move": best_move,
        "log": f"Root (MAX): max({level1_values}) = {root_value} -> Optimal Move: '{best_move}'"
    })

    return {
        "algorithm": "Minimax (Full Tree Search)",
        "root_value": root_value,
        "best_move": best_move,
        "best_move_index": best_move_idx,
        "child_values": level1_values,
        "leaves_evaluated": eval_count,
        "total_leaves": len(leaves),
        "steps": steps
    }


def solve_alphabeta(leaves: Optional[List[int]] = None) -> Dict[str, Any]:
    """
    Alpha-Beta Pruning Algorithm:
    Maintains alpha (best MAX can guarantee) and beta (best MIN can guarantee).
    Prunes branches as soon as beta <= alpha.
    Evaluates exactly 16 leaves out of 27 on the standard tree.
    """
    if leaves is None or len(leaves) != 27:
        leaves = list(DEFAULT_LEAVES)

    leaf_eval_count = 0
    leaf_index = 0
    steps = []
    pruned_branches = []

    # Tree exploration trace
    # DFS traversal with alpha-beta tracking
    alpha_global = float("-inf")
    beta_global = float("inf")

    # Step-by-step recursive function
    def max_value(node_desc: str, depth: int, idx: int, alpha: float, beta: float) -> Tuple[float, Optional[str]]:
        nonlocal leaf_eval_count, leaf_index
        v = float("-inf")
        best_child = None

        if depth == 0:
            # Root node (Platform MAX)
            child_scores = []
            for m_idx, move in enumerate(ROOT_MOVES):
                val, _ = min_value(f"Root->{move}", depth + 1, m_idx, alpha, beta)
                child_scores.append(val)
                if val > v:
                    v = val
                    best_child = move
                alpha = max(alpha, v)
                steps.append({
                    "step": len(steps) + 1,
                    "type": "ALPHA_UPDATE",
                    "node": "Root",
                    "evaluated_child": move,
                    "child_value": val,
                    "alpha": alpha,
                    "beta": beta,
                    "log": f"Root updated with {move}={val}. Current Alpha={alpha}, Beta={beta}."
                })
            return v, best_child

        elif depth == 2:
            # Level 2 MAX node over 3 leaves
            # Leaf indices: idx * 3 to idx * 3 + 2
            start_l = idx * 3
            for offset in range(3):
                l_idx = start_l + offset
                val = leaves[l_idx]
                leaf_eval_count += 1
                
                if val > v:
                    v = val
                alpha = max(alpha, v)

                steps.append({
                    "step": len(steps) + 1,
                    "type": "LEAF_EVAL",
                    "node": node_desc,
                    "leaf_index": l_idx,
                    "leaf_value": val,
                    "alpha": alpha,
                    "beta": beta,
                    "log": f"Evaluated leaf [{l_idx}] = {val} at {node_desc}. Alpha={alpha}, Beta={beta}."
                })

                if beta <= alpha:
                    # Beta cut-off! Remaining leaves in this 3-pack pruned
                    remaining = 2 - offset
                    if remaining > 0:
                        pruned_indices = [start_l + o for o in range(offset + 1, 3)]
                        pruned_branches.append({
                            "pruned_at": node_desc,
                            "type": "BETA_CUTOFF",
                            "pruned_leaves": pruned_indices,
                            "condition": f"beta ({beta}) <= alpha ({alpha})"
                        })
                        steps.append({
                            "step": len(steps) + 1,
                            "type": "PRUNE",
                            "node": node_desc,
                            "pruned_leaves": pruned_indices,
                            "log": f"PRUNED: Beta cut-off! beta ({beta}) <= alpha ({alpha}). Skipped leaves {pruned_indices}."
                        })
                    break
            return v, None

        return v, None

    def min_value(node_desc: str, depth: int, idx: int, alpha: float, beta: float) -> Tuple[float, Optional[str]]:
        nonlocal leaf_eval_count
        v = float("inf")

        # Level 1 MIN node (Supplier) over 3 level-2 MAX nodes
        for l2_offset in range(3):
            l2_idx = idx * 3 + l2_offset
            l2_name = f"{node_desc}->{LEVEL2_MOVES[l2_offset]}"
            val, _ = max_value(l2_name, depth + 1, l2_idx, alpha, beta)
            
            if val < v:
                v = val
            beta = min(beta, v)

            steps.append({
                "step": len(steps) + 1,
                "type": "BETA_UPDATE",
                "node": node_desc,
                "child": LEVEL2_MOVES[l2_offset],
                "val": val,
                "alpha": alpha,
                "beta": beta,
                "log": f"Supplier MIN at {node_desc}: branch {LEVEL2_MOVES[l2_offset]} returned {val}. Beta={beta}."
            })

            if beta <= alpha:
                # Alpha cut-off!
                remaining = 2 - l2_offset
                if remaining > 0:
                    pruned_subtrees = [f"{node_desc}->{LEVEL2_MOVES[o]}" for o in range(l2_offset + 1, 3)]
                    pruned_branches.append({
                        "pruned_at": node_desc,
                        "type": "ALPHA_CUTOFF",
                        "pruned_subtrees": pruned_subtrees,
                        "condition": f"beta ({beta}) <= alpha ({alpha})"
                    })
                    steps.append({
                        "step": len(steps) + 1,
                        "type": "PRUNE",
                        "node": node_desc,
                        "pruned_subtrees": pruned_subtrees,
                        "log": f"PRUNED: Alpha cut-off! beta ({beta}) <= alpha ({alpha}). Pruned entire branch {pruned_subtrees}."
                    })
                break
        return v, None

    root_val, best_move = max_value("Root", 0, 0, alpha_global, beta_global)

    return {
        "algorithm": "Alpha-Beta Pruning",
        "root_value": root_val,
        "best_move": best_move,
        "leaves_evaluated": leaf_eval_count,
        "total_leaves": len(leaves),
        "leaves_pruned": len(leaves) - leaf_eval_count,
        "pruned_branches": pruned_branches,
        "steps": steps,
        "same_decision_badge": f"Same decision: {best_move} (value {root_val})",
        "efficiency_gain_pct": round(((len(leaves) - leaf_eval_count) / len(leaves)) * 100, 1),
        "classification": {
            "players": "Two-player (Platform vs Supplier)",
            "type": "Zero-sum (Payoff to Platform is loss to Supplier)",
            "nature": "Deterministic (No chance nodes)",
            "information": "Perfect Information (All game parameters known)"
        }
    }


def compare_minimax_and_alphabeta(leaves: Optional[List[int]] = None) -> Dict[str, Any]:
    """Runs both algorithms side-by-side to verify identical decisions and leaf efficiency."""
    if leaves is None:
        leaves = list(DEFAULT_LEAVES)

    res_mm = solve_minimax(leaves)
    res_ab = solve_alphabeta(leaves)

    return {
        "identical_decision": res_mm["best_move"] == res_ab["best_move"] and res_mm["root_value"] == res_ab["root_value"],
        "optimal_move": res_ab["best_move"],
        "optimal_value": res_ab["root_value"],
        "minimax_leaves": res_mm["leaves_evaluated"],
        "alphabeta_leaves": res_ab["leaves_evaluated"],
        "pruned_count": res_ab["leaves_pruned"],
        "leaves": leaves,
        "minimax": res_mm,
        "alphabeta": res_ab
    }
