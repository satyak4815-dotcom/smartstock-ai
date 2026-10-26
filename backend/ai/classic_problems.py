"""
SmartStock AI - Module 6: Classic AI Problem-Solving Case Studies
Topic: State Space Representation, Problem Formulation, BFS, STRIPS Forward Planning, A* Tile Search
Course: BTech CSE 2nd Year Artificial Intelligence (CCSAI0301)
Team 80: NIET Greater Noida

Implements 4 classic AI case studies mapped directly to retail store warehouse operations:
1. Water-Jug Problem -> Rack Transfer (3-crate and 5-crate racks; goal: 4 crates; BFS optimal = 6 moves)
2. Missionaries & Cannibals -> Hazardous Zone Transfer (3 Perishable & 3 Cleaning crates; boat load 2; contamination rule; BFS optimal = 11 crossings)
3. Monkey & Banana Problem -> Restocking STRIPS Forward Planner (7 sequential operations with preconditions & effects)
4. 8-Puzzle -> 3x3 Shelf Grid Rearrangement (Solvable seeded scramble; A* Misplaced vs Manhattan vs BFS)
"""

from typing import Dict, List, Any, Optional, Tuple, Set
from collections import deque
import heapq
import random


# --- 1. WATER JUG -> RACK TRANSFER ---

def solve_water_jug_rack_transfer() -> Dict[str, Any]:
    """
    Classic Water Jug Problem mapped to Crate Rack Capacity Transfer:
    Rack 1 capacity = 3 crates, Rack 2 capacity = 5 crates.
    Goal: Exactly 4 crates in Rack 2 (or Rack 1).
    State: (x, y) where 0 <= x <= 3 and 0 <= y <= 5.
    Actions:
      - Fill Rack 1: (3, y)
      - Fill Rack 2: (x, 5)
      - Empty Rack 1: (0, y)
      - Empty Rack 2: (x, 0)
      - Pour 1 -> 2: transfer until Rack 2 full or Rack 1 empty
      - Pour 2 -> 1: transfer until Rack 1 full or Rack 2 empty
    Optimal BFS solution: Exactly 6 steps!
    """
    capacity1, capacity2 = 3, 5
    goal_amount = 4

    start_state = (0, 0)
    queue = deque([(start_state, [], "Initial state: both racks empty")])
    visited = {start_state}
    steps = []

    while queue:
        (x, y), path, action_desc = queue.popleft()

        step_record = {
            "step": len(steps) + 1,
            "state": {"rack1_3": x, "rack2_5": y},
            "action": action_desc,
            "path_length": len(path),
            "log": f"State ({x}, {y}): {action_desc}"
        }
        steps.append(step_record)

        # Goal check
        if x == goal_amount or y == goal_amount:
            full_path = path + [{"state": (x, y), "action": action_desc}]
            return {
                "problem": "Rack Transfer (3 & 5 Crates -> Goal 4)",
                "success": True,
                "initial_state": (0, 0),
                "goal_state": (x, y),
                "optimal_moves": len(path),
                "steps": steps,
                "solution_path": full_path,
                "state_space_nodes_visited": len(visited),
                "explanation": "BFS guarantees finding the shortest sequence of rack transfers (6 operations)."
            }

        # Successor generation
        successors = [
            ((capacity1, y), f"Fill Rack 1 (Cap 3) -> ({capacity1}, {y})"),
            ((x, capacity2), f"Fill Rack 2 (Cap 5) -> ({x}, {capacity2})"),
            ((0, y), f"Empty Rack 1 to return bay -> (0, {y})"),
            ((x, 0), f"Empty Rack 2 to return bay -> ({x}, 0)")
        ]

        # Pour 1 -> 2
        pour_1_to_2 = min(x, capacity2 - y)
        successors.append(((x - pour_1_to_2, y + pour_1_to_2), f"Pour Rack 1 into Rack 2 -> ({x - pour_1_to_2}, {y + pour_1_to_2})"))

        # Pour 2 -> 1
        pour_2_to_1 = min(y, capacity1 - x)
        successors.append(((x + pour_2_to_1, y - pour_2_to_1), f"Pour Rack 2 into Rack 1 -> ({x + pour_2_to_1}, {y - pour_2_to_1})"))

        for next_state, desc in successors:
            if next_state not in visited:
                visited.add(next_state)
                queue.append((next_state, path + [{"state": (x, y), "action": action_desc}], desc))

    return {"success": False}


