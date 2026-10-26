"""
SmartStock AI - Module 9: First-Order Logic (FOL)
Topic: First-Order Logic, Unification with Occurs-Check, Resolution Refutation
Course: BTech CSE 2nd Year Artificial Intelligence (CCSAI0301)
Team 80: NIET Greater Noida

Implements:
1. First-Order representation: Predicates, Variables, Constants, Functions.
2. Unification Algorithm: Computes Most General Unifier (MGU) with occurs-check.
3. Resolution Refutation: Proves ReorderUrgent(Milk1L) by showing KB ∧ ¬Goal leads to contradiction (empty clause).
4. Quantifier comparison: FOL allows universal rules (∀x) over domains rather than combinatorial propositional explosions.
"""

from typing import Dict, List, Any, Optional, Union


# --- 1. UNIFICATION ALGORITHM ---

def is_variable(x: Any) -> bool:
    """Variables in our FOL system are lowercase single letters or start with '?' (e.g., 'x', 'y', '?item')"""
    return isinstance(x, str) and (len(x) == 1 and x.islower() or x.startswith("?"))


def is_compound(x: Any) -> bool:
    """Compound expression represented as a tuple/list: (operator, *args) or dict with op and args"""
    return isinstance(x, (list, tuple)) and len(x) > 0


def occurs_check(var: str, x: Any) -> bool:
    """
    Occurs Check: Returns True if variable `var` occurs anywhere inside expression `x`.
    Crucial for sound unification to prevent infinite cyclic terms like x = f(x).
    """
    if var == x:
        return True
    elif is_compound(x):
        return any(occurs_check(var, arg) for arg in x[1:])
    return False


def apply_subst(theta: Dict[str, Any], x: Any) -> Any:
    """Recursively replaces variables in `x` according to substitution dictionary `theta`."""
    if is_variable(x):
        return theta.get(x, x)
    elif is_compound(x):
        return [x[0]] + [apply_subst(theta, arg) for arg in x[1:]]
    return x


def unify_terms(x: Any, y: Any, theta: Optional[Dict[str, Any]] = None, trace: Optional[List[str]] = None) -> Optional[Dict[str, Any]]:
    """
    Robinsons First-Order Unification Algorithm with Occurs-Check.
    Finds the Most General Unifier (MGU) θ such that Subst(θ, x) == Subst(θ, y).
    """
    if theta is None:
        theta = {}
    if trace is None:
        trace = []

    if theta is False or theta is None:
        return None

    # Apply existing substitutions
    x = apply_subst(theta, x)
    y = apply_subst(theta, y)

    trace.append(f"Unifying: {x} with {y} | Current θ = {theta}")

    if x == y:
        trace.append(f"  -> Identical terms '{x}', no new binding.")
        return theta

    elif is_variable(x):
        trace.append(f"  -> Variable '{x}' bound to '{y}'")
        return unify_var(x, y, theta, trace)

    elif is_variable(y):
        trace.append(f"  -> Variable '{y}' bound to '{x}'")
        return unify_var(y, x, theta, trace)

    elif is_compound(x) and is_compound(y):
        if x[0] != y[0] or len(x) != len(y):
            trace.append(f"  -> Mismatch in operator or arity: {x[0]}/{len(x)-1} vs {y[0]}/{len(y)-1}. Unification FAIL.")
            return None
        
        # Unify arguments sequentially
        for arg_x, arg_y in zip(x[1:], y[1:]):
            theta = unify_terms(arg_x, arg_y, theta, trace)
            if theta is None:
                return None
        return theta

    else:
        trace.append(f"  -> Constants mismatch: '{x}' != '{y}'. Unification FAIL.")
        return None


