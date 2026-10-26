"""
SmartStock AI - Module 3: Uninformed Search Algorithms
Topic: Breadth-First Search (BFS), Depth-First Search (DFS), Iterative Deepening (IDS), Bidirectional Search
Course: BTech CSE 2nd Year Artificial Intelligence (CCSAI0301)
Team 80: NIET Greater Noida

Implements pure-Python uninformed search on the delivery network graph:
Nodes: A, B, C, D, H1, H2, W1, W2, S0 (Store S0 = Goal)
All algorithms return:
- path: list of nodes from start to S0
- path_cost: cumulative distance in km
- nodes_expanded: integer
- steps: step-by-step trace showing expanded node, frontier, and explored set.
"""

from typing import Dict, List, Any, Optional, Tuple
from collections import deque
import json
import os


def load_delivery_graph() -> Tuple[Dict[str, List[Tuple[str, int]]], Dict[str, str]]:
    """Loads network.json into an adjacency list."""
    path = os.path.join(os.path.dirname(__file__), "..", "data", "network.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    adj: Dict[str, List[Tuple[str, int]]] = {node: [] for node in data["nodes"]}
    for edge in data["edges"]:
        u = edge["from"]
        v = edge["to"]
        w = edge["weight"]
        adj[u].append((v, w))
        adj[v].append((u, w))

    # Sort neighbors alphabetically for deterministic behavior
    for u in adj:
        adj[u].sort(key=lambda x: x[0])

    return adj, data["node_labels"]


def run_bfs(start_node: str, goal_node: str = "S0") -> Dict[str, Any]:
    """Breadth-First Search (FIFO Queue): Optimal for unweighted graphs, complete."""
    adj, labels = load_delivery_graph()
    queue = deque([(start_node, [start_node], 0)])
    explored = set()
    steps = []

    while queue:
        current, path, cost = queue.popleft()
        
        step_entry = {
            "step": len(steps) + 1,
            "expanded_node": current,
            "path_so_far": path,
            "cost_so_far": cost,
            "frontier": [item[0] for item in queue],
            "explored": list(explored),
            "log": f"BFS expanded node '{current}' ({labels.get(current, current)}), current path: {' -> '.join(path)}, distance: {cost} km."
        }
        steps.append(step_entry)

        if current == goal_node:
            return {
                "algorithm": "Breadth-First Search (BFS)",
                "success": True,
                "path": path,
                "path_cost": cost,
                "nodes_expanded": len(steps),
                "completeness": "Complete (always finds a goal if one exists)",
                "optimality": "Optimal for unit step costs; may find sub-optimal distance on weighted graphs",
                "time_complexity": "O(b^d)",
                "space_complexity": "O(b^d)",
                "steps": steps
            }

        explored.add(current)

        for neighbor, weight in adj[current]:
            if neighbor not in explored and not any(neighbor == item[0] for item in queue):
                queue.append((neighbor, path + [neighbor], cost + weight))

    return {"algorithm": "BFS", "success": False, "steps": steps}


def run_dfs(start_node: str, goal_node: str = "S0") -> Dict[str, Any]:
    """Depth-First Search (LIFO Stack): Not guaranteed optimal, low space complexity O(bm)."""
    adj, labels = load_delivery_graph()
    stack = [(start_node, [start_node], 0)]
    explored = set()
    steps = []

    while stack:
        current, path, cost = stack.pop()

        step_entry = {
            "step": len(steps) + 1,
            "expanded_node": current,
            "path_so_far": path,
            "cost_so_far": cost,
            "frontier": [item[0] for item in stack],
            "explored": list(explored),
            "log": f"DFS expanded node '{current}' (depth {len(path)-1}), path: {' -> '.join(path)}."
        }
        steps.append(step_entry)

        if current == goal_node:
            return {
                "algorithm": "Depth-First Search (DFS)",
                "success": True,
                "path": path,
                "path_cost": cost,
                "nodes_expanded": len(steps),
                "completeness": "Complete on finite spaces with cycle checking",
                "optimality": "Non-optimal (returns first path reached deep in branch)",
                "time_complexity": "O(b^m)",
                "space_complexity": "O(b·m)",
                "steps": steps
            }

        explored.add(current)

        # Reverse order for pushing so left-most child is popped first
        for neighbor, weight in reversed(adj[current]):
            if neighbor not in explored and not any(neighbor == item[0] for item in stack):
                stack.append((neighbor, path + [neighbor], cost + weight))

    return {"algorithm": "DFS", "success": False, "steps": steps}


def run_ids(start_node: str, goal_node: str = "S0", max_depth: int = 6) -> Dict[str, Any]:
    """Iterative Deepening Search (IDS): Combines BFS optimality/completeness with DFS linear memory O(bd)."""
    adj, labels = load_delivery_graph()
    all_steps = []
    total_nodes_expanded = 0

    for limit in range(max_depth + 1):
        stack = [(start_node, [start_node], 0, 0)]  # (node, path, cost, depth)
        depth_steps = []

        all_steps.append({
            "step": len(all_steps) + 1,
            "expanded_node": f"ITERATION_DEPTH_LIMIT_{limit}",
            "frontier": [start_node],
            "explored": [],
            "log": f"IDS starting new depth-limited search pass with Depth Limit = {limit}."
        })

        while stack:
            current, path, cost, depth = stack.pop()
            total_nodes_expanded += 1

            step_entry = {
                "step": len(all_steps) + 1,
                "expanded_node": current,
                "path_so_far": path,
                "cost_so_far": cost,
                "depth": depth,
                "limit": limit,
                "log": f"IDS (limit={limit}) visiting node '{current}' at depth {depth}."
            }
            all_steps.append(step_entry)

            if current == goal_node:
                return {
                    "algorithm": "Iterative Deepening Search (IDS)",
                    "success": True,
                    "path": path,
                    "path_cost": cost,
                    "nodes_expanded": total_nodes_expanded,
                    "depth_reached": depth,
                    "completeness": "Complete (guaranteed to find goal like BFS)",
                    "optimality": "Optimal for unit costs; space-efficient O(bd)",
                    "time_complexity": "O(b^d)",
                    "space_complexity": "O(b·d)",
                    "steps": all_steps
                }

            if depth < limit:
                for neighbor, weight in reversed(adj[current]):
                    if neighbor not in path:  # Avoid cycle in path
                        stack.append((neighbor, path + [neighbor], cost + weight, depth + 1))

    return {"algorithm": "IDS", "success": False, "steps": all_steps}


def run_bidirectional_search(start_node: str, goal_node: str = "S0") -> Dict[str, Any]:
    """
    Bidirectional Search:
    Runs two simultaneous BFS frontiers: one forward from start_node, one backward from goal_node.
    Stops when the two search frontiers intersect! Reduces time complexity from O(b^d) to O(b^(d/2)).
    """
    adj, labels = load_delivery_graph()

    forward_queue = deque([(start_node, [start_node], 0)])
    backward_queue = deque([(goal_node, [goal_node], 0)])

    forward_visited = {start_node: ([start_node], 0)}
    backward_visited = {goal_node: ([goal_node], 0)}

    steps = []

    while forward_queue and backward_queue:
        # Step forward
        f_curr, f_path, f_cost = forward_queue.popleft()
        step_f = {
            "step": len(steps) + 1,
            "direction": "Forward (from Start)",
            "expanded_node": f_curr,
            "path_so_far": f_path,
            "cost_so_far": f_cost,
            "log": f"Bidirectional [Forward] expanded '{f_curr}'. Frontier: {[item[0] for item in forward_queue]}"
        }
        steps.append(step_f)

        # Check intersection
        if f_curr in backward_visited:
            b_path, b_cost = backward_visited[f_curr]
            full_path = f_path[:-1] + list(reversed(b_path))
            total_cost = f_cost + b_cost
            return {
                "algorithm": "Bidirectional Search",
                "success": True,
                "intersection_node": f_curr,
                "path": full_path,
                "path_cost": total_cost,
                "nodes_expanded": len(steps),
                "completeness": "Complete",
                "optimality": "Optimal with proper step/weight intersection check",
                "time_complexity": "O(2 * b^(d/2)) - Dramatically faster than single BFS on large maps",
                "space_complexity": "O(b^(d/2))",
                "steps": steps
            }

        for neighbor, weight in adj[f_curr]:
            if neighbor not in forward_visited:
                new_path = f_path + [neighbor]
                new_cost = f_cost + weight
                forward_visited[neighbor] = (new_path, new_cost)
                forward_queue.append((neighbor, new_path, new_cost))

        # Step backward
        b_curr, b_path, b_cost = backward_queue.popleft()
        step_b = {
            "step": len(steps) + 1,
            "direction": "Backward (from Goal)",
            "expanded_node": b_curr,
            "path_so_far": b_path,
            "cost_so_far": b_cost,
            "log": f"Bidirectional [Backward] expanded '{b_curr}'. Frontier: {[item[0] for item in backward_queue]}"
        }
        steps.append(step_b)

        # Check intersection
        if b_curr in forward_visited:
            f_path, f_cost = forward_visited[b_curr]
            full_path = f_path + list(reversed(b_path))[1:]
            total_cost = f_cost + b_cost
            return {
                "algorithm": "Bidirectional Search",
                "success": True,
                "intersection_node": b_curr,
                "path": full_path,
                "path_cost": total_cost,
                "nodes_expanded": len(steps),
                "completeness": "Complete",
                "optimality": "Optimal",
                "time_complexity": "O(2 * b^(d/2))",
                "space_complexity": "O(b^(d/2))",
                "steps": steps
            }

        for neighbor, weight in adj[b_curr]:
            if neighbor not in backward_visited:
                new_path = b_path + [neighbor]
                new_cost = b_cost + weight
                backward_visited[neighbor] = (new_path, new_cost)
                backward_queue.append((neighbor, new_path, new_cost))

    return {"algorithm": "Bidirectional", "success": False, "steps": steps}


def compare_uninformed_searches(start_node: str = "A") -> List[Dict[str, Any]]:
    """Runs all 4 uninformed algorithms and returns comparative summary metrics."""
    res_bfs = run_bfs(start_node)
    res_dfs = run_dfs(start_node)
    res_ids = run_ids(start_node)
    res_bi = run_bidirectional_search(start_node)

    return [
        {
            "name": "BFS",
            "nodes_expanded": res_bfs.get("nodes_expanded", 0),
            "path": " -> ".join(res_bfs.get("path", [])),
            "path_cost": f"{res_bfs.get('path_cost', 0)} km",
            "complete": "Yes",
            "optimal": "Yes (hop-count)",
            "notes": "Explores level by level. High memory requirement O(b^d)."
        },
        {
            "name": "DFS",
            "nodes_expanded": res_dfs.get("nodes_expanded", 0),
            "path": " -> ".join(res_dfs.get("path", [])),
            "path_cost": f"{res_dfs.get('path_cost', 0)} km",
            "complete": "Yes (finite)",
            "optimal": "No",
            "notes": "Dives deep into first branch. Low memory O(bm), but may find suboptimal long paths."
        },
        {
            "name": "IDS",
            "nodes_expanded": res_ids.get("nodes_expanded", 0),
            "path": " -> ".join(res_ids.get("path", [])),
            "path_cost": f"{res_ids.get('path_cost', 0)} km",
            "complete": "Yes",
            "optimal": "Yes (hop-count)",
            "notes": "Repeatedly executes depth-limited search with increasing depth. Space-efficient O(bd)."
        },
        {
            "name": "Bidirectional",
            "nodes_expanded": res_bi.get("nodes_expanded", 0),
            "path": " -> ".join(res_bi.get("path", [])),
            "path_cost": f"{res_bi.get('path_cost', 0)} km",
            "complete": "Yes",
            "optimal": "Yes",
            "notes": "Searches forward from start and backward from goal. Exponential speedup O(b^(d/2))."
        }
    ]
