"""
SmartStock AI - Module 9 & 10: Chaining Engines
Topic: Forward Chaining (Data-Driven) and Backward Chaining (Goal-Driven)
Course: BTech CSE 2nd Year Artificial Intelligence (CCSAI0301)
Team 80: NIET Greater Noida

Implements:
1. Forward Chaining: Starts with known facts in Working Memory, fires rules whose
   antecedents are satisfied, adds new conclusions until no more rules can fire.
2. Backward Chaining: Starts with a hypothesis/goal (e.g., ReorderUrgent(Milk1L)),
   breaks it into subgoals, checks if facts exist in Working Memory, returns
   a complete Proof Tree explaining WHY the goal succeeded or failed.
"""

from typing import Dict, List, Any, Optional


def run_forward_chaining(products: List[Dict[str, Any]], festival_season: bool = False) -> Dict[str, Any]:
    """
    Executes Forward Chaining over the product inventory.
    Returns:
      - agenda: step-by-step activations and rule firings
      - working_memory: initial and deduced facts
      - conclusions: categorized actions (urgent, normal, discount, find_supplier, check_stock, no_action)
    """
    agenda = []
    conclusions = []
    working_memory_log = []

    # Counts
    counts = {
        "urgent": 0,
        "normal": 0,
        "discount": 0,
        "find_supplier": 0,
        "check_stock": 0,
        "no_action": 0
    }

    # Step 1: Initialize Working Memory with base facts
    for p in products:
        p_id = p["id"]
        name = p["name"]
        stock = p["stock"]
        
        # Festival multiplier adjustment
        base_reorder = p["reorder_level"]
        reorder_level = int(base_reorder * 1.5) if festival_season else base_reorder
        
        daily_sales = int(p["daily_sales"] * 1.5) if festival_season else p["daily_sales"]
        days_to_expiry = p.get("days_to_expiry")
        suppliers = p.get("suppliers", [])

        # Deduce atomic propositions
        L = stock < reorder_level
        F = daily_sales >= 8
        S = len(suppliers) > 0
        P = p.get("perishable", False)
        N = P and (days_to_expiry is not None) and (days_to_expiry <= 2)
        near_reorder = (not L) and (not N) and (stock <= 1.25 * reorder_level)

        facts = {
            "Product": name,
            "ID": p_id,
            "LowStock": L,
            "FastMoving": F,
            "SupplierAvailable": S,
            "Perishable": P,
            "NearExpiry": N,
            "StockNearThreshold": near_reorder
        }
        working_memory_log.append(facts)

        # Rule evaluation pipeline
        fired_rule = None
        action = None
        reason = None
        confidence = "Medium"  # Meta-knowledge: sample data capped at Medium

        # R1: L ^ F ^ S -> ReorderUrgent
        if L and F and S:
            fired_rule = "R1: L ∧ F ∧ S → ReorderUrgent"
            action = "reorder_urgent"
            best_supp = suppliers[0]["supplier_id"] if suppliers else "None"
            reason = f"Stock ({stock}) is below safety threshold ({reorder_level}), daily demand is high ({daily_sales}/day), and supplier is ready."
            if festival_season:
                reason += " (Festival season heuristic applied: demand increased by 50% and safety threshold raised)."
            counts["urgent"] += 1

        # R2: L ^ ~F ^ S -> ReorderNormal
        elif L and (not F) and S:
            fired_rule = "R2: L ∧ ¬F ∧ S → ReorderNormal"
            action = "reorder_normal"
            reason = f"Stock ({stock}) is below reorder level ({reorder_level}), but consumption rate is steady ({daily_sales}/day). Standard reorder scheduled."
            if festival_season:
                reason += " (Festival season heuristic applied)."
            counts["normal"] += 1

        # R3: P ^ N ^ ~L -> Discount
        elif P and N and (not L):
            fired_rule = "R3: P ∧ N ∧ ¬L → Discount"
            action = "discount"
            reason = f"Item is perishable with only {days_to_expiry} day(s) left before expiry. Stock is adequate ({stock}), applying immediate discount (20%) to clear shelf."
            counts["discount"] += 1

        # R4: L ^ ~S -> FindOtherSupplier (Gap closed!)
        elif L and (not S):
            fired_rule = "R4: L ∧ ¬S → FindOtherSupplier"
            action = "find_other_supplier"
            reason = f"CRITICAL GAP: Stock ({stock}) is below reorder level ({reorder_level}), but NO supplier is assigned or available. Flagged for procurement negotiation."
            counts["find_supplier"] += 1

        # R5: ~L ^ ~N ^ (stock <= 1.25 * reorder_level) -> CheckStock
        elif near_reorder:
            fired_rule = "R5: ¬L ∧ ¬N ∧ (Stock ≤ 1.25×Reorder) → CheckStock"
            action = "check_stock"
            threshold_val = 1.25 * reorder_level
            reason = f"Stock ({stock}) is within 25% of reorder threshold ({threshold_val:.1f}). Scheduled for warehouse visual stock audit."
            counts["check_stock"] += 1

        else:
            action = "no_action"
            fired_rule = "None (No antecedent matched)"
            reason = f"Stock ({stock}) is ample compared to reorder level ({reorder_level}) and item is non-perishable or well within shelf life."
            counts["no_action"] += 1

        agenda.append({
            "product_id": p_id,
            "product_name": name,
            "rule_fired": fired_rule,
            "action": action,
            "reason": reason,
            "confidence": confidence,
            "facts_used": {
                "L (LowStock)": L,
                "F (FastMoving)": F,
                "S (SupplierAvailable)": S,
                "P (Perishable)": P,
                "N (NearExpiry)": N
            }
        })

        if action != "no_action":
            conclusions.append({
                "product_id": p_id,
                "product_name": name,
                "action": action,
                "rule_fired": fired_rule,
                "reason": reason,
                "confidence": confidence,
                "stock": stock,
                "reorder_level": reorder_level,
                "daily_sales": daily_sales,
                "suppliers": suppliers
            })

    total_conclusions = (counts["urgent"] + counts["normal"] + counts["discount"] + 
                         counts["find_supplier"] + counts["check_stock"])

    return {
        "festival_season": festival_season,
        "total_products": len(products),
        "total_conclusions": total_conclusions,
        "counts": counts,
        "agenda": agenda,
        "conclusions": conclusions
    }


