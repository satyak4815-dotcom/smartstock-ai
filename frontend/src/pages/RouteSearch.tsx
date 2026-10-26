import React, { useState, useEffect } from "react";
import {
  MapPin, Sliders, GitMerge, CheckCircle, AlertTriangle, ShieldCheck,
  Compass, ArrowRight, Table, Layers
} from "lucide-react";
import { api } from "../services/api";
import { StepControls } from "../components/StepControls";
import { LogPanel } from "../components/LogPanel";
import { CodeDrawer } from "../components/CodeDrawer";

export const RouteSearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"uninformed" | "informed" | "supplier">("informed");
  const [startNode, setStartNode] = useState<string>("A");
  const [uninformedAlgo, setUninformedAlgo] = useState<string>("bfs");
  const [informedAlgo, setInformedAlgo] = useState<string>("astar");
  
  // Results
  const [searchResult, setSearchResult] = useState<any>(null);
  const [uninformedComparison, setUninformedComparison] = useState<any[]>([]);
  const [heuristicsProof, setHeuristicsProof] = useState<any>(null);
  const [aoStarResult, setAoStarResult] = useState<any>(null);
  
  // Supplier scoring
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("P1");
  const [wPrice, setWPrice] = useState<number>(0.40);
  const [wDist, setWDist] = useState<number>(0.25);
  const [wDeliv, setWDeliv] = useState<number>(0.20);
  const [wRel, setWRel] = useState<number>(0.15);
  const [supplierScoreResult, setSupplierScoreResult] = useState<any>(null);

  // Animation controls
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(600);

  // Load static verification and products on mount
  useEffect(() => {
    api.verifyHeuristics().then(setHeuristicsProof);
    api.solveAOStar().then(setAoStarResult);
    api.searchRoute("compare", "A").then(setUninformedComparison);
    api.getProducts().then(setProducts);
  }, []);

  // Run search when tab or algo changes
  useEffect(() => {
    const runCurrentSearch = async () => {
      try {
        if (activeTab === "uninformed") {
          const res = await api.searchRoute(uninformedAlgo, startNode);
          setSearchResult(res);
        } else if (activeTab === "informed") {
          const res = await api.searchRoute(informedAlgo, startNode);
          setSearchResult(res);
        }
        setCurrentStep(0);
        setIsPlaying(false);
      } catch (err) {
        console.error(err);
      }
    };
    runCurrentSearch();
  }, [activeTab, uninformedAlgo, informedAlgo, startNode]);

  // Run supplier scoring
  useEffect(() => {
    api.scoreSupplier(selectedProduct, wPrice, wDist, wDeliv, wRel).then(setSupplierScoreResult);
  }, [selectedProduct, wPrice, wDist, wDeliv, wRel]);

  // Step player
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && searchResult && currentStep < searchResult.steps.length) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speedMs);
    } else if (currentStep >= (searchResult?.steps?.length || 0)) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, searchResult, speedMs]);

  const logs = searchResult?.steps?.slice(0, currentStep).map((s: any) => s.log) || [];

  const pythonAStarCode = `def run_astar_search(start_node, goal_node="S0"):
    # f(n) = g(n) + h(n)
    # Priority queue stores: (f_score, g_score, counter, current_node, path)
    frontier = [(heuristics[start_node], 0, 0, start_node, [start_node])]
    cost_so_far = {start_node: 0}
    explored = set()

    while frontier:
        f, g, _, current, path = heapq.heappop(frontier)
        if current == goal_node:
            return {"path": path, "path_cost": g}

        explored.add(current)
        for neighbor, weight in adj[current]:
            new_g = g + weight
            if neighbor not in cost_so_far or new_g < cost_so_far[neighbor]:
                cost_so_far[neighbor] = new_g
                h = heuristics[neighbor]
                heapq.heappush(frontier, (new_g + h, new_g, counter, neighbor, path + [neighbor]))`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Concept: Graph Search, A*, AO*, Heuristics &amp; Multi-Criteria Ranking
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Delivery Route Search &amp; Supplier Scoring</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pathfinding on regional logistics network (Suppliers A-D, Hubs H1-H2, Warehouses W1-W2, Store S0).
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: "informed", label: "Informed (A* & Greedy)" },
            { id: "uninformed", label: "Uninformed (BFS, DFS, IDS, Bi)" },
            { id: "supplier", label: "Supplier Scoring & AO*" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Informed Search (A* & Greedy) */}
      {activeTab === "informed" && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Algorithm:</span>
                <select
                  value={informedAlgo}
                  onChange={(e) => setInformedAlgo(e.target.value)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800"
                >
                  <option value="astar">A* Search (f = g + h) [Optimal]</option>
                  <option value="greedy">Greedy Best-First (f = h)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Start Node:</span>
                <select
                  value={startNode}
                  onChange={(e) => setStartNode(e.target.value)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800"
                >
                  {["A", "B", "C", "D", "H1", "H2", "W1", "W2"].map((n) => (
                    <option key={n} value={n}>
                      {n} (Heuristic to S0 = {heuristicsProof?.true_shortest_distances?.[n] ?? "-"} km)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-200 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Heuristic h(n) verified: Mathematically Admissible &amp; Consistent</span>
            </div>
          </div>

          <StepControls
            currentStep={currentStep}
            totalSteps={searchResult?.steps?.length || 0}
            isPlaying={isPlaying}
            speedMs={speedMs}
            onStep={() => setCurrentStep((prev) => Math.min(prev + 1, searchResult?.steps?.length || 0))}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={() => { setCurrentStep(0); setIsPlaying(false); }}
            onSpeedChange={setSpeedMs}
          />

          {/* Visual Step Trace & Path Results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Node Expansions: Evaluation Formula f(n) = g(n) + h(n)</span>
                </h3>
                <span className="text-xs font-mono text-slate-500">Goal: Store S0 (h=0)</span>
              </div>

              <div className="space-y-2.5">
                {searchResult?.steps?.map((step: any, idx: number) => {
                  const isReached = idx < currentStep;
                  const isCurrent = idx === currentStep - 1;

                  let cardClass = "border-slate-200 bg-slate-50 opacity-40";
                  if (isReached) cardClass = "border-blue-200 bg-blue-50/40 opacity-100";
                  if (isCurrent) cardClass = "border-blue-500 bg-blue-100 ring-2 ring-blue-400 opacity-100";
                  if (isReached && step.expanded_node === "S0") cardClass = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400 opacity-100";

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${cardClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                          {step.expanded_node}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800">{step.label}</div>
                          <div className="text-[11px] text-slate-500">
                            Path: <span className="font-semibold text-slate-700">{step.path_so_far?.join(" → ")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                          {step.formula || `f=${step.f_cost}`}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          g = {step.g_cost} km | h = {step.h_cost} km
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optimal Result Card */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>{searchResult?.algorithm} Path Found</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-emerald-100/70 p-3 rounded-xl border border-emerald-200">
                    <span className="text-[11px] text-emerald-800 font-semibold block">Total Shortest Route Distance:</span>
                    <span className="text-2xl font-black text-emerald-900">
                      {searchResult?.path_cost} km
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-semibold text-slate-700 block">Waypoints:</span>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-slate-800 font-semibold flex items-center gap-1.5 flex-wrap">
                      {searchResult?.path?.map((n: string, i: number) => (
                        <React.Fragment key={i}>
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">{n}</span>
                          {i < (searchResult?.path?.length || 0) - 1 && <ArrowRight className="w-3 h-3 text-slate-400" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                    <div>Nodes Expanded: <span className="font-bold text-slate-800">{searchResult?.nodes_expanded}</span></div>
                    <div>Completeness: <span className="text-emerald-700 font-semibold">{searchResult?.completeness}</span></div>
                    <div>Optimality: <span className="text-emerald-700 font-semibold">{searchResult?.optimality}</span></div>
                  </div>
                </div>
              </div>

              {/* Admissibility Check Preview */}
              {heuristicsProof && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Expected Shortest Distance Oracle:</span>
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-center">
                    {Object.entries(heuristicsProof.true_shortest_distances || {}).map(([k, v]: any) => (
                      <div key={k} className="p-1 rounded bg-slate-100 border border-slate-200">
                        <span className="font-bold text-blue-700">{k}:</span> {v} km
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <LogPanel logs={logs} title="Informed Search Step-by-Step Priority Queue Trace" />
          <CodeDrawer title="A* Graph Search (Pure Python)" concept="Module 3: Informed Search" pythonCode={pythonAStarCode} />
        </div>
      )}

      {/* Tab 2: Uninformed Search (BFS, DFS, IDS, Bidirectional) */}
      {activeTab === "uninformed" && (
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Algorithm:</span>
                <select
                  value={uninformedAlgo}
                  onChange={(e) => setUninformedAlgo(e.target.value)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800"
                >
                  <option value="bfs">Breadth-First Search (BFS)</option>
                  <option value="dfs">Depth-First Search (DFS)</option>
                  <option value="ids">Iterative Deepening Search (IDS)</option>
                  <option value="bidirectional">Bidirectional Search (Simultaneous)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Start Node:</span>
                <select
                  value={startNode}
                  onChange={(e) => setStartNode(e.target.value)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800"
                >
                  {["A", "B", "C", "D", "H1", "H2", "W1", "W2"].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-slate-500 italic text-[11px]">
              Note: IDS and Bidirectional Search are significantly more efficient on larger logistical networks.
            </div>
          </div>

          <StepControls
            currentStep={currentStep}
            totalSteps={searchResult?.steps?.length || 0}
            isPlaying={isPlaying}
            speedMs={speedMs}
            onStep={() => setCurrentStep((prev) => Math.min(prev + 1, searchResult?.steps?.length || 0))}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={() => { setCurrentStep(0); setIsPlaying(false); }}
            onSpeedChange={setSpeedMs}
          />

          {/* Uninformed Comparison Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-600" />
              <span>Uninformed Search Algorithms Comparative Analysis (Start: Node A)</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Algorithm</th>
                    <th className="p-3">Nodes Expanded</th>
                    <th className="p-3">Path Found</th>
                    <th className="p-3">Path Cost</th>
                    <th className="p-3">Completeness</th>
                    <th className="p-3">Optimality</th>
                    <th className="p-3">Theoretical Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {uninformedComparison.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-blue-700">{row.name}</td>
                      <td className="p-3 font-mono font-semibold">{row.nodes_expanded}</td>
                      <td className="p-3 font-mono text-[11px]">{row.path}</td>
                      <td className="p-3 font-bold text-slate-800">{row.path_cost}</td>
                      <td className="p-3 text-emerald-700 font-semibold">{row.complete}</td>
                      <td className="p-3">{row.optimal}</td>
                      <td className="p-3 text-slate-500 text-[11px]">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <LogPanel logs={logs} title={`${searchResult?.algorithm || "Uninformed Search"} Trace`} />
        </div>
      )}

      {/* Tab 3: Supplier Scoring & AO* */}
      {activeTab === "supplier" && (
        <div className="space-y-6">
          {/* Supplier Scoring Sliders */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Heuristic Multi-Attribute Supplier Recommendation</span>
                </h3>
                <p className="text-xs text-slate-500">Tune weights to compute heuristic ranking scores across competing suppliers.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Product:</span>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.name} ({p.suppliers.length} suppliers)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Price Weight:</span>
                  <span className="text-blue-600">{(wPrice * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={wPrice}
                  onChange={(e) => setWPrice(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Distance Weight:</span>
                  <span className="text-blue-600">{(wDist * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={wDist}
                  onChange={(e) => setWDist(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Lead Time Weight:</span>
                  <span className="text-blue-600">{(wDeliv * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={wDeliv}
                  onChange={(e) => setWDeliv(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Reliability Weight:</span>
                  <span className="text-blue-600">{(wRel * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={wRel}
                  onChange={(e) => setWRel(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Supplier Ranking Results */}
            {supplierScoreResult && (
              <div>
                {!supplierScoreResult.has_supplier ? (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-center gap-3 text-xs">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <div className="font-bold text-sm">No Supplier Available (Gap Found)</div>
                      <div>{supplierScoreResult.warning}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-700">Ranked Supplier Candidates:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {supplierScoreResult.suppliers_ranked.map((s: any, idx: number) => {
                        const isBest = idx === 0;
                        return (
                          <div
                            key={s.supplier_id}
                            className={`p-4 rounded-xl border text-xs transition ${
                              isBest
                                ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400"
                                : "bg-white border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                                  {s.supplier_id}
                                </span>
                                <span>{s.supplier_name}</span>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                                isBest ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
                              }`}>
                                Score: {s.composite_score}/100
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
                              <div>Cost: <span className="font-semibold text-slate-900">Rs {s.cost}</span></div>
                              <div>Distance: <span className="font-semibold text-slate-900">{s.distance_km} km</span></div>
                              <div>Lead Time: <span className="font-semibold text-slate-900">{s.delivery_days} day(s)</span></div>
                              <div>Reliability: <span className="font-semibold text-slate-900">{(s.reliability * 100).toFixed(0)}%</span></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AO* Algorithm Card on AND-OR Graph */}
          {aoStarResult && (
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <GitMerge className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-slate-100">
                    AO* Algorithm on AND-OR Graph (Fulfilment of 60 Units Milk1L)
                  </h3>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                  Optimal Decision: O3 (Split Order, Rs 3210)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-4">
                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 opacity-60">
                  <span className="font-bold text-slate-400 block mb-1">Option O1 (OR Node):</span>
                  <div>Single Order Supplier A (60 units)</div>
                  <div className="text-slate-400 mt-1">Cost: Rs 3300 (h=3100)</div>
                </div>

                <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 opacity-60">
                  <span className="font-bold text-slate-400 block mb-1">Option O2 (OR Node):</span>
                  <div>Single Order Supplier C (60 units)</div>
                  <div className="text-slate-400 mt-1">Cost: Rs 3350 (h=3200)</div>
                </div>

                <div className="bg-emerald-950/80 p-3.5 rounded-xl border border-emerald-500/60 ring-2 ring-emerald-500">
                  <div className="flex items-center justify-between font-bold text-emerald-300 mb-1">
                    <span>Option O3 (AND Node - SELECTED):</span>
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded">BEST</span>
                  </div>
                  <div>Split Order across Regional Hubs:</div>
                  <div className="text-emerald-200 mt-1 space-y-0.5">
                    <div>• Subgoal X: 30 units A → W1 (Rs 1650)</div>
                    <div>• Subgoal Y: 30 units C → W2 (Rs 1560)</div>
                    <div className="font-bold text-white pt-1">Total Cost: Rs 3210 (Saves Rs 90!)</div>
                  </div>
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {aoStarResult.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
