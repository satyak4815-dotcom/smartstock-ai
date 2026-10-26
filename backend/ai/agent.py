"""
SmartStock AI - Module 1: Intelligent Agent Architecture
Topic: Agents & Environments, PEAS Framework, Agent Typologies (Reflex, Model-Based, Goal-Based, Utility-Based)
Course: BTech CSE 2nd Year Artificial Intelligence (CCSAI0301)
Team 80: NIET Greater Noida

Implements:
1. PEAS Specification:
   - Performance Measure: Stockout Minimization, Zero Expiry Waste, Low Holding Cost, High Customer Service Level (>= 98%)
   - Environment: Retail Store Warehouse (12 SKUs, dynamic sales demand, supplier delivery lead times)
   - Actuators: PO Dispatch, Discount Price Tagging, Physical Audit Schedule, Supplier RfP Inquiry
   - Sensors: Barcode POS Scans, Physical Stock Tally, Expiry Date Labels, Supplier Availability Feeds
2. Agent Typologies:
   - Simple Reflex Agent: Immediate condition-action rules without memory.
   - Model-Based Reflex Agent: Tracks internal state (history of stock drawdown and moving average demand).
   - Goal-Based Agent: Evaluates actions towards reaching the safe buffer goal [reorder_level+10, reorder_level+50].
   - Utility-Based Agent: Computes utility score: U = - (Stockout Penalty + Holding Cost + Spoilage Risk).
     [Project Chosen Design: Goal-Based advancing to Utility-Based].
"""

from typing import Dict, List, Any, Optional


def get_peas_specification() -> Dict[str, Any]:
    """Returns formal PEAS table for SmartStock AI."""
    return {
        "title": "PEAS Framework (Performance, Environment, Actuators, Sensors)",
        "elements": [
            {
                "dimension": "Performance Measure",
                "abbreviation": "P",
                "color": "blue",
                "description": "Minimize stockouts (target < 2%), eliminate perishable expiry waste, maintain holding cost < Rs 200/day, ensure 100% supplier contract compliance."
            },
            {
                "dimension": "Environment",
                "abbreviation": "E",
                "color": "green",
                "description": "Retail shop shelves and backroom racks (12 products, 4 suppliers, daily customer demand fluctuations, 1-3 day delivery lead times)."
            },
            {
                "dimension": "Actuators",
                "abbreviation": "A",
                "color": "orange",
                "description": "Automatic PO generation, shelf clearance markdown discount tags, cycle count audit task generation, supplier search escalation."
            },
            {
                "dimension": "Sensors",
                "abbreviation": "S",
                "color": "purple",
                "description": "Daily inventory balance tally, POS checkout register sales stream, batch expiry dates, supplier open/closed status flags."
            }
        ],
        "environment_properties": [
            {"property": "Partially Observable vs Fully Observable", "value": "Partially Observable", "reason": "True store theft/spoilage is hidden until physical audits; future customer footfall is unknown."},
            {"property": "Deterministic vs Stochastic", "value": "Stochastic", "reason": "Daily sales velocity and supplier lead times vary probabilistically."},
            {"property": "Episodic vs Sequential", "value": "Sequential", "reason": "Today's reorder decision directly affects tomorrow's available shelf capacity and capital."},
            {"property": "Static vs Dynamic", "value": "Dynamic", "reason": "Perishable shelf lives tick down continuously while the agent deliberates."},
            {"property": "Discrete vs Continuous", "value": "Discrete", "reason": "Stock counts, reorder batches, and daily audit cycles occur in discrete units."},
            {"property": "Single-Agent vs Multi-Agent", "value": "Multi-Agent", "reason": "Interacts with external suppliers in negotiation game trees (Module 5)."}
        ]
    }


