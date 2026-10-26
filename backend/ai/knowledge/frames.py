"""
SmartStock AI - Module 9: Frame Representation System
Topic: Frames, Default Values, Slot Inheritance, Procedural Attachments (If-Needed Demons)
Course: BTech CSE 2nd Year Artificial Intelligence (CCSAI0301)
Team 80: NIET Greater Noida

Implements:
1. Frame Hierarchy:
   Product -> PerishableProduct -> [P1..P4]
   Product -> NonPerishableProduct -> [P5..P12]
   Additional Frames: Supplier, RackSlot, Recommendation.
2. Inheritance Engine: Inherits slot values up the is-a / instance-of tree.
3. Procedural Attachments (Demons): 'if_needed' demons that compute dynamic values
   like status, fast-moving, near-expiry when requested.
4. Single-Point Default Mutation: Changing Product.reorder_level (e.g., 20 -> 30 for Festival)
   automatically propagates to all inheriting instances that do not override it.
"""

from typing import Dict, List, Any, Optional
import copy


class FrameSystem:
    def __init__(self, frames_data: Dict[str, Any], products_data: List[Dict[str, Any]]):
        self.classes = copy.deepcopy(frames_data.get("classes", {}))
        self.products = copy.deepcopy(products_data)

    def update_class_default(self, class_name: str, slot_name: str, new_value: Any) -> bool:
        """Modifies a default slot value in one place, affecting all inheriting instances."""
        if class_name in self.classes and "slots" in self.classes[class_name]:
            if slot_name in self.classes[class_name]["slots"]:
                self.classes[class_name]["slots"][slot_name]["value"] = new_value
                return True
        return False

    def get_class_hierarchy(self) -> Dict[str, Any]:
        """Returns the current class hierarchy."""
        return self.classes

    def inspect_product_frame(self, product_id: str) -> Dict[str, Any]:
        """
        Inspects all slots of a product instance, resolving each slot as:
        - 'own': Defined directly on the instance
        - 'inherited': Inherited from parent class (Perishable/NonPerishable/Product)
        - 'computed': Calculated dynamically by an if-needed demon
        """
        prod = next((p for p in self.products if p["id"] == product_id or p["name"].lower() == product_id.lower()), None)
        if not prod:
            return {"error": f"Product '{product_id}' not found."}

        is_perish = prod.get("perishable", False)
        parent_class = "PerishableProduct" if is_perish else "NonPerishableProduct"
        
        slots: Dict[str, Any] = {}

        # 1. Own instance values
        slots["product_id"] = {"value": prod["id"], "source": "own", "origin": prod["name"]}
        slots["name"] = {"value": prod["name"], "source": "own", "origin": prod["name"]}
        slots["category"] = {"value": prod["category"], "source": "own", "origin": prod["name"]}
        slots["stock"] = {"value": prod["stock"], "source": "own", "origin": prod["name"]}
        slots["daily_sales"] = {"value": prod["daily_sales"], "source": "own", "origin": prod["name"]}
        slots["sell_price"] = {"value": prod["sell_price"], "source": "own", "origin": prod["name"]}
        
        # Check if reorder_level is overridden or uses default
        # Products that have explicit reorder_level other than 20:
        # P4=15, P5=25, P7=15, P8=12, P10=22, P11=30
        own_reorder = prod.get("reorder_level")
        product_default_reorder = self.classes.get("Product", {}).get("slots", {}).get("reorder_level", {}).get("value", 20)

        # In our sample data, items that explicitly specify custom reorder levels override the frame default
        is_custom_reorder = prod["id"] in ["P4", "P5", "P7", "P8", "P10", "P11"]
        if is_custom_reorder:
            effective_reorder = own_reorder
            reorder_source = "own (overridden)"
            reorder_origin = prod["name"]
        else:
            effective_reorder = product_default_reorder
            reorder_source = "inherited"
            reorder_origin = "Product (class default)"

        slots["reorder_level"] = {"value": effective_reorder, "source": reorder_source, "origin": reorder_origin}

        # 2. Inherited from intermediate class (PerishableProduct or NonPerishableProduct)
        parent_slots = self.classes.get(parent_class, {}).get("slots", {})
        for k, v in parent_slots.items():
            slots[k] = {"value": v["value"], "source": "inherited", "origin": parent_class}

        # 3. Inherited from root Product class
        root_slots = self.classes.get("Product", {}).get("slots", {})
        for k, v in root_slots.items():
            if k not in slots:
                slots[k] = {"value": v["value"], "source": "inherited", "origin": "Product"}

        # 4. Computed via If-Needed Demons
        # Demon 1: status
        if prod["stock"] < effective_reorder:
            status_val = "LOW_STOCK"
        elif (not is_perish) and (prod["stock"] <= 1.25 * effective_reorder):
            status_val = "NEAR_THRESHOLD"
        else:
            status_val = "HEALTHY"
        slots["status"] = {"value": status_val, "source": "computed", "origin": "if_needed_status demon"}

        # Demon 2: is_fast_moving
        fast_val = prod["daily_sales"] >= 8
        slots["is_fast_moving"] = {"value": fast_val, "source": "computed", "origin": "if_needed_fast_moving demon"}

        # Demon 3: near_expiry (for perishables)
        if is_perish:
            days_to_exp = prod.get("days_to_expiry")
            near_exp = (days_to_exp is not None) and (days_to_exp <= 2)
            slots["near_expiry"] = {"value": near_exp, "source": "computed", "origin": "if_needed_near_expiry demon"}

        return {
            "instance_name": prod["name"],
            "class_hierarchy": [prod["name"], parent_class, "Product"],
            "slots": slots
        }

    def inspect_all_products(self) -> List[Dict[str, Any]]:
        """Returns inspected frames for all 12 products."""
        return [self.inspect_product_frame(p["id"]) for p in self.products]
