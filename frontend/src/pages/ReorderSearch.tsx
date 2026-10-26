import React, { useState, useEffect } from "react";
import { Search, CheckCircle, ArrowRight, DollarSign, Layers } from "lucide-react";
import { api } from "../services/api";
import { StepControls } from "../components/StepControls";
import { LogPanel } from "../components/LogPanel";
import { CodeDrawer } from "../components/CodeDrawer";

export const ReorderSearch: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("P1");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(600);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    api.getProducts().then((data) => {
      setProducts(data);
    });
  }, []);

  const runSearch = async (pId: string) => {
    setLoading(true);
    try {
      const res = await api.searchReorder(pId);
      setSearchResult(res);
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch(selectedProductId);
  }, [selectedProductId]);

  // Animation player
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && searchResult && currentStep < searchResult.steps.length) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speedMs);
    } else if (currentStep >= (searchResult?.steps.length || 0)) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, searchResult, speedMs]);

  const handleStep = () => {
    if (searchResult && currentStep < searchResult.steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const currentStepData = searchResult?.steps?.[Math.max(0, currentStep - 1)];
  const logs = searchResult?.steps?.slice(0, currentStep).map((s: any) => s.log) || [];

  const pythonUCSCode = `def solve_reorder_search_ucs(product, total_warehouse_stock=150):
    initial_stock = product["stock"]
    reorder_level = product["reorder_level"]
    unit_cost = product["suppliers"][0]["cost"] if product.get("suppliers") else 50
    capacity_limit = 400
    
    min_goal_stock = reorder_level + 10
    max_goal_stock = reorder_level + 50
    available_actions = [0, 10, 20, 30, 40, 50]

    # Priority queue stores tuples: (cumulative_cost, node_id, state_stock, path, action)
    frontier = []
    heapq.heappush(frontier, (0.0, 0, initial_stock, [], None))
    explored = set()

    while frontier:
        cost, n_id, current_stock, path, last_action = heapq.heappop(frontier)
        
        # Goal Test: Inside safe buffer [reorder_level + 10, reorder_level + 50]
        if min_goal_stock <= current_stock <= max_goal_stock:
            return {
                "order_qty": last_action or 0,
                "total_cost": cost,
                "path": path + [{"stock": current_stock, "action": last_action, "cost": cost}]
            }

        explored.add(current_stock)

        for action in available_actions:
            next_stock = current_stock + action
            if (total_warehouse_stock - current_stock) + next_stock > capacity_limit:
                continue

            order_cost = (unit_cost * action + 100) if action > 0 else 0
            holding_cost = 0.5 * 5 * next_stock  # 5-day horizon
            new_cost = cost + order_cost + holding_cost
            heapq.heappush(frontier, (new_cost, n_id + 1, next_stock, path, action))`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Concept: State-Space Formulation &amp; Uniform-Cost Search (UCS)
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Reorder Decision as a Formal Search Problem</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Formulating replenishment as state transitions over discrete MOQ batches to achieve safe buffer bounds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Select SKU:</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.name} (Stock: {p.stock}, Threshold: {p.reorder_level})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4-Part Problem Definition Card */}
      {searchResult && (
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
            <Layers className="w-4 h-4" />
            <span>4-Part AI Problem Formulation (Russell &amp; Norvig Standard)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-blue-400 font-bold block mb-1">1. Initial State:</span>
              <p className="text-slate-300">{searchResult.problem_formulation.initial_state}</p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-emerald-400 font-bold block mb-1">2. Actions:</span>
              <p className="text-slate-300">{searchResult.problem_formulation.actions}</p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-amber-400 font-bold block mb-1">3. Goal Test:</span>
              <p className="text-slate-300">{searchResult.problem_formulation.goal_test}</p>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-purple-400 font-bold block mb-1">4. Path Cost g(n):</span>
              <p className="text-slate-300">{searchResult.problem_formulation.path_cost}</p>
            </div>
          </div>
        </div>
      )}

      {/* Step Controls Bar */}
      <StepControls
        currentStep={currentStep}
        totalSteps={searchResult?.steps?.length || 0}
        isPlaying={isPlaying}
        speedMs={speedMs}
        onStep={handleStep}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={handleReset}
        onSpeedChange={setSpeedMs}
      />

      {/* Main Visualizer & Solution Output */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Tree State-Space Visualizer (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>UCS Search Frontier &amp; Tree Node Expansions</span>
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
              Queue: Priority by Path Cost g(n)
            </span>
          </div>

          <div className="space-y-3">
            {searchResult?.tree_nodes?.map((node: any, idx: number) => {
              const isExplored = idx < currentStep;
              const isCurrent = idx === currentStep - 1;
              const isGoal = node.is_goal;

              let borderClass = "border-slate-200 bg-slate-50 opacity-40";
              if (isExplored) borderClass = "border-blue-200 bg-blue-50/50 opacity-100";
              if (isCurrent) borderClass = "border-blue-500 bg-blue-100 ring-2 ring-blue-400 opacity-100";
              if (isExplored && isGoal) borderClass = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400 opacity-100";

              return (
                <div
                  key={node.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${borderClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                      N{idx}
                    </span>
                    <div>
                      <div className="font-bold text-slate-800">{node.label}</div>
                      <div className="text-[11px] text-slate-500">
                        Resulting Stock: <span className="font-semibold text-slate-700">{node.stock} units</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900">
                      g(n) = Rs {node.cost.toFixed(1)}
                    </div>
                    {isGoal && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full inline-block mt-0.5">
                        GOAL MET
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optimal Solution Card & Cost Breakdown */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>UCS Optimal Reorder Solution</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-emerald-100/60 p-3 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 text-[11px] block font-semibold">Recommended Batch Order:</span>
                <span className="text-2xl font-black text-emerald-900">
                  +{searchResult?.optimal_order_quantity} Units
                </span>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Unit Wholesale Price:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    Rs {searchResult?.cost_breakdown?.unit_price} / unit
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Batch Ordering Cost:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    Rs {searchResult?.cost_breakdown?.ordering_cost?.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>5-Day Holding Cost (Rs 0.5/day):</span>
                  <span className="font-mono font-semibold text-slate-800">
                    Rs {searchResult?.cost_breakdown?.holding_cost?.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-slate-900 font-bold text-sm">
                  <span>Total Optimal Cost g*(s):</span>
                  <span className="font-mono text-emerald-700">
                    Rs {searchResult?.optimal_total_cost?.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Step State */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
            <span className="font-bold text-slate-700 block mb-1">Current Animation Status:</span>
            <div className="text-slate-600 leading-snug">
              {currentStepData ? currentStepData.log : "Click Step or Play to start Uniform-Cost Search tree expansion."}
            </div>
          </div>
        </div>
      </div>

      {/* Log Trace Panel */}
      <LogPanel logs={logs} title="Uniform-Cost Search (UCS) Priority Queue Trace" />

      {/* Algorithm Python Code Drawer */}
      <CodeDrawer
        title="Uniform-Cost Search (Pure Python Implementation)"
        concept="Module 2: Search Problem"
        pythonCode={pythonUCSCode}
      />
    </div>
  );
};