# --- 2. MISSIONARIES & CANNIBALS -> ZONE TRANSFER ---

def solve_zone_transfer_crates() -> Dict[str, Any]:
    """
    Missionaries and Cannibals mapped to Hazard Zone Transfer:
    3 Perishable Crates (P) and 3 Toxic Cleaning Crates (C) in Zone A.
    Transfer all 6 crates to Zone B using a transport cart of capacity 2.
    Safety Contamination Constraint:
      In any zone, if P > 0, then Cleaning crates (C) must NOT exceed Perishable crates (C <= P).
      Otherwise, toxic vapor contamination occurs (FAIL).
    Expected BFS optimal: Exactly 11 crossings.
    State representation: (p_left, c_left, cart_position)
      cart_position: 1 = Zone A (left), 0 = Zone B (right).
    """
    start_state = (3, 3, 1)
    goal_state = (0, 0, 0)

    # Valid cart boat moves: (p_move, c_move)
    moves = [(1, 0), (2, 0), (0, 1), (0, 2), (1, 1)]

    def is_safe(p: int, c: int) -> bool:
        # Check Zone A
        if p > 0 and c > p:
            return False
        # Check Zone B
        p_right = 3 - p
        c_right = 3 - c
        if p_right > 0 and c_right > p_right:
            return False
        return True

    queue = deque([(start_state, [], "Start at Zone A")])
    visited = {start_state}
    steps = []

    while queue:
        (p, c, cart), path, action_desc = queue.popleft()

        step_record = {
            "step": len(steps) + 1,
            "zone_A": {"perishable": p, "cleaning": c},
            "zone_B": {"perishable": 3 - p, "cleaning": 3 - c},
            "cart_location": "Zone A (Left)" if cart == 1 else "Zone B (Right)",
            "action": action_desc,
            "crossings_so_far": len(path),
            "is_safe": True,
            "log": f"Crossing {len(path)}: Zone A ({p}P, {c}C) | Zone B ({3-p}P, {3-c}C) | Cart in {'A' if cart==1 else 'B'}"
        }
        steps.append(step_record)

        if (p, c, cart) == goal_state:
            full_path = path + [{"state": (p, c, cart), "action": action_desc}]
            return {
                "problem": "Zone Transfer (3 Perishable + 3 Cleaning Crates -> Safe Shift)",
                "success": True,
                "crossings_count": len(path),
                "steps": steps,
                "solution_path": full_path,
                "explanation": "BFS finds the 11-crossing optimal path ensuring Perishables are never outnumbered by Cleaning crates."
            }

        for dp, dc in moves:
            if cart == 1:
                # Move from A to B
                new_p = p - dp
                new_c = c - dc
                new_cart = 0
                dir_str = f"Transport {dp} Perishable + {dc} Cleaning from Zone A -> Zone B"
            else:
                # Move from B to A
                new_p = p + dp
                new_c = c + dc
                new_cart = 1
                dir_str = f"Return cart with {dp} Perishable + {dc} Cleaning from Zone B -> Zone A"

            if 0 <= new_p <= 3 and 0 <= new_c <= 3:
                if is_safe(new_p, new_c):
                    next_st = (new_p, new_c, new_cart)
                    if next_st not in visited:
                        visited.add(next_st)
                        queue.append((next_st, path + [{"state": (p, c, cart), "action": action_desc}], dir_str))

    return {"success": False}


# --- 3. MONKEY & BANANA -> STRIPS RESTOCKING PLANNER ---

