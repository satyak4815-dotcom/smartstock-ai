"""
SmartStock AI - Backend REST API Routes
Provides clean REST API endpoints connecting React frontend to the pure-Python AI modules.
"""

from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import json
import os

# Import AI modules
from backend.ai.agent import InventoryAgent, get_peas_specification
from backend.ai.search_problem import solve_reorder_search_ucs
from backend.ai.uninformed import run_bfs, run_dfs, run_ids, run_bidirectional_search, compare_uninformed_searches
from backend.ai.informed import (
    run_astar_search, run_greedy_best_first,
    verify_heuristics_admissibility_and_consistency,
    run_ao_star_milk_fulfilment, score_suppliers_for_product
)
from backend.ai.csp import solve_replenishment_csp
from backend.ai.game_tree import solve_minimax, solve_alphabeta, compare_minimax_and_alphabeta
from backend.ai.classic_problems import (
    solve_water_jug_rack_transfer,
    solve_zone_transfer_crates,
    solve_strips_restocking_plan,
    solve_shelf_tiles_astar
)
from backend.ai.local_search import solve_shelf_allocation_hill_climbing, solve_n_queens_local_search
from backend.ai.tsp import solve_tsp_exhaustive, solve_tsp_nearest_neighbour, compare_tsp_methods
from backend.ai.knowledge.propositional import generate_truth_table_r1_r3, find_propositional_gaps, get_inference_rules_demo
from backend.ai.knowledge.fol import run_unification_demo, run_resolution_refutation_milk, get_fol_quantifier_comparison
from backend.ai.knowledge.chaining import run_forward_chaining, run_backward_chaining
from backend.ai.knowledge.frames import FrameSystem
from backend.ai.knowledge.semantic_net import (
    query_semantic_network, mine_basket_associations, get_network_vs_frame_comparison
)
from backend.ai.knowledge.reasoning_types import get_types_of_knowledge, run_abduction_demo
from backend.ai.knowledge.expert_system import ExpertSystem

router = APIRouter()

# Data loaders
def load_json(filename: str):
    path = os.path.join(os.path.dirname(__file__), "..", "data", filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# Global in-memory state
products_data = load_json("products.json")
suppliers_data = load_json("suppliers.json")
frames_data = load_json("frames.json")
network_data = load_json("network.json")
baskets_data = load_json("baskets.json")
semantic_net_data = load_json("semantic_net.json")

expert_system_instance = ExpertSystem(products_data, suppliers_data)
frame_system_instance = FrameSystem(frames_data, products_data)


# --- 1. PRODUCTS & WORKING MEMORY ---

@router.get("/products")
def get_products():
    return expert_system_instance.working_memory_products


@router.put("/products/{product_id}")
def update_product(product_id: str, updates: Dict[str, Any] = Body(...)):
    success = expert_system_instance.update_product_in_memory(product_id, updates)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"success": True, "updated_product": next(p for p in expert_system_instance.working_memory_products if p["id"] == product_id)}


@router.post("/products/reset")
def reset_products():
    expert_system_instance.reset_working_memory()
    return {"success": True, "message": "Working memory reset to sample 12 products."}


# --- 2. INTELLIGENT AGENT (M1) ---

@router.get("/agent/peas")
def get_peas():
    return get_peas_specification()


@router.post("/agent/run")
def run_agent(agent_type: str = Query("goal", enum=["reflex", "model", "goal", "utility"]), product_id: Optional[str] = Query(None)):
    agent = InventoryAgent(agent_type=agent_type)
    products = expert_system_instance.working_memory_products
    
    if product_id:
        prod = next((p for p in products if p["id"] == product_id), products[0])
        return agent.run_agent_loop(prod)
    
    # Run loop for all products
    results = [agent.run_agent_loop(p) for p in products]
    return {
        "agent_type": agent_type,
        "results": results
    }


# --- 3. REORDER SEARCH (M2) ---

@router.post("/reorder/search")
def search_reorder(product_id: str = Query("P1")):
    products = expert_system_instance.working_memory_products
    prod = next((p for p in products if p["id"] == product_id), products[0])
    return solve_reorder_search_ucs(prod)


# --- 4. ROUTE SEARCH & SUPPLIERS (M3) ---

@router.post("/route/{algorithm}")
def search_route(algorithm: str, start_node: str = Query("A"), goal_node: str = Query("S0")):
    algo = algorithm.lower()
    if algo == "bfs":
        return run_bfs(start_node, goal_node)
    elif algo == "dfs":
        return run_dfs(start_node, goal_node)
    elif algo == "ids":
        return run_ids(start_node, goal_node)
    elif algo == "bidirectional":
        return run_bidirectional_search(start_node, goal_node)
    elif algo == "astar":
        return run_astar_search(start_node, goal_node)
    elif algo == "greedy":
        return run_greedy_best_first(start_node, goal_node)
    elif algo == "compare":
        return compare_uninformed_searches(start_node)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown route search algorithm: {algorithm}")


@router.get("/route/verify-heuristics")
def verify_heuristics():
    return verify_heuristics_admissibility_and_consistency()