def run_backward_chaining(product_id: str, goal: str, products: List[Dict[str, Any]], festival_season: bool = False) -> Dict[str, Any]:
    """
    Executes Backward Chaining for a specific hypothesis/goal and product.
    Example goals:
      - 'ReorderUrgent'
      - 'ReorderNormal'
      - 'Discount'
      - 'FindOtherSupplier'
      - 'CheckStock'
    Produces a recursive proof tree showing subgoals, evaluation, and proof status.
    """
    product = next((p for p in products if p["id"] == product_id or p["name"].lower() == product_id.lower()), None)
    if not product:
        return {"error": f"Product '{product_id}' not found in database."}

    name = product["name"]
    stock = product["stock"]
    base_reorder = product["reorder_level"]
    reorder_level = int(base_reorder * 1.5) if festival_season else base_reorder
    daily_sales = int(product["daily_sales"] * 1.5) if festival_season else product["daily_sales"]
    days_to_expiry = product.get("days_to_expiry")
    suppliers = product.get("suppliers", [])

    # Evaluate primitive facts
    fact_L = stock < reorder_level
    fact_F = daily_sales >= 8
    fact_S = len(suppliers) > 0
    fact_P = product.get("perishable", False)
    fact_N = fact_P and (days_to_expiry is not None) and (days_to_expiry <= 2)
    fact_check = (not fact_L) and (not fact_N) and (stock <= 1.25 * reorder_level)

    proof_tree = {
        "goal": f"{goal}({name})",
        "product": name,
        "product_id": product["id"],
        "subgoals": [],
        "proved": False,
        "explanation": ""
    }

    if goal == "ReorderUrgent":
        # Rule R1: L ^ F ^ S -> ReorderUrgent
        subgoals = [
            {
                "subgoal": f"LowStock({name})",
                "condition": f"stock ({stock}) < reorder_level ({reorder_level})",
                "satisfied": fact_L,
                "type": "fact"
            },
            {
                "subgoal": f"FastMoving({name})",
                "condition": f"daily_sales ({daily_sales}) >= 8",
                "satisfied": fact_F,
                "type": "fact"
            },
            {
                "subgoal": f"SupplierAvailable({name})",
                "condition": f"supplier count ({len(suppliers)}) > 0",
                "satisfied": fact_S,
                "type": "fact"
            }
        ]
        all_satisfied = all(sg["satisfied"] for sg in subgoals)
        proof_tree["subgoals"] = subgoals
        proof_tree["proved"] = all_satisfied
        if all_satisfied:
            proof_tree["explanation"] = f"PROVEN: All 3 subgoals for Rule R1 are satisfied in Working Memory. Therefore ReorderUrgent({name}) holds."
        else:
            failed = [sg["subgoal"] for sg in subgoals if not sg["satisfied"]]
            proof_tree["explanation"] = f"DISPROVEN: Subgoal(s) {failed} failed for Rule R1. ReorderUrgent({name}) cannot be derived."

    elif goal == "ReorderNormal":
        # Rule R2: L ^ ~F ^ S -> ReorderNormal
        subgoals = [
            {
                "subgoal": f"LowStock({name})",
                "condition": f"stock ({stock}) < reorder_level ({reorder_level})",
                "satisfied": fact_L,
                "type": "fact"
            },
            {
                "subgoal": f"NotFastMoving({name})",
                "condition": f"daily_sales ({daily_sales}) < 8",
                "satisfied": not fact_F,
                "type": "fact"
            },
            {
                "subgoal": f"SupplierAvailable({name})",
                "condition": f"supplier count ({len(suppliers)}) > 0",
                "satisfied": fact_S,
                "type": "fact"
            }
        ]
        all_satisfied = all(sg["satisfied"] for sg in subgoals)
        proof_tree["subgoals"] = subgoals
        proof_tree["proved"] = all_satisfied
        if all_satisfied:
            proof_tree["explanation"] = f"PROVEN: All 3 subgoals for Rule R2 are satisfied in Working Memory."
        else:
            failed = [sg["subgoal"] for sg in subgoals if not sg["satisfied"]]
            proof_tree["explanation"] = f"DISPROVEN: Subgoal(s) {failed} failed for Rule R2."

    elif goal == "Discount":
        # Rule R3: P ^ N ^ ~L -> Discount
        subgoals = [
            {
                "subgoal": f"Perishable({name})",
                "condition": f"perishable == True",
                "satisfied": fact_P,
                "type": "fact"
            },
            {
                "subgoal": f"NearExpiry({name})",
                "condition": f"days_to_expiry ({days_to_expiry}) <= 2",
                "satisfied": fact_N,
                "type": "fact"
            },
            {
                "subgoal": f"NotLowStock({name})",
                "condition": f"stock ({stock}) >= reorder_level ({reorder_level})",
                "satisfied": not fact_L,
                "type": "fact"
            }
        ]
        all_satisfied = all(sg["satisfied"] for sg in subgoals)
        proof_tree["subgoals"] = subgoals
        proof_tree["proved"] = all_satisfied
        if all_satisfied:
            proof_tree["explanation"] = f"PROVEN: Item is perishable, nearing expiry, and stock is not critically depleted. Discount({name}) derived."
        else:
            failed = [sg["subgoal"] for sg in subgoals if not sg["satisfied"]]
            proof_tree["explanation"] = f"DISPROVEN: Subgoal(s) {failed} failed for Rule R3."

    elif goal == "FindOtherSupplier":
        # Rule R4: L ^ ~S -> FindOtherSupplier
        subgoals = [
            {
                "subgoal": f"LowStock({name})",
                "condition": f"stock ({stock}) < reorder_level ({reorder_level})",
                "satisfied": fact_L,
                "type": "fact"
            },
            {
                "subgoal": f"NoSupplierAvailable({name})",
                "condition": f"supplier count ({len(suppliers)}) == 0",
                "satisfied": not fact_S,
                "type": "fact"
            }
        ]
        all_satisfied = all(sg["satisfied"] for sg in subgoals)
        proof_tree["subgoals"] = subgoals
        proof_tree["proved"] = all_satisfied
        if all_satisfied:
            proof_tree["explanation"] = f"PROVEN: Stock is low but zero suppliers are available. FindOtherSupplier({name}) derived."
        else:
            failed = [sg["subgoal"] for sg in subgoals if not sg["satisfied"]]
            proof_tree["explanation"] = f"DISPROVEN: Subgoal(s) {failed} failed for Rule R4."

    elif goal == "CheckStock":
        # Rule R5: ~L ^ ~N ^ stock <= 1.25 * reorder
        subgoals = [
            {
                "subgoal": f"NotLowStock({name})",
                "condition": f"stock ({stock}) >= reorder_level ({reorder_level})",
                "satisfied": not fact_L,
                "type": "fact"
            },
            {
                "subgoal": f"NotNearExpiry({name})",
                "condition": f"not near expiry",
                "satisfied": not fact_N,
                "type": "fact"
            },
            {
                "subgoal": f"NearReorderThreshold({name})",
                "condition": f"stock ({stock}) <= 1.25 * reorder_level ({1.25 * reorder_level:.1f})",
                "satisfied": stock <= 1.25 * reorder_level,
                "type": "fact"
            }
        ]
        all_satisfied = all(sg["satisfied"] for sg in subgoals)
        proof_tree["subgoals"] = subgoals
        proof_tree["proved"] = all_satisfied
        if all_satisfied:
            proof_tree["explanation"] = f"PROVEN: Stock is slightly above threshold. CheckStock({name}) derived."
        else:
            failed = [sg["subgoal"] for sg in subgoals if not sg["satisfied"]]
            proof_tree["explanation"] = f"DISPROVEN: Subgoal(s) {failed} failed for Rule R5."

    return proof_tree