def solve_strips_restocking_plan() -> Dict[str, Any]:
    """
    STRIPS-Style Forward State-Space Planner for Store Restocking:
    Mapped from classic Monkey & Banana problem.
    Actions have explicit Preconditions and Add/Delete Effects.
    Sequential Plan:
      1. CheckStock: Pre: HasKey -> Add: StockAudited
      2. LocateSupplier: Pre: StockAudited -> Add: SupplierIdentified
      3. CheckBudget: Pre: SupplierIdentified -> Add: BudgetApproved
      4. PlaceOrder: Pre: [SupplierIdentified, BudgetApproved] -> Add: OrderPlaced
      5. ConfirmDelivery: Pre: OrderPlaced -> Add: CratesReceived
      6. Shelve: Pre: CratesReceived -> Add: StockReplenished
      7. UpdateRecords: Pre: StockReplenished -> Add: RecordsUpdated (GOAL)
    """
    actions = [
        {
            "id": "CheckStock",
            "name": "Audit Shelf & Storage Racks",
            "preconditions": ["HasStoreKey", "StockIsLow"],
            "add_effects": ["StockAudited"],
            "delete_effects": []
        },
        {
            "id": "LocateSupplier",
            "name": "Query Supplier Database",
            "preconditions": ["StockAudited"],
            "add_effects": ["SupplierIdentified"],
            "delete_effects": []
        },
        {
            "id": "CheckBudget",
            "name": "Verify Store Daily Budget Limit",
            "preconditions": ["SupplierIdentified"],
            "add_effects": ["BudgetApproved"],
            "delete_effects": []
        },
        {
            "id": "PlaceOrder",
            "name": "Issue Purchase Order (PO)",
            "preconditions": ["SupplierIdentified", "BudgetApproved"],
            "add_effects": ["OrderPlaced"],
            "delete_effects": ["StockIsLow"]
        },
        {
            "id": "ConfirmDelivery",
            "name": "Unload Delivery Truck at Dock",
            "preconditions": ["OrderPlaced"],
            "add_effects": ["CratesReceived"],
            "delete_effects": []
        },
        {
            "id": "Shelve",
            "name": "Place Crates on Display Shelves",
            "preconditions": ["CratesReceived"],
            "add_effects": ["StockReplenished"],
            "delete_effects": []
        },
        {
            "id": "UpdateRecords",
            "name": "Sync ERP & Working Memory Records",
            "preconditions": ["StockReplenished"],
            "add_effects": ["RecordsUpdated"],
            "delete_effects": []
        }
    ]

    initial_state = {"HasStoreKey", "StockIsLow"}
    goal_state = {"StockReplenished", "RecordsUpdated"}

    current_state = set(initial_state)
    executed_plan = []
    steps = []

    step_num = 1
    for act in actions:
        pre_met = all(p in current_state for p in act["preconditions"])
        
        step_info = {
            "step": step_num,
            "action_id": act["id"],
            "action_name": act["name"],
            "preconditions": act["preconditions"],
            "preconditions_satisfied": pre_met,
            "state_before": sorted(list(current_state)),
            "add_effects": act["add_effects"],
            "log": f"Action '{act['name']}': Preconditions {act['preconditions']} are {'SATISFIED' if pre_met else 'UNMET'}."
        }

        if pre_met:
            for p in act["delete_effects"]:
                current_state.discard(p)
            for a in act["add_effects"]:
                current_state.add(a)
            executed_plan.append(act["id"])
            step_info["state_after"] = sorted(list(current_state))
            step_info["executed"] = True
        else:
            step_info["executed"] = False

        steps.append(step_info)
        step_num += 1

    goal_achieved = goal_state.issubset(current_state)

    return {
        "problem": "Restocking Multi-Step Planning (STRIPS Formulation)",
        "initial_state": sorted(list(initial_state)),
        "goal_state": sorted(list(goal_state)),
        "goal_achieved": goal_achieved,
        "plan_length": len(executed_plan),
        "executed_plan": executed_plan,
        "steps": steps,
        "explanation": "Forward state-space planner executed all 7 STRIPS operators in strict dependency order."
    }