def unify_var(var: str, x: Any, theta: Dict[str, Any], trace: List[str]) -> Optional[Dict[str, Any]]:
    """Binds variable `var` to `x`, performing occurs-check."""
    if var in theta:
        return unify_terms(theta[var], x, theta, trace)
    elif is_variable(x) and x in theta:
        return unify_terms(var, theta[x], theta, trace)
    elif occurs_check(var, x):
        trace.append(f"  -> Occurs-Check FAIL: variable '{var}' occurs inside '{x}'! (Cycle prevented)")
        return None
    else:
        new_theta = dict(theta)
        new_theta[var] = x
        return new_theta


def run_unification_demo(term1: Union[str, List], term2: Union[str, List]) -> Dict[str, Any]:
    """Runs unification on user input terms and returns MGU and detailed steps."""
    trace: List[str] = []
    
    # Example default terms if none provided:
    # term1: ["Reorder", "x", "Bread"]
    # term2: ["Reorder", "Milk1L", "y"]
    mgu = unify_terms(term1, term2, {}, trace)
    
    return {
        "term1": term1,
        "term2": term2,
        "success": mgu is not None,
        "mgu": mgu if mgu is not None else {},
        "trace": trace,
        "formatted_result": ", ".join(f"{k}/{v}" for k, v in mgu.items()) if mgu else "FAILURE (Cannot unify)"
    }


# --- 2. RESOLUTION REFUTATION ---

def run_resolution_refutation_milk() -> Dict[str, Any]:
    """
    Step-by-step First-Order Resolution Refutation to prove:
    Goal: ReorderUrgent(Milk1L)

    Knowledge Base (in Clause Normal Form / CNF):
      C1: ¬LowStock(x) ∨ ¬FastMoving(x) ∨ ¬SuppliedBy(x, y) ∨ ¬Available(y) ∨ ReorderUrgent(x)  [Universal Rule]
      C2: LowStock(Milk1L)                                                                      [Fact]
      C3: FastMoving(Milk1L)                                                                    [Fact]
      C4: SuppliedBy(Milk1L, SupplierA)                                                         [Fact]
      C5: Available(SupplierA)                                                                  [Fact]

    Negated Goal (for Proof by Refutation):
      C6: ¬ReorderUrgent(Milk1L)                                                                [Negated Goal]

    Steps:
      1. Resolve C1 with C6: Unify x = Milk1L.
         Resolvent R1: ¬LowStock(Milk1L) ∨ ¬FastMoving(Milk1L) ∨ ¬SuppliedBy(Milk1L, y) ∨ ¬Available(y)
      2. Resolve R1 with C2 (LowStock):
         Resolvent R2: ¬FastMoving(Milk1L) ∨ ¬SuppliedBy(Milk1L, y) ∨ ¬Available(y)
      3. Resolve R2 with C3 (FastMoving):
         Resolvent R3: ¬SuppliedBy(Milk1L, y) ∨ ¬Available(y)
      4. Resolve R3 with C4 (SuppliedBy): Unify y = SupplierA.
         Resolvent R4: ¬Available(SupplierA)
      5. Resolve R4 with C5 (Available):
         Resolvent R5: □ (EMPTY CLAUSE / CONTRADICTION)

    Conclusion: Since KB ∧ ¬Goal derives □, the negated goal is unsatisfiable.
    Therefore, ReorderUrgent(Milk1L) is PROVEN by Refutation.
    """
    clauses = [
        {"id": "C1", "type": "Axiom (Rule R1 in CNF)", "clause": "¬LowStock(x) ∨ ¬FastMoving(x) ∨ ¬SuppliedBy(x,y) ∨ ¬Available(y) ∨ ReorderUrgent(x)"},
        {"id": "C2", "type": "Fact", "clause": "LowStock(Milk1L)"},
        {"id": "C3", "type": "Fact", "clause": "FastMoving(Milk1L)"},
        {"id": "C4", "type": "Fact", "clause": "SuppliedBy(Milk1L, SupplierA)"},
        {"id": "C5", "type": "Fact", "clause": "Available(SupplierA)"},
        {"id": "C6", "type": "Negated Goal (¬G)", "clause": "¬ReorderUrgent(Milk1L)"}
    ]

    steps = [
        {
            "step": 1,
            "parent1": "C1",
            "parent2": "C6",
            "unifier": "{x / Milk1L}",
            "resolvent": "¬LowStock(Milk1L) ∨ ¬FastMoving(Milk1L) ∨ ¬SuppliedBy(Milk1L, y) ∨ ¬Available(y)",
            "explanation": "Resolved ReorderUrgent(x) against ¬ReorderUrgent(Milk1L) with x = Milk1L"
        },
        {
            "step": 2,
            "parent1": "Step 1 Resolvent",
            "parent2": "C2",
            "unifier": "{}",
            "resolvent": "¬FastMoving(Milk1L) ∨ ¬SuppliedBy(Milk1L, y) ∨ ¬Available(y)",
            "explanation": "Resolved ¬LowStock(Milk1L) against LowStock(Milk1L)"
        },
        {
            "step": 3,
            "parent1": "Step 2 Resolvent",
            "parent2": "C3",
            "unifier": "{}",
            "resolvent": "¬SuppliedBy(Milk1L, y) ∨ ¬Available(y)",
            "explanation": "Resolved ¬FastMoving(Milk1L) against FastMoving(Milk1L)"
        },
        {
            "step": 4,
            "parent1": "Step 3 Resolvent",
            "parent2": "C4",
            "unifier": "{y / SupplierA}",
            "resolvent": "¬Available(SupplierA)",
            "explanation": "Resolved ¬SuppliedBy(Milk1L, y) against SuppliedBy(Milk1L, SupplierA) with y = SupplierA"
        },
        {
            "step": 5,
            "parent1": "Step 4 Resolvent",
            "parent2": "C5",
            "unifier": "{}",
            "resolvent": "□ (Contradiction / Empty Clause)",
            "explanation": "Resolved ¬Available(SupplierA) against Available(SupplierA). Empty clause derived!"
        }
    ]

    return {
        "goal": "ReorderUrgent(Milk1L)",
        "clauses": clauses,
        "steps": steps,
        "proved": True,
        "conclusion": "Derivation of the empty clause (□) proves that KB ∧ ¬ReorderUrgent(Milk1L) is inconsistent. Hence, ReorderUrgent(Milk1L) is logically entailed by the knowledge base."
    }