@router.post("/supplier/score")
def score_supplier(
    product_id: str = Query("P1"),
    w_price: float = Query(0.40),
    w_dist: float = Query(0.25),
    w_delivery: float = Query(0.20),
    w_rel: float = Query(0.15)
):
    products = expert_system_instance.working_memory_products
    prod = next((p for p in products if p["id"] == product_id), products[0])
    return score_suppliers_for_product(prod, suppliers_data, w_price, w_dist, w_delivery, w_rel)


@router.post("/aostar")
def solve_aostar():
    return run_ao_star_milk_fulfilment()


# --- 5. CONSTRAINT SATISFACTION (M4) ---

@router.post("/csp/solve")
def solve_csp(daily_budget: float = Query(15000.0), warehouse_capacity: int = Query(400)):
    products = expert_system_instance.working_memory_products
    return solve_replenishment_csp(products, daily_budget=daily_budget, warehouse_capacity=warehouse_capacity)


# --- 6. NEGOTIATION GAME TREE (M5) ---

@router.post("/negotiation/{algorithm}")
def solve_negotiation(algorithm: str, leaves: Optional[List[int]] = Body(None)):
    algo = algorithm.lower()
    if algo == "minimax":
        return solve_minimax(leaves)
    elif algo == "alphabeta":
        return solve_alphabeta(leaves)
    elif algo == "compare":
        return compare_minimax_and_alphabeta(leaves)
    else:
        raise HTTPException(status_code=400, detail="Use 'minimax', 'alphabeta', or 'compare'")


# --- 7. WAREHOUSE PUZZLES (M6) ---

@router.post("/puzzles/{puzzle_name}")
def solve_puzzle(puzzle_name: str):
    name = puzzle_name.lower()
    if name in ["jug", "waterjug", "rack"]:
        return solve_water_jug_rack_transfer()
    elif name in ["transport", "missionaries", "zone"]:
        return solve_zone_transfer_crates()
    elif name in ["plan", "strips", "restock"]:
        return solve_strips_restocking_plan()
    elif name in ["tiles", "8puzzle", "shelf"]:
        return solve_shelf_tiles_astar()
    else:
        raise HTTPException(status_code=400, detail=f"Unknown puzzle: {puzzle_name}")


# --- 8. SHELF ALLOCATION LOCAL SEARCH (M7) ---

@router.post("/shelf/optimize")
def optimize_shelf(force_scramble: bool = Query(False), seed: int = Query(42)):
    return solve_shelf_allocation_hill_climbing(scramble_seed=seed, force_scramble=force_scramble)


@router.post("/queens")
def solve_queens(n: int = Query(8), seed: int = Query(42)):
    return solve_n_queens_local_search(n=n, seed=seed)


# --- 9. RESTOCKING ROUTE TSP (M8) ---

@router.post("/tsp/{mode}")
def solve_tsp(mode: str):
    m = mode.lower()
    if m == "exhaustive":
        return solve_tsp_exhaustive()
    elif m == "nearest":
        return solve_tsp_nearest_neighbour()
    elif m == "compare":
        return compare_tsp_methods()
    else:
        raise HTTPException(status_code=400, detail="Use 'exhaustive', 'nearest', or 'compare'")


# --- 10. KNOWLEDGE BASE & LOGIC (M9) ---

@router.get("/logic/truthtable")
def get_truth_table():
    return generate_truth_table_r1_r3()


@router.get("/logic/gaps")
def get_gaps():
    return find_propositional_gaps()


@router.get("/logic/inference-rules")
def get_inference_rules():
    return get_inference_rules_demo()


@router.post("/logic/unify")
def unify(term1: List[str] = Body(["Reorder", "x", "Bread"]), term2: List[str] = Body(["Reorder", "Milk1L", "y"])):
    return run_unification_demo(term1, term2)


@router.post("/logic/resolve")
def resolve_refutation():
    return run_resolution_refutation_milk()


@router.get("/logic/quantifiers")
def get_quantifiers():
    return get_fol_quantifier_comparison()


# Chaining
@router.post("/inference/forward")
def forward_inference():
    return expert_system_instance.run_inference()


@router.post("/inference/backward")
def backward_inference(product_id: str = Query("P1"), goal: str = Query("ReorderUrgent")):
    return expert_system_instance.explain_recommendation(product_id, goal)


# Frames
@router.get("/frames")
def get_frames(product_id: Optional[str] = Query(None)):
    if product_id:
        return frame_system_instance.inspect_product_frame(product_id)
    return {
        "classes": frame_system_instance.get_class_hierarchy(),
        "products_frames": frame_system_instance.inspect_all_products()
    }


@router.put("/frames/default")
def update_frame_default(class_name: str = Query("Product"), slot_name: str = Query("reorder_level"), new_value: int = Query(30)):
    success = frame_system_instance.update_class_default(class_name, slot_name, new_value)
    return {
        "success": success,
        "class_name": class_name,
        "slot_name": slot_name,
        "new_value": new_value,
        "updated_frames": frame_system_instance.inspect_all_products()
    }


