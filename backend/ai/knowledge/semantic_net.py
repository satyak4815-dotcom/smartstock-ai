"""
SmartStock AI - Module 9: Semantic Network Knowledge Representation
Topic: Semantic Networks, Graph Traversal, Inheritance Queries, Association Rule Mining
Course: BTech CSE 2nd Year Artificial Intelligence (CCSAI0301)
Team 80: NIET Greater Noida

Implements:
1. Graph Representation: nodes (class, instance, category, supplier, warehouse)
   and edges (is-a, belongs-to, stocks, supplied-by, bought-with, substitute-for, incompatible-with).
2. Traversal & Inheritance Query Engine:
   - "Is Milk1L perishable?" (traces is-a edge to PerishableProduct)
   - "Which products does Supplier A supply?" (traces supplied-by reverse links)
   - "What can't share a rack with Cleaning?" (traces incompatible-with to Dairy & Bakery items)
3. Association Mining (Induction from Baskets): Computes support and confidence for bought-together pairs.
4. Semantic Network vs Frame comparison.
"""

from typing import Dict, List, Any, Optional
from collections import defaultdict


def query_semantic_network(query_type: str, param: str, net_data: Dict[str, Any], products_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Answers natural knowledge queries by graph traversal, returning the answer and
    the list of node IDs forming the traversal path (for UI highlighting).
    """
    nodes = {n["id"]: n for n in net_data.get("nodes", [])}
    links = net_data.get("links", [])

    if query_type == "is_perishable":
        # Find product node
        prod_id = param
        prod_node = nodes.get(prod_id)
        if not prod_node:
            # Try finding by label
            prod_node = next((n for n in nodes.values() if n["label"].lower() == param.lower()), None)
        
        if not prod_node:
            return {"answer": f"Unknown product '{param}'", "path": []}

        # Follow is-a link
        path = [prod_node["id"]]
        is_perish = False
        explanation = ""

        # Check direct is-a
        for link in links:
            if link["source"] == prod_node["id"] and link["relation"] == "is-a":
                target = link["target"]
                path.append(target)
                if target == "PerishableProduct":
                    is_perish = True
                    explanation = f"Yes, '{prod_node['label']}' is perishable because it has an 'is-a' link to 'PerishableProduct'."
                    break
                elif target == "NonPerishableProduct":
                    is_perish = False
                    explanation = f"No, '{prod_node['label']}' is non-perishable because it has an 'is-a' link to 'NonPerishableProduct'."
                    break

        return {
            "query": f"Is {prod_node['label']} perishable?",
            "is_perishable": is_perish,
            "answer": explanation,
            "highlighted_nodes": path,
            "highlighted_edges": [{"source": path[i], "target": path[i+1]} for i in range(len(path)-1)]
        }

    elif query_type == "supplier_products":
        # e.g., "Supp_A" or "A"
        supp_id = param if param.startswith("Supp_") else f"Supp_{param}"
        supp_node = nodes.get(supp_id)
        if not supp_node:
            return {"answer": f"Supplier '{param}' not found.", "path": []}

        supplied_products = []
        path_nodes = [supp_node["id"]]
        path_edges = []

        for link in links:
            if link["target"] == supp_node["id"] and link["relation"] == "supplied-by":
                prod_id = link["source"]
                p_label = nodes.get(prod_id, {}).get("label", prod_id)
                supplied_products.append(p_label)
                path_nodes.append(prod_id)
                path_edges.append({"source": prod_id, "target": supp_node["id"]})

        return {
            "query": f"Which products does {supp_node['label']} supply?",
            "products": supplied_products,
            "answer": f"{supp_node['label']} supplies: {', '.join(supplied_products)}." if supplied_products else "Supplies none.",
            "highlighted_nodes": path_nodes,
            "highlighted_edges": path_edges
        }

    elif query_type == "incompatible_with_cleaning":
        # Find categories incompatible with Cat_Cleaning
        path_nodes = ["Cat_Cleaning"]
        path_edges = []
        incompatible_cats = []

        for link in links:
            if (link["source"] == "Cat_Cleaning" or link["target"] == "Cat_Cleaning") and link["relation"] == "incompatible-with":
                other = link["target"] if link["source"] == "Cat_Cleaning" else link["source"]
                incompatible_cats.append(other)
                path_nodes.append(other)
                path_edges.append({"source": link["source"], "target": link["target"]})

        # Find all products belonging to these categories
        incompatible_prods = []
        for link in links:
            if link["relation"] == "belongs-to" and link["target"] in incompatible_cats:
                p_id = link["source"]
                p_name = nodes.get(p_id, {}).get("label", p_id)
                incompatible_prods.append(f"{p_name} ({nodes[link['target']]['label']})")
                path_nodes.append(p_id)
                path_edges.append({"source": p_id, "target": link["target"]})

        return {
            "query": "What products cannot share a shelf rack with Cleaning products?",
            "incompatible_categories": [nodes[c]["label"] for c in incompatible_cats],
            "incompatible_products": incompatible_prods,
            "answer": f"Cleaning items cause contamination hazard. Incompatible with: {', '.join(incompatible_prods)}.",
            "highlighted_nodes": path_nodes,
            "highlighted_edges": path_edges
        }

    return {"error": f"Unknown query type: {query_type}"}


def mine_basket_associations(baskets: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Induction from observations:
    Mines frequency and association rules (bought-with) across customer baskets.
    Calculates Support and Confidence for pairs.
    """
    total_baskets = len(baskets)
    item_counts = defaultdict(int)
    pair_counts = defaultdict(int)

    for b in baskets:
        items = sorted(list(set(b["items"])))
        for item in items:
            item_counts[item] += 1
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                pair = (items[i], items[j])
                pair_counts[pair] += 1

    associations = []
    for (item1, item2), count in pair_counts.items():
        support = count / total_baskets
        # Confidence item1 -> item2
        conf_1_to_2 = count / item_counts[item1]
        # Confidence item2 -> item1
        conf_2_to_1 = count / item_counts[item2]

        associations.append({
            "item_a": item1,
            "item_b": item2,
            "count": count,
            "support": f"{count}/{total_baskets} ({support*100:.0f}%)",
            "support_val": support,
            "confidence_a_to_b": f"{conf_1_to_2*100:.1f}%",
            "confidence_b_to_a": f"{conf_2_to_1*100:.1f}%",
            "rule": f"{item1} => {item2}" if conf_1_to_2 >= conf_2_to_1 else f"{item2} => {item1}"
        })

    # Sort by support descending
    associations.sort(key=lambda x: x["support_val"], reverse=True)

    return {
        "total_baskets": total_baskets,
        "rules": associations,
        "top_rule": associations[0] if associations else None,
        "method": "Inductive Learning (Planned in report; basic association mining implemented)"
    }


def get_network_vs_frame_comparison() -> List[Dict[str, str]]:
    """Table comparison between Semantic Networks and Frame Systems."""
    return [
        {
            "dimension": "Primary Focus",
            "semantic_net": "Associative relationships & global graph topology (links between disparate entities)",
            "frames": "Structured object-oriented record grouping (slots, constraints, and defaults per entity)"
        },
        {
            "dimension": "Inheritance Mechanism",
            "semantic_net": "Graph path traversal following 'is-a' and 'belongs-to' edge pointers",
            "frames": "Hierarchical slot lookup with single-point default inheritance"
        },
        {
            "dimension": "Procedural Attachments",
            "semantic_net": "Difficult to attach code demons directly to graph vertices",
            "frames": "Native support for demons: if-needed, if-added, if-removed procedures"
        },
        {
            "dimension": "Use in SmartStock AI",
            "semantic_net": "Visualising store cross-category incompatibilities & supplier links",
            "frames": "Dynamic slot calculation (near_expiry demon) & seasonal threshold overrides"
        }
    ]