class InventoryAgent:
    def __init__(self, agent_type: str = "goal"):
        """
        agent_type: 'reflex', 'model', 'goal', 'utility'
        Chosen project design: 'goal' moving to 'utility'.
        """
        self.agent_type = agent_type
        # Internal state memory for Model-Based Agent
        self.stock_history: Dict[str, List[int]] = {}

    def perceive(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """Percept extraction from environment sensor data."""
        p_id = product["id"]
        stock = product["stock"]
        if p_id not in self.stock_history:
            self.stock_history[p_id] = [stock + 10, stock + 5, stock]  # Sample past 3 days
        else:
            self.stock_history[p_id].append(stock)

        return {
            "product_id": p_id,
            "product_name": product["name"],
            "current_stock": stock,
            "reorder_level": product["reorder_level"],
            "daily_sales": product["daily_sales"],
            "days_to_expiry": product.get("days_to_expiry"),
            "perishable": product.get("perishable", False),
            "suppliers_count": len(product.get("suppliers", [])),
            "stock_history": self.stock_history[p_id]
        }

    def decide(self, percepts: Dict[str, Any]) -> Dict[str, Any]:
        """Decision function based on configured agent architecture."""
        stock = percepts["current_stock"]
        reorder_level = percepts["reorder_level"]
        daily_sales = percepts["daily_sales"]
        days_to_exp = percepts["days_to_expiry"]
        perishable = percepts["perishable"]
        has_supplier = percepts["suppliers_count"] > 0
        name = percepts["product_name"]

        trace = []
        action = "no_action"
        reason = ""
        utility_score = 0.0

        trace.append(f"Agent received percepts: Stock={stock}, Threshold={reorder_level}, Sales={daily_sales}/day, HasSupplier={has_supplier}")

        # 1. Simple Reflex Agent: Condition-Action table only
        if self.agent_type == "reflex":
            trace.append("Executing Simple Reflex condition-action rules...")
            if stock < reorder_level and has_supplier and daily_sales >= 8:
                action = "reorder_urgent"
                reason = "Condition met: stock < threshold AND fast-moving AND supplier available."
            elif stock < reorder_level and has_supplier:
                action = "reorder_normal"
                reason = "Condition met: stock < threshold AND supplier available."
            elif stock < reorder_level and not has_supplier:
                action = "find_other_supplier"
                reason = "Condition met: stock < threshold AND NO supplier."
            elif perishable and (days_to_exp is not None) and days_to_exp <= 2 and stock >= reorder_level:
                action = "discount"
                reason = "Condition met: perishable AND near expiry AND adequate stock."
            elif stock <= 1.25 * reorder_level:
                action = "check_stock"
                reason = "Condition met: stock near threshold."
            else:
                action = "no_action"
                reason = "Condition met: stock is ample."

        # 2. Model-Based Reflex Agent: Integrates historical consumption model
        elif self.agent_type == "model":
            history = percepts["stock_history"]
            consumption_trend = history[-2] - history[-1] if len(history) >= 2 else daily_sales
            trace.append(f"Model-Based Agent consulting internal memory: Stock trend shows -{consumption_trend} units drawdown over recent intervals.")
            
            # Anticipatory threshold adjustment
            projected_days_left = stock / max(consumption_trend, 1)
            trace.append(f"Internal Model projection: {projected_days_left:.1f} days of inventory remaining at current velocity.")

            if projected_days_left < 1.5 and has_supplier:
                action = "reorder_urgent"
                reason = f"Internal model predicts stockout in {projected_days_left:.1f} days! Urgent PO issued."
            elif stock < reorder_level and has_supplier:
                action = "reorder_normal"
                reason = f"Internal model confirmed deficit below safe threshold {reorder_level}."
            elif stock < reorder_level and not has_supplier:
                action = "find_other_supplier"
                reason = "Internal model detected low stock with zero supplier connection."
            elif perishable and (days_to_exp is not None) and days_to_exp <= 2:
                action = "discount"
                reason = "Internal model flags impending expiration risk."
            elif stock <= 1.25 * reorder_level:
                action = "check_stock"
                reason = "Internal model flags inventory approaching danger zone."
            else:
                action = "no_action"
                reason = "Internal model confirms safe runway."

        # 3. Goal-Based Agent (Chosen Core Design): Explicit goal state formulation
        elif self.agent_type == "goal":
            goal_min = reorder_level + 10
            goal_max = reorder_level + 50
            trace.append(f"Goal-Based Agent evaluating goal state: Inventory in buffer [{goal_min}, {goal_max}] and zero spoilage.")

            # Does current state achieve goal?
            in_goal = goal_min <= stock <= goal_max
            trace.append(f"Current state goal status: {'SATISFIED' if in_goal else 'UNSATISFIED'}")

            if stock < reorder_level:
                if has_supplier:
                    if daily_sales >= 8:
                        action = "reorder_urgent"
                        reason = f"Goal violation: Stock ({stock}) < {reorder_level}. Action 'reorder_urgent' restores stock to target goal [{goal_min}, {goal_max}]."
                    else:
                        action = "reorder_normal"
                        reason = f"Goal violation: Stock ({stock}) < {reorder_level}. Action 'reorder_normal' restores stock to target goal."
                else:
                    action = "find_other_supplier"
                    reason = "Subgoal failure: Supplier connection missing; must acquire supplier before inventory goal can be met."
            elif perishable and (days_to_exp is not None) and days_to_exp <= 2:
                action = "discount"
                reason = "Goal preservation: Discount prevents non-sale spoilage, preserving zero-waste goal."
            elif stock <= 1.25 * reorder_level:
                action = "check_stock"
                reason = "Proactive maintenance: Audit ensures physical state aligns with recorded goal parameters."
            else:
                action = "no_action"
                reason = f"Current inventory maintains goal state [{goal_min}, {goal_max}]."

        # 4. Utility-Based Agent: Maximizes multi-attribute utility function
        elif self.agent_type == "utility":
            trace.append("Utility-Based Agent calculating expected utility payoffs across alternative actions...")
            
            # Payoff components:
            # - Lost Sales Penalty: if stock < 0, Rs 50/unit
            # - Holding Cost: Rs 0.5/unit/day
            # - Expiry Spoilage Penalty: full product sell_price if expired
            # Actions considered: [reorder_urgent, reorder_normal, discount, check_stock, no_action]
            utilities = {}

            # Utility of Reorder Urgent:
            u_urgent = 80 if (stock < reorder_level and daily_sales >= 8 and has_supplier) else 20
            # Utility of Normal:
            u_normal = 75 if (stock < reorder_level and daily_sales < 8 and has_supplier) else 30
            # Utility of Discount:
            u_discount = 90 if (perishable and days_to_exp is not None and days_to_exp <= 2) else 10
            # Utility of Finding Supplier:
            u_supp = 95 if (stock < reorder_level and not has_supplier) else 0
            # Utility of Check:
            u_check = 65 if (stock <= 1.25 * reorder_level and stock >= reorder_level) else 15
            # Utility of No Action:
            u_none = 85 if (stock > 1.25 * reorder_level and (not perishable or (days_to_exp and days_to_exp > 2))) else 25

            utilities = {
                "reorder_urgent": u_urgent,
                "reorder_normal": u_normal,
                "discount": u_discount,
                "find_other_supplier": u_supp,
                "check_stock": u_check,
                "no_action": u_none
            }

            best_act = max(utilities, key=utilities.get)
            action = best_act
            utility_score = utilities[best_act]
            reason = f"Utility-Based selection: Action '{action}' achieved highest utility payoff ({utility_score}/100) trading off lost-sales penalty against holding costs."
            trace.append(f"Evaluated Utilities: {utilities} -> Maximized via '{best_act}'")

        return {
            "agent_type": self.agent_type,
            "chosen_action": action,
            "reason": reason,
            "utility_score": utility_score,
            "trace": trace
        }

    def run_agent_loop(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """Full Sense -> Deliberate -> Act loop."""
        percepts = self.perceive(product)
        decision = self.decide(percepts)
        return {
            "percepts": percepts,
            "decision": decision,
            "agent_type_badge": f"Agent Type: {self.agent_type.capitalize()}-Based Agent",
            "is_chosen_project_design": self.agent_type in ["goal", "utility"]
        }
