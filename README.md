# SmartStock AI – Recommendation Smart Inventory Management Platform
> **BTech CSE 2nd-Year Artificial Intelligence Course Project (CCSAI0301)**  
> **Institution:** NIET Greater Noida  
> **Team 80:** Rudra Pratap Rai, Satya Krishna Singh, Shantanu Bajpai, Satyam Jaiswal, Rituraj Agrahari  
> **Faculty Mentor:** Ms. Anjali Deshwal  
> **Milestone Progress:** 60% (Review 2 Synthesis) | **SDG Alignment:** SDG 9 (Industry, Innovation & Infrastructure)

---

## 🚀 One-Command Launch (Fully Offline)

The application starts with a single command and bundles all dependencies locally. No external APIs, no internet, and no CDNs are required.

### Windows:
Double-click or run from terminal:
```cmd
run.bat
```

### Mac / Linux:
```bash
chmod +x run.sh
./run.sh
```

**Local Host URL:**  
👉 **[http://localhost:8000](http://localhost:8000)** (or [http://127.0.0.1:8000](http://127.0.0.1:8000))  
Interactive Swagger API documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📌 Project Overview & Honesty Statement

Small retail grocers face severe challenges tracking stock replenishment, expiration decay, and supplier selection manually in spreadsheets. **SmartStock AI** replaces error-prone guesswork with formal AI search, planning, and knowledge-based deduction.

- **Sample Data Disclosure:** All demonstration data operates on a curated 12-SKU sample catalog with a total warehouse capacity of 400 units.
- **Rule R5 Addition:** Rule R5 (`¬L ∧ ¬N ∧ Stock ≤ 1.25×Reorder → CheckStock`) was formally introduced to match the empirical Review-2 finding of "3 visual audit checks".
- **Deterministic Execution:** All algorithms execute with fixed pseudo-random seeds (`seed=42`) ensuring deterministic, repeatable viva demonstrations.

---

## 📂 Project Directory Structure

```
smartstock-ai/
├── run.bat                         # Windows one-click launcher
├── run.sh                          # Mac/Linux one-click launcher
├── README.md                       # Setup, syllabus map & viva demo script
├── requirements.txt                # Python backend dependencies
├── backend/
│   ├── main.py                     # FastAPI app + static production build serving
│   ├── data/
│   │   ├── products.json           # 12-item sample grocery catalog
│   │   ├── suppliers.json          # Suppliers A, B, C, D details & lead times
│   │   ├── network.json            # Delivery graph, heuristics, AO* graph, TSP matrix
│   │   ├── baskets.json            # 10 market baskets for association mining
│   │   ├── negotiation_tree.json   # 27-leaf game tree (Depth 3, Branching 3)
│   │   ├── frames.json             # Frame hierarchy, default slots & demons
│   │   └── semantic_net.json       # Semantic network nodes and relational edges
│   ├── ai/
│   │   ├── agent.py                # M1: PEAS framework & Reflex/Model/Goal/Utility agents
│   │   ├── search_problem.py       # M2: Reorder state-space problem formulation (UCS)
│   │   ├── uninformed.py           # M3: BFS, DFS, IDS, Bidirectional search
│   │   ├── informed.py             # M3: Greedy Best-First, A*, AO*, Supplier Scoring
│   │   ├── csp.py                  # M4: Backtracking CSP with MRV & Forward Checking
│   │   ├── game_tree.py            # M5: Minimax and Alpha-Beta pruning
│   │   ├── classic_problems.py     # M6: Water Jug, Missionaries & Cannibals, STRIPS, 8-Tiles
│   │   ├── local_search.py         # M7: Shelf Allocation hill climbing & N-Queens
│   │   ├── tsp.py                  # M8: Restocking route TSP (120 permutations vs Nearest-Neighbour)
│   │   └── knowledge/
│   │       ├── propositional.py    # M9: Truth tables, gap analysis, inference rules
│   │       ├── fol.py              # M9: Robinson's unification with occurs-check, resolution
│   │       ├── chaining.py         # M9/10: Forward & Backward chaining inference engines
│   │       ├── frames.py           # M9: Frame inheritance & if-needed demons
│   │       ├── semantic_net.py     # M9: Graph traversal queries & association mining
│   │       ├── expert_system.py    # M10: Expert system orchestrator & festival heuristics
│   │       └── reasoning_types.py  # M9: Abductive inference mini-demo
│   ├── api/
│   │   └── routes.py               # Clean REST endpoints
│   └── tests/                      # Automated Pytest suite (27 tests)
└── frontend/                       # Vite + React 19 + TypeScript + Tailwind CSS
    ├── src/
    │   ├── pages/                  # 12 complete, interactive viva pages
    │   ├── components/             # StepControls, LogPanel, CodeDrawer, ProofTreeModal, GuidedDemoModal
    │   └── services/api.ts         # Typed API client
```

---

## 🗺️ Syllabus Map & Course Curriculum Alignment

| Module | Platform Page | AI Syllabus Topic | Report Section | Key Theoretical Concept |
|---|---|---|---|---|
| **M1** | `/` (Dashboard) | Intelligent Agents & PEAS | Report I §2 | Agent typologies (Reflex, Model, Goal, Utility); PEAS table |
| **M2** | `/reorder` | Search Problem Formulation | Report I §3 | Initial state, Actions, Goal test, Uniform-Cost Search (UCS) |
| **M3** | `/route` | Informed & Uninformed Search | Report I §4 | BFS, DFS, IDS, Bidirectional, A*, AO* on AND-OR graph, Heuristic Admissibility |
| **M4** | `/csp` | Constraint Satisfaction | Report I §5 | Backtracking, Forward Checking, Minimum Remaining Values (MRV) |
| **M5** | `/negotiation` | Adversarial Search & Games | Report I §6 | Minimax vs Alpha-Beta pruning, Two-player zero-sum game |
| **M6** | `/puzzles` | Classic AI Case Studies | Report II §1 | Water-Jug (6 moves), Cannibals (11 crossings), STRIPS, 8-Tiles A* |
| **M7** | `/shelf` | Local Search Optimization | Report II §2 | Hill climbing, Sideways moves, Plateau perturbation, N-Queens |
| **M8** | `/tsp` | Graph Traversal (TSP) | Report II §3 | Exhaustive 120 Hamiltonian cycles vs Nearest-Neighbour |
| **M9** | `/knowledge` | Knowledge Representation | Report II §4 | Truth tables, FOL Unification, Occurs-check, Resolution refutation, Frames, Semantic Nets |
| **M10** | `/expert-system` | Expert System Architecture | Report II §5 | 5-component architecture, Working Memory, Festival Season heuristic |
| **M11** | `/reports` | Review-2 Empirical Synthesis | Report II §6 | Live computed oracle metrics & Challenges & Fixes synthesis |
| **M12** | `/about` | Project & Team Metadata | Report I & II | Team credits, progress metrics (60%), research literature |

---

## 🎙️ 5-Minute Guided Viva Demo Script (For Student Presentation)

Use the interactive floating **"Guided Demo (5 Min)"** button in the top-right header to auto-navigate while reading these prompts to the examiner:

1. **Dashboard (`/`):**  
   *"Respected faculty, welcome to SmartStock AI. Here is our 12-item retail catalog. Clicking 'Run Agent Loop' invokes our Goal-Based intelligent agent loop, continuously monitoring stock drawdowns and recommending actions."*
2. **Reorder Search (`/reorder`):**  
   *"We formalize inventory replenishment into a 4-part state-space search problem. Using Uniform-Cost Search (UCS), the agent evaluates discrete batch orders to reach the safe buffer while minimizing 5-day holding costs."*
3. **Route Search (`/route`):**  
   *"On the regional delivery graph, A\* search uses an admissible and consistent straight-line heuristic $h(n)$ to find the optimal 17 km path from Supplier A. Simultaneously, AO\* solves split-order fulfillment for 60 units of Milk1L across regional warehouses, saving Rs 90."*
4. **Constraints (`/csp`):**  
   *"Here replenishment is governed by daily store budget, MOQ, and storage limits. Watch how Backtracking with MRV and Forward Checking immediately prunes illegal domain values when we tighten the budget."*
5. **Negotiation Game Tree (`/negotiation`):**  
   *"We model supplier negotiation as a two-player zero-sum game tree of depth 3 and 27 leaves. Alpha-Beta pruning evaluates only 16 of the 27 leaves while guaranteeing the exact same optimal outcome: 'Ask 10% discount' (value 80)."*
6. **Warehouse Puzzles (`/puzzles`):**  
   *"We mapped 4 classic AI case studies to warehouse tasks: Rack Transfer (Water Jug in 6 moves), Hazard Zone Transfer (Missionaries & Cannibals in 11 crossings without contamination), Restocking STRIPS Planning, and 8-Puzzle Shelf Rearrangement."*
7. **Shelf Allocation (`/shelf`):**  
   *"This local search arranges 10 shelf slots to prevent toxic chemical contamination. Starting from 4 adjacent hazard pairs, hill climbing with sideways plateau moves drives conflicts down to 0."*
8. **Restocking Route (`/tsp`):**  
   *"We evaluate all 5! = 120 Hamiltonian restocking routes. Exhaustive search establishes the global optimum of 24 km, which is matched 100% by the fast Nearest-Neighbour greedy heuristic."*
9. **Knowledge Base (`/knowledge`):**  
   *"Our logic tab displays truth tables proving rules R1 and R3 are mutually exclusive, closed truth-table gaps via Rule R4, Robinson's first-order unification with occurs-check, and resolution refutation deriving the empty clause $\Box$ for Milk1L."*
10. **Expert System (`/expert-system`):**  
    *"Here is our live 5-component Expert System architecture. Toggling 'Festival Season' boosts demand by 1.5x and raises safety buffers in the Product frame default, updating recommendations with full explainability."*
11. **Reports & Results (`/reports`):**  
    *"Finally, our Reports page dynamically computes all Review-2 milestone outputs from live data: exactly 11 conclusions, 6-move rack transfer, 0 shelf conflicts, and 24 km route, validating our 60% progress milestone."*

---

## 🧪 Automated Pytest Verification

Run all 27 automated test suites:
```bash
python -m pytest backend/tests/
```
All tests verify expected test oracles mathematically without mocks or hardcoding.