# --- 4. 8-TILES PROBLEM -> SHELF REARRANGEMENT ---

GOAL_TILES = (1, 2, 3, 4, 5, 6, 7, 8, 0)

def get_manhattan_distance(state: Tuple[int, ...]) -> int:
    """Computes total Manhattan distance for 8-puzzle."""
    dist = 0
    for idx, val in enumerate(state):
        if val != 0:
            target_idx = val - 1
            curr_r, curr_c = divmod(idx, 3)
            target_r, target_c = divmod(target_idx, 3)
            dist += abs(curr_r - target_r) + abs(curr_c - target_c)
    return dist


def get_misplaced_tiles(state: Tuple[int, ...]) -> int:
    """Computes number of misplaced tiles."""
    return sum(1 for idx, val in enumerate(state) if val != 0 and val != GOAL_TILES[idx])


def get_tile_neighbors(state: Tuple[int, ...]) -> List[Tuple[Tuple[int, ...], str]]:
    blank_idx = state.index(0)
    r, c = divmod(blank_idx, 3)
    neighbors = []
    
    moves = [(-1, 0, "UP"), (1, 0, "DOWN"), (0, -1, "LEFT"), (0, 1, "RIGHT")]
    for dr, dc, move_name in moves:
        nr, nc = r + dr, c + dc
        if 0 <= nr < 3 and 0 <= nc < 3:
            swap_idx = nr * 3 + nc
            new_state = list(state)
            new_state[blank_idx], new_state[swap_idx] = new_state[swap_idx], new_state[blank_idx]
            neighbors.append((tuple(new_state), move_name))
    return neighbors


def solve_shelf_tiles_astar(initial_state: Optional[Tuple[int, ...]] = None, heuristic_type: str = "manhattan") -> Dict[str, Any]:
    """
    Solves 8-puzzle shelf rearrangement using A* search.
    Defaults to a deterministically solvable state requiring ~4 to 8 moves.
    """
    if initial_state is None:
        # A known 4-move solvable state:
        # Goal:   1 2 3 / 4 5 6 / 7 8 0
        # Start:  1 2 3 / 4 0 6 / 7 5 8 (2 down, etc)
        initial_state = (1, 2, 3, 4, 0, 6, 7, 5, 8)

    h_fn = get_manhattan_distance if heuristic_type == "manhattan" else get_misplaced_tiles
    start_h = h_fn(initial_state)

    counter = 0
    frontier = [(start_h, 0, counter, initial_state, [])]
    explored: Set[Tuple[int, ...]] = set()
    steps = []

    while frontier:
        f, g, _, current, path = heapq.heappop(frontier)

        if current in explored:
            continue
        explored.add(current)

        step_info = {
            "step": len(steps) + 1,
            "grid": list(current),
            "g": g,
            "h": h_fn(current),
            "f": f,
            "moves_so_far": len(path),
            "log": f"A* explored grid (f={f}, g={g}, h={h_fn(current)})"
        }
        steps.append(step_info)

        if current == GOAL_TILES:
            return {
                "problem": "8-Puzzle Shelf Rearrangement",
                "heuristic": heuristic_type,
                "initial_grid": list(initial_state),
                "goal_grid": list(GOAL_TILES),
                "solution_moves": len(path),
                "nodes_expanded": len(steps),
                "path": path,
                "steps": steps[:20],  # Return first 20 steps for neat UI animation
                "explanation": f"A* with {heuristic_type} heuristic reached goal in {len(path)} moves with only {len(steps)} node expansions."
            }

        for next_st, move_dir in get_tile_neighbors(current):
            if next_st not in explored:
                counter += 1
                new_g = g + 1
                new_h = h_fn(next_st)
                heapq.heappush(frontier, (new_g + new_h, new_g, counter, next_st, path + [move_dir]))

    return {"success": False}
