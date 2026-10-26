"""
SmartStock AI - Module 2: Reorder as a Search Problem
Topic: Formal Problem Formulation, State Space, Uniform-Cost Search (UCS)
Course: BTech CSE 2nd Year Artificial Intelligence (CCSAI0301)
Team 80: NIET Greater Noida

Problem Formulation:
1. Initial State: Current stock level S0 of selected product.
2. Actions: Discrete reorder batches {0, 10, 20, 30, 40, 50} respecting supplier MOQ (min 10).
3. Goal Test: Resulting stock S in safe buffer zone [reorder_level + 10, reorder_level + 50]
   and total warehouse capacity (400) not exceeded.
4. Path Cost: Ordering Cost + Holding Cost over a 5-day planning horizon.
   - Ordering Cost: (unit_cost * qty) + Rs 100 fixed processing fee (if qty > 0).
   - Holding Cost: 0.5 Rs/unit/day * 5 days * (initial_stock + qty).
"""

import heapq
from typing import Dict, List, Any


def solve_reorder_search_ucs(product: Dict[str, Any], total_warehouse_stock: int = 150) -> Dict[str, Any]:
    """
    Solves the reorder optimization problem using Uniform-Cost Search (Dijkstra on state space).
    Expands nodes in increasing order of path cost g(n).
    Returns the optimal batch quantity, total cost breakdown, and step-by-step search tree trace.
    """
    initial_stock = product["stock"]
    reorder_level = product["reorder_level"]
    unit_cost = product["suppliers"][0]["cost"] if product.get("suppliers") else 50
    capacity_limit = 400
    
    # Goal condition boundaries
    min_goal_stock = reorder_level + 10
    max_goal_stock = reorder_level + 50

    available_actions = [0, 10, 20, 30, 40, 50]

    # Priority queue stores tuples: (cumulative_cost, node_id, state_stock, path, action_taken)
    frontier = []
    node_counter = 0

    # Initial node
    # Path cost from start to start is 0
    start_holding = 0.5 * 5 * initial_stock
    # Let initial state cost be baseline holding
    heapq.heappush(frontier, (0.0, node_counter, initial_stock, [], None))
    
    explored = set()
    steps = []
    tree_nodes = []
    tree_edges = []
    
    tree_nodes.append({
        "id": "node_0",
        "label": f"Start: Stock={initial_stock}",
        "stock": initial_stock,
        "cost": 0,
        "is_goal": min_goal_stock <= initial_stock <= max_goal_stock
    })

    solution_node = None
    best_goal = None

    while frontier:
        cost, n_id, current_stock, path, last_action = heapq.heappop(frontier)
        
        step_log = f"UCS expanded Node {n_id}: Current Stock={current_stock}, Path Cost=Rs {cost:.1f}"
        
        # Check Goal Test
        if min_goal_stock <= current_stock <= max_goal_stock:
            step_log += f" -> GOAL REACHED! Stock {current_stock} is within safe range [{min_goal_stock}, {max_goal_stock}]."
            steps.append({
                "step": len(steps) + 1,
                "node_id": f"node_{n_id}",
                "stock": current_stock,
                "cost": cost,
                "frontier_size": len(frontier),
                "log": step_log,
                "is_goal": True
            })
            solution_node = {
                "node_id": f"node_{n_id}",
                "final_stock": current_stock,
                "order_qty": last_action if last_action is not None else 0,
                "total_cost": cost,
                "path": path + [{"stock": current_stock, "action": last_action, "cost": cost}]
            }
            break

        explored.add(current_stock)
        steps.append({
            "step": len(steps) + 1,
            "node_id": f"node_{n_id}",
            "stock": current_stock,
            "cost": cost,
            "frontier_size": len(frontier),
            "log": step_log,
            "is_goal": False
        })

        # If already at depth 1 (one ordering decision), avoid infinite expansion
        if len(path) >= 1:
            continue

        # Expand transitions for each ordering action
        for action in available_actions:
            next_stock = current_stock + action
            
            # Constraint check: Warehouse capacity
            projected_total = (total_warehouse_stock - current_stock) + next_stock
            if projected_total > capacity_limit:
                continue

            # Calculate transition cost
            order_cost = (unit_cost * action + 100) if action > 0 else 0
            holding_cost = 0.5 * 5 * next_stock
            transition_cost = order_cost + holding_cost
            new_cost = cost + transition_cost

            node_counter += 1
            child_id = f"node_{node_counter}"
            
            is_goal_node = min_goal_stock <= next_stock <= max_goal_stock
            tree_nodes.append({
                "id": child_id,
                "label": f"+{action} units -> Stock {next_stock} (Cost: Rs {new_cost:.0f})",
                "stock": next_stock,
                "action": action,
                "cost": new_cost,
                "is_goal": is_goal_node
            })
            tree_edges.append({
                "source": f"node_{n_id}",
                "target": child_id,
                "label": f"Order {action}"
            })

            heapq.heappush(frontier, (new_cost, node_counter, next_stock, path + [{"stock": current_stock, "action": action, "cost": cost}], action))

    # Calculate optimal breakdown
    opt_qty = solution_node["order_qty"] if solution_node else 20
    opt_order_cost = (unit_cost * opt_qty + 100) if opt_qty > 0 else 0
    opt_holding_cost = 0.5 * 5 * (initial_stock + opt_qty)

    return {
        "product_id": product["id"],
        "product_name": product["name"],
        "problem_formulation": {
            "initial_state": f"Current Stock = {initial_stock} units",
            "actions": f"Order quantities {available_actions}",
            "goal_test": f"Stock in [{min_goal_stock}, {max_goal_stock}] and total warehouse stock <= {capacity_limit}",
            "path_cost": f"Ordering Cost (Rs {unit_cost}/unit + Rs 100 fixed) + Holding Cost (Rs 2.50/unit over 5 days)"
        },
        "optimal_order_quantity": opt_qty,
        "optimal_total_cost": opt_order_cost + opt_holding_cost,
        "cost_breakdown": {
            "ordering_cost": opt_order_cost,
            "holding_cost": opt_holding_cost,
            "unit_price": unit_cost,
            "fixed_fee": 100 if opt_qty > 0 else 0
        },
        "steps": steps,
        "tree_nodes": tree_nodes,
        "tree_edges": tree_edges,
        "nodes_expanded": len(steps)
    }
