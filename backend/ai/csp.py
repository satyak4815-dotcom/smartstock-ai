"""
SmartStock AI - Module 4: Constraint Satisfaction Problem (CSP)
Topic: CSP Formulation, Backtracking Search, Forward Checking, Minimum Remaining Values (MRV) Heuristic
Course: BTech CSE 2nd Year Artificial Intelligence (CCSAI0301)
Team 80: NIET Greater Noida

CSP Formulation:
1. Variables (X): Order quantity per product requiring replenishment today:
   {Milk1L, Curd 500g, Rice 5kg, Cooking Oil 1L, Detergent 1kg, Soap}
2. Domains (D): Discrete order quantities {0, 10, 20, 30, 40} respecting MOQ.
3. Constraints (C):
   - Daily Budget: Sum(unit_cost * qty) <= Budget (default Rs 15,000; adjustable)
   - Supplier MOQ: For each product, qty == 0 or qty >= supplier MOQ
   - Total Warehouse Capacity: Total initial stock + Sum(qty) <= 400
   - Perishable Shelf-Life: For perishables, qty <= daily_sales * max_shelf_life_days
"""

from typing import Dict, List, Any, Optional
import copy


def solve_replenishment_csp(
    candidate_products: List[Dict[str, Any]],
    total_warehouse_stock: int = 150,
    daily_budget: float = 15000.0,
    warehouse_capacity: int = 400
) -> Dict[str, Any]:
    """
    Backtracking CSP Solver with Forward Checking and MRV (Minimum Remaining Values).
    Logs all variable assignment steps, domain prunings, and constraint violations.
    """
    # Select products needing replenishment (e.g. low stock items)
    reorder_items = [p for p in candidate_products if p.get("stock", 0) < p.get("reorder_level", 20)]
    if not reorder_items:
        reorder_items = candidate_products[:4]

    variables = [p["name"] for p in reorder_items]
    prod_map = {p["name"]: p for p in reorder_items}

    # Initial domains
    domains: Dict[str, List[int]] = {}
    for var in variables:
        p = prod_map[var]
        moq = p.get("min_order_qty", 10)
        # Domain includes 0 and multiples of 10 up to 40
        raw_domain = [0, 10, 20, 30, 40]
        
        # Immediate unary constraint: Perishable limit
        if p.get("perishable", False) and p.get("max_shelf_life_days"):
            max_allowed = p["daily_sales"] * p["max_shelf_life_days"]
            filtered = [q for q in raw_domain if q <= max_allowed]
        else:
            filtered = raw_domain

        # Supplier MOQ: if ordered (q > 0), must be >= moq
        domains[var] = [q for q in filtered if q == 0 or q >= moq]

    steps = []
    assignment_order = []
    pruning_log = []

    def get_assigned_cost(assignment: Dict[str, int]) -> float:
        total_cost = 0.0
        for v, qty in assignment.items():
            p = prod_map[v]
            unit_cost = p["suppliers"][0]["cost"] if p.get("suppliers") else 50
            total_cost += unit_cost * qty
        return total_cost

    def get_assigned_units(assignment: Dict[str, int]) -> int:
        return sum(assignment.values())

    # Backtracking search with MRV and Forward Checking
    def backtrack(assignment: Dict[str, int], current_domains: Dict[str, List[int]]) -> Optional[Dict[str, int]]:
        if len(assignment) == len(variables):
            return assignment

        # MRV Heuristic: Choose unassigned variable with the fewest remaining legal values
        unassigned = [v for v in variables if v not in assignment]
        var = min(unassigned, key=lambda v: len(current_domains[v]))
        assignment_order.append(var)

        for val in sorted(current_domains[var], reverse=True):  # Prefer fulfilling orders (larger quantities)
            # Check global constraints with this value
            trial_assignment = {**assignment, var: val}
            trial_cost = get_assigned_cost(trial_assignment)
            trial_stock = total_warehouse_stock + get_assigned_units(trial_assignment)

            step_entry = {
                "step": len(steps) + 1,
                "variable": var,
                "trial_value": val,
                "current_cost": trial_cost,
                "budget_limit": daily_budget,
                "current_stock": trial_stock,
                "capacity_limit": warehouse_capacity,
                "valid": True,
                "reason": f"Testing {var} = {val} units"
            }

            if trial_cost > daily_budget:
                step_entry["valid"] = False
                step_entry["reason"] = f"Budget Exceeded! Cost Rs {trial_cost:.0f} > Budget Rs {daily_budget:.0f}"
                steps.append(step_entry)
                pruning_log.append(f"Pruned {var}={val}: Exceeds budget limit.")
                continue

            if trial_stock > warehouse_capacity:
                step_entry["valid"] = False
                step_entry["reason"] = f"Capacity Exceeded! Total {trial_stock} units > Max {warehouse_capacity}"
                steps.append(step_entry)
                pruning_log.append(f"Pruned {var}={val}: Exceeds storage capacity.")
                continue

            # Forward Checking on remaining variables
            steps.append(step_entry)
            new_domains = copy.deepcopy(current_domains)
            new_domains[var] = [val]

            # Prune impossible values from future variables given remaining budget
            remaining_budget = daily_budget - trial_cost
            remaining_capacity = warehouse_capacity - trial_stock
            
            domain_wipeout = False
            for other_var in unassigned:
                if other_var != var:
                    other_p = prod_map[other_var]
                    other_cost = other_p["suppliers"][0]["cost"] if other_p.get("suppliers") else 50
                    valid_vals = []
                    for cand_q in new_domains[other_var]:
                        if (cand_q * other_cost <= remaining_budget) and (cand_q <= remaining_capacity):
                            valid_vals.append(cand_q)
                    new_domains[other_var] = valid_vals
                    if not valid_vals:
                        domain_wipeout = True
                        pruning_log.append(f"Forward Checking: Domain wipeout on {other_var} when {var}={val}.")
                        break

            if not domain_wipeout:
                result = backtrack(trial_assignment, new_domains)
                if result is not None:
                    return result

        return None

    solution = backtrack({}, copy.deepcopy(domains))

    is_approved = solution is not None
    total_cost = get_assigned_cost(solution) if solution else 0
    total_ordered = get_assigned_units(solution) if solution else 0

    # Format solution table
    solution_rows = []
    if solution:
        for var, qty in solution.items():
            p = prod_map[var]
            cost_per = p["suppliers"][0]["cost"] if p.get("suppliers") else 50
            solution_rows.append({
                "product_name": var,
                "product_id": p["id"],
                "approved_order_qty": qty,
                "unit_cost": cost_per,
                "subtotal": cost_per * qty,
                "status": "APPROVED" if qty > 0 else "NO_ORDER_ZERO_QTY"
            })

    return {
        "status": "APPROVED" if is_approved else "REJECTED",
        "is_approved": is_approved,
        "daily_budget": daily_budget,
        "total_cost": total_cost,
        "budget_utilized_pct": round((total_cost / daily_budget) * 100, 1) if daily_budget > 0 else 0,
        "total_warehouse_stock_after": total_warehouse_stock + total_ordered,
        "warehouse_capacity": warehouse_capacity,
        "variables": variables,
        "assignment_order": assignment_order,
        "solution": solution if solution else {},
        "solution_rows": solution_rows,
        "pruning_log": pruning_log,
        "steps": steps,
        "violated_constraints": [] if is_approved else ["Daily Procurement Budget exceeded or storage space insufficient for batch MOQ requirements."]
    }