# Semantic Network
@router.get("/semantic-net")
def get_semantic_net():
    return semantic_net_data


@router.post("/semantic-net/query")
def query_net(query_type: str = Query("is_perishable"), param: str = Query("P1")):
    return query_semantic_network(query_type, param, semantic_net_data, expert_system_instance.working_memory_products)


@router.get("/semantic-net/associations")
def get_associations():
    return mine_basket_associations(baskets_data)


@router.get("/semantic-net/comparison")
def get_comparison():
    return get_network_vs_frame_comparison()


# Reasoning & Abduction
@router.get("/reasoning/types")
def get_knowledge_types():
    return get_types_of_knowledge()


@router.post("/reasoning/abduction")
def run_abduction(product_name: str = Query("Milk1L"), prev_stock: int = Query(40), curr_stock: int = Query(14)):
    return run_abduction_demo(product_name, prev_stock, curr_stock)


# Festival Toggle
@router.post("/festival/toggle")
def toggle_festival(enabled: bool = Query(...)):
    expert_system_instance.set_festival_season(enabled)
    # Also adjust frame default
    frame_system_instance.update_class_default("Product", "reorder_level", 30 if enabled else 20)
    return {
        "festival_season": enabled,
        "message": f"Festival season is now {'ACTIVATED (1.5x demand, safety buffer raised)' if enabled else 'DEACTIVATED'}."
    }


# --- 11. REPORTS & LIVE RESULTS (M11) ---

@router.get("/results/summary")
def get_results_summary():
    """
    Computes all Review-2 results live from the data:
    - 11 conclusions (4 urgent, 2 normal, 1 discount, 1 supplier, 3 checks)
    - 6 moves rack transfer (BFS)
    - shelf conflicts reduction (start -> 0)
    - 24 km best of 120 TSP routes (nearest neighbour also 24 km)
    - minimax = alpha-beta = 80, 16/27 leaves
    """
    inference_res = expert_system_instance.run_inference()
    jug_res = solve_water_jug_rack_transfer()
    shelf_res = solve_shelf_allocation_hill_climbing()
    tsp_res = compare_tsp_methods()
    game_res = compare_minimax_and_alphabeta()

    return {
        "review_metrics": {
            "total_conclusions": inference_res["total_conclusions"],
            "conclusions_breakdown": f"{inference_res['summary_counts']['urgent']} urgent, {inference_res['summary_counts']['normal']} normal, {inference_res['summary_counts']['discount']} discount, {inference_res['summary_counts']['find_supplier']} supplier gap, {inference_res['summary_counts']['check_stock']} checks",
            "rack_transfer_moves": f"{jug_res['optimal_moves']} moves (BFS optimal)",
            "shelf_conflicts": f"{shelf_res['conflict_reduction']} after {shelf_res['total_moves']} moves",
            "tsp_distance": f"{tsp_res['comparison_table'][0]['best_distance']} best of 120 routes (Nearest-Neighbour also {tsp_res['comparison_table'][1]['best_distance']})",
            "game_tree": f"minimax = alpha-beta = {game_res['optimal_move']} (value {game_res['optimal_value']}), evaluated {game_res['alphabeta_leaves']}/27 leaves"
        },
        "challenges_and_fixes": [
            {
                "challenge": "Eggs low stock with NO supplier available",
                "tool_used": "Propositional Truth Table",
                "fix": "Discovered truth-table gap (L ∧ ¬S); formulated Rule R4 (FindOtherSupplier)."
            },
            {
                "challenge": "Group rules ('all products', 'some items') combinatorial explosion",
                "tool_used": "First-Order Logic (FOL)",
                "fix": "Adopted universal quantifiers (∀x) and Robinson's unification with occurs-check."
            },
            {
                "challenge": "Local search shelf allocation stuck at local minimum with 1 conflict",
                "tool_used": "Hill Climbing Perturbations",
                "fix": "Introduced sideways plateau moves and random neighbour escapes (reached 0 conflicts)."
            },
            {
                "challenge": "Seasonal / festival demand changes required rewriting hardcoded rules",
                "tool_used": "Frame System with Slot Inheritance",
                "fix": "Centralised reorder_level at Product class frame; single-point edit propagates to all instances."
            },
            {
                "challenge": "No real sales history data available during Semester 4 Review 1",
                "tool_used": "Sample Data Honesty Rule",
                "fix": "Formulated clean 12-item sample catalog with transparent UI disclaimer and capped confidence."
            },
            {
                "challenge": "Game tree evaluation speed and redundant branch calculation",
                "tool_used": "Alpha-Beta Pruning",
                "fix": "Pruned 11 branches, achieving identical decision while evaluating only 16/27 leaves (40.7% speedup)."
            }
        ],
        "next_steps": [
            "Collect real POS checkout register sales history over Month 3.",
            "Compare AI recommendations against store owner's manual decisions.",
            "Integrate stockout forecasting with predictive machine learning.",
            "Deploy mobile-friendly barcoding scanner interface for warehouse floor staff."
        ]
    }