def get_fol_quantifier_comparison() -> Dict[str, Any]:
    """Explains why First-Order Logic is needed for group rules rather than Propositional logic."""
    return {
        "title": "Why First-Order Logic for Supply Chains?",
        "propositional_drawback": "In Propositional Logic, we must write a separate rule for EVERY product and supplier combination: 'LowStock_Milk1L ^ Fast_Milk1L -> Reorder_Milk1L', 'LowStock_Bread ^ ...', leading to 12 x 4 = 48 separate rules for just 12 products. Adding 100 new products requires writing 400 new rules.",
        "fol_advantage": "In First-Order Logic, a SINGLE universal rule with quantifiers covers ALL current and future inventory items: ∀x ∀y (Product(x) ∧ LowStock(x) ∧ FastMoving(x) ∧ SuppliedBy(x, y) ∧ Available(y) → ReorderUrgent(x)).",
        "existential_example": "∃x (Perishable(x) ∧ NearExpiry(x)) — 'There exists at least one perishable item nearing its expiry date requiring immediate discounting.'",
        "predicate_glossary": [
            {"predicate": "Product(x)", "meaning": "x is an inventory product item"},
            {"predicate": "Perishable(x)", "meaning": "x has a perishable shelf-life"},
            {"predicate": "LowStock(x)", "meaning": "x current stock < safety reorder threshold"},
            {"predicate": "FastMoving(x)", "meaning": "x has daily sales velocity >= 8 units"},
            {"predicate": "SuppliedBy(x, y)", "meaning": "supplier y provides product x"},
            {"predicate": "Available(y)", "meaning": "supplier y is open and taking orders"},
            {"predicate": "Incompatible(c1, c2)", "meaning": "category c1 cannot be stacked next to c2 on warehouse shelves"}
        ]
    }
