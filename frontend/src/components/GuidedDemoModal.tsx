import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, ChevronLeft, X, Volume2 } from "lucide-react";

export interface DemoStop {
  route: string;
  title: string;
  topic: string;
  script: string;
}

export const DEMO_STOPS: DemoStop[] = [
  {
    route: "/",
    title: "1. Store Dashboard & Agent Overview",
    topic: "Module 1: Intelligent Agents & PEAS",
    script: "Respected faculty, welcome to SmartStock AI. This dashboard tracks our 12-item sample store. Let's click 'Run Agent' to invoke our Goal-Based intelligent agent loop across all inventory items."
  },
  {
    route: "/reorder",
    title: "2. Reorder as a Search Problem",
    topic: "Module 2: State Space & Uniform-Cost Search",
    script: "Here we formulate inventory reordering as a formal search problem: discrete order actions transition stock into a safe buffer, solved using Uniform-Cost Search (UCS) balancing batch unit cost and 5-day holding fees."
  },
  {
    route: "/route",
    title: "3. Delivery Route & Informed Search",
    topic: "Module 3: A*, AO* & Heuristic Admissibility",
    script: "Here we demonstrate A* search on the regional delivery network. Notice our heuristic h is admissible and consistent, yielding optimal path cost 17 km from Supplier A, while AO* solves split procurement for 60 units of Milk1L."
  },
  {
    route: "/csp",
    title: "4. Constraint Satisfaction (CSP)",
    topic: "Module 4: Backtracking with MRV & Forward Checking",
    script: "In this module, replenishment quantities are constrained by daily store budget, MOQ, and warehouse capacity. Watch forward checking prune impossible assignments when we tighten the budget."
  },
  {
    route: "/negotiation",
    title: "5. Supplier Negotiation Game Tree",
    topic: "Module 5: Minimax & Alpha-Beta Pruning",
    script: "This 27-leaf game tree models Platform vs Supplier negotiation. Notice that Alpha-Beta evaluates only 16 leaves out of 27 while arriving at the exact same optimal decision: 'Ask 10% discount' (value 80)."
  },
  {
    route: "/puzzles",
    title: "6. Warehouse Operations Puzzles",
    topic: "Module 6: Classic AI Problem Case Studies",
    script: "We mapped 4 classic AI case studies to warehouse tasks: Rack Transfer (Water Jug in 6 moves), Hazard Zone Transfer (Missionaries & Cannibals in 11 crossings), Restocking STRIPS Planning, and 8-Puzzle Shelf Rearrangement."
  },
  {
    route: "/shelf",
    title: "7. Shelf Allocation Local Search",
    topic: "Module 7: Hill Climbing (N-Queens Analogue)",
    script: "This local search optimizes 10 shelf slots by minimising contamination risk (perishables next to cleaning items). Starting from 4 hazard conflicts, hill climbing with random perturbations drives conflicts down to 0."
  },
  {
    route: "/tsp",
    title: "8. Restocking Route (TSP)",
    topic: "Module 8: Travelling Salesperson Problem",
    script: "Here we evaluate all 120 Hamiltonian cycles across drop points S1 to S5. The exhaustive search reveals a global minimum of 24 km, which is perfectly matched by the greedy Nearest-Neighbour heuristic."
  },
  {
    route: "/knowledge",
    title: "9. Knowledge Base & Formal Logic",
    topic: "Module 9: Propositional, FOL, Frames & Semantic Net",
    script: "Here is our complete knowledge base: truth-table analysis discovered the unhandled gap for Eggs (closed by Rule R4), Robinson's unification with occurs-check, resolution refutation, and frame inheritance."
  },
  {
    route: "/expert-system",
    title: "10. Expert System & Festival Heuristic",
    topic: "Module 10: Expert System Architecture",
    script: "This is our live Expert System architecture. Toggling 'Festival Season' boosts demand by 1.5x and raises safety buffers via the Product frame default, updating recommendations with full explainability."
  },
  {
    route: "/reports",
    title: "11. Results Summary & Progress",
    topic: "Module 11 & 12: Review 2 Synthesis",
    script: "Finally, our Reports page displays all Review 2 metrics computed live from the sample data: exactly 11 conclusions, 6-move rack transfer, 0 shelf conflicts, and 24 km route, completing our 60% project milestone."
  }
];

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStopIndex: number;
  onNavigateStop: (index: number) => void;
}

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({
  isOpen,
  onClose,
  currentStopIndex,
  onNavigateStop,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const currentStop = DEMO_STOPS[currentStopIndex];

  const handleNext = () => {
    if (currentStopIndex < DEMO_STOPS.length - 1) {
      const nextIdx = currentStopIndex + 1;
      onNavigateStop(nextIdx);
      navigate(DEMO_STOPS[nextIdx].route);
    }
  };

  const handlePrev = () => {
    if (currentStopIndex > 0) {
      const prevIdx = currentStopIndex - 1;
      onNavigateStop(prevIdx);
      navigate(DEMO_STOPS[prevIdx].route);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-lg w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-blue-500/40 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="font-bold text-xs uppercase tracking-wider text-blue-100">
            Guided Viva Demo Mode ({currentStopIndex + 1}/{DEMO_STOPS.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-blue-600/40 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="text-xs text-blue-400 font-semibold">{currentStop.topic}</div>
          <div className="text-base font-bold text-slate-100">{currentStop.title}</div>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-start gap-2.5">
          <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-200 leading-relaxed font-sans">
            <span className="text-emerald-400 font-semibold block mb-0.5">Speaking Script for Viva:</span>
            "{currentStop.script}"
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handlePrev}
            disabled={currentStopIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg text-xs font-medium transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1">
            {DEMO_STOPS.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentStopIndex ? "bg-blue-400 w-3" : "bg-slate-700"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStopIndex === DEMO_STOPS.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition shadow"
          >
            <span>Next Stop</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
