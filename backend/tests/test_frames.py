"""
Automated Pytest Suite for Module 9: Frame Representation System
Tests:
- Default value inheritance (reorder_level 20)
- Single-point modification propagation (20 -> 30)
- If-needed demons computing status and fast moving
"""

import json
import os
import pytest
from backend.ai.knowledge.frames import FrameSystem


def load_test_data():
    base = os.path.join(os.path.dirname(__file__), "..", "data")
    with open(os.path.join(base, "frames.json"), "r", encoding="utf-8") as f:
        frames_data = json.load(f)
    with open(os.path.join(base, "products.json"), "r", encoding="utf-8") as f:
        products_data = json.load(f)
    return frames_data, products_data


def test_frame_slot_inheritance():
    frames_data, products_data = load_test_data()
    system = FrameSystem(frames_data, products_data)

    # P1 Milk1L inherits reorder_level 20 from Product class
    frame_p1 = system.inspect_product_frame("P1")
    slots = frame_p1["slots"]
    assert slots["reorder_level"]["value"] == 20
    assert slots["reorder_level"]["source"] == "inherited"

    # Perishable slots inherited
    assert slots["is_perishable"]["value"] is True
    assert slots["is_perishable"]["source"] == "inherited"


def test_frame_if_needed_demons():
    frames_data, products_data = load_test_data()
    system = FrameSystem(frames_data, products_data)

    frame_p1 = system.inspect_product_frame("P1")
    slots = frame_p1["slots"]
    
    # Milk1L stock=14 < 20, daily_sales=18 >= 8
    assert slots["status"]["value"] == "LOW_STOCK"
    assert slots["status"]["source"] == "computed"
    assert slots["is_fast_moving"]["value"] is True


def test_frame_single_point_default_mutation():
    """Modifying Product.reorder_level from 20 to 30 propagates to all inheriting instances."""
    frames_data, products_data = load_test_data()
    system = FrameSystem(frames_data, products_data)

    # Update class default
    success = system.update_class_default("Product", "reorder_level", 30)
    assert success is True

    # P1 should now have reorder_level = 30
    frame_p1 = system.inspect_product_frame("P1")
    assert frame_p1["slots"]["reorder_level"]["value"] == 30
