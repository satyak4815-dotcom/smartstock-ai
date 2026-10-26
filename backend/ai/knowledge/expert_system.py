"""
SmartStock AI - Module 10: Expert System Orchestrator
Topic: Expert System Architecture, Working Memory, Forward/Backward Chaining, Festival Heuristic, Explanation Facility
Course: BTech CSE 2nd Year Artificial Intelligence (CCSAI0301)
Team 80: NIET Greater Noida

Architecture Components:
1. Knowledge Base: Rules R1-R5, Domain Constraints, Class Frames.
2. Working Memory: Today's current stock sheet (12 products).
3. Inference Engine: Forward Chaining for daily recommendations, Backward Chaining for proof trees.
4. Explanation Facility: Generates natural language justification and backward-chaining proof traces.
5. User Interface: Shop-owner dashboard with editable inventory rows.
"""

from typing import Dict, List, Any
import copy
from .chaining import run_forward_chaining, run_backward_chaining


class ExpertSystem:
    def __init__(self, products_data: List[Dict[str, Any]], suppliers_data: List[Dict[str, Any]]):
        self.base_products = copy.deepcopy(products_data)
        self.working_memory_products = copy.deepcopy(products_data)
        self.suppliers = copy.deepcopy(suppliers_data)
        self.festival_season = False

    def set_festival_season(self, enabled: bool):
        """Global Festival Season toggle."""
        self.festival_season = enabled

    def update_product_in_memory(self, product_id: str, updates: Dict[str, Any]) -> bool:
        """Allows store manager to update stock/sales/price in Working Memory."""
        for p in self.working_memory_products:
            if p["id"] == product_id:
                p.update(updates)
                return True
        return False

    def reset_working_memory(self):
        """Resets working memory back to original sample data."""
        self.working_memory_products = copy.deepcopy(self.base_products)

    def run_inference(self) -> Dict[str, Any]:
        """
        Runs the Forward Chaining inference engine on current working memory.
        Returns grouped recommendations, active architecture highlights, and summary counts.
        """
        chaining_result = run_forward_chaining(self.working_memory_products, festival_season=self.festival_season)

        # Structure recommendations by action group
        grouped = {
            "reorder_urgent": [],
            "reorder_normal": [],
            "discount": [],
            "find_other_supplier": [],
            "check_stock": [],
            "no_action": []
        }

        for item in chaining_result["agenda"]:
            action = item["action"]
            if action in grouped:
                grouped[action].append(item)

        architecture_state = {
            "active_component": "Inference Engine (Forward Chaining)",
            "rules_evaluated": 5,
            "facts_in_memory": len(self.working_memory_products),
            "conclusions_derived": chaining_result["total_conclusions"]
        }

        return {
            "festival_season": self.festival_season,
            "architecture_state": architecture_state,
            "summary_counts": chaining_result["counts"],
            "total_conclusions": chaining_result["total_conclusions"],
            "grouped_recommendations": grouped,
            "agenda": chaining_result["agenda"],
            "conclusions": chaining_result["conclusions"]
        }

    def explain_recommendation(self, product_id: str, action_goal: str) -> Dict[str, Any]:
        """
        Explanation Facility:
        Uses Backward Chaining to prove why an action was recommended (or why it was NOT).
        """
        proof = run_backward_chaining(product_id, action_goal, self.working_memory_products, festival_season=self.festival_season)
        return {
            "product_id": product_id,
            "goal": action_goal,
            "proof_tree": proof,
            "explanation": proof.get("explanation", ""),
            "confidence": "Medium (Sample Data Cap)"
        }
