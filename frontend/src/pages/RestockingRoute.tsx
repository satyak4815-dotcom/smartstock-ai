import React, { useState, useEffect } from "react";
import { Route, CheckCircle, ArrowRight, Table, MapPin, Zap } from "lucide-react";
import { api } from "../services/api";
import { StepControls } from "../components/StepControls";
import { LogPanel } from "../components/LogPanel";
import { CodeDrawer } from "../components/CodeDrawer";

export const RestockingRoute: React.FC = () => {
  const [tspComparison, setTspComparison] = useState<any>(null);
  const [exhaustiveResult, setExhaustiveResult] = useState<any>(null);
  const [nnResult, setNnResult] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(600);

  useEffect(() => {
    api.solveTSP("compare").then(setTspComparison);
    api.solveTSP("exhaustive").then(setExhaustiveResult);
    api.solveTSP("nearest").then(setNnResult);
  }, []);

  useEffect(() => {
    let timer: any = null;
    const stepsCount = nnResult?.steps?.length || 0;
    if (isPlaying && nnResult && currentStep < stepsCount) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speedMs);
    } else if (currentStep >= stepsCount) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, nnResult, speedMs]);

  const logs = nnResult?.steps?.slice(0, currentStep).map((s: any) => s.log) || [];

  const pythonTSPCode = `def solve_tsp_nearest_neighbour():
    # Symmetric 6x6 Distance Matrix: Warehouse W1 and 5 Drop Points S1..S5
    # Nearest-Neighbour Greedy Heuristic:
    current = 0 # W1
    visited = {current}
    route = [current]
    total_dist = 0

    while len(visited) < 6:
        # Find closest unvisited drop point
        next_node = min((c for c in range(6) if c not in visited), key=lambda c: matrix[current][c])
        total_dist += matrix[current][next_node]
        visited.add(next_node)
        route.append(next_node)
        current = next_node

    # Return to warehouse base W1
    total_dist += matrix[current][0]
    route.append(0)
    return {"route": route, "distance_km": total_dist} # Returns 24 km!`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
          Concept: Travelling Salesperson Problem (TSP), Exhaustive Search &amp; Nearest-Neighbour
        </span>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Warehouse Restocking Route Optimization (TSP)</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Evaluating all 5! = 120 Hamiltonian delivery routes across Warehouse W1 and drop points S1 to S5.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 block">Exhaustive Routes Checked:</span>
          <span className="text-2xl font-black text-slate-900 mt-1">120 Permutations</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">All 5! combinations evaluated</span>
        </div>

        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700 block">Global Best Route Distance:</span>
          <span className="text-2xl font-black text-emerald-800 mt-1">24 km</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Exhaustive Minimum</span>
        </div>

        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700 block">Nearest-Neighbour Distance:</span>
          <span className="text-2xl font-black text-emerald-800 mt-1">24 km</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Matches optimal 100%!</span>
        </div>

        <div className="p-4 bg-red-50 rounded-xl border border-red-200 shadow-sm">
          <span className="text-[11px] font-bold text-red-700 block">Worst Route Distance:</span>
          <span className="text-2xl font-black text-red-800 mt-1">60 km</span>
          <span className="text-[10px] text-red-500 block mt-0.5">Suboptimal detour</span>
        </div>
      </div>

      {/* Step Controls for Nearest Neighbour Animation */}
      <StepControls
        currentStep={currentStep}
        totalSteps={nnResult?.steps?.length || 0}
        isPlaying={isPlaying}
        speedMs={speedMs}
        onStep={() => setCurrentStep((prev) => Math.min(prev + 1, nnResult?.steps?.length || 0))}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={() => { setCurrentStep(0); setIsPlaying(false); }}
        onSpeedChange={setSpeedMs}
      />

      {/* Visual Map / Route Step Trace & Symmetric Distance Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nearest Neighbour Live Restocking Route */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Route className="w-4 h-4 text-blue-600" />
                <span>Nearest-Neighbour Greedy Tour Animation</span>
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                Total: 24 km
              </span>
            </div>

            <div className="space-y-2">
              {nnResult?.steps?.map((step: any, idx: number) => {
                const isVisited = idx < currentStep;
                const isCurrent = idx === currentStep - 1;

                let cardClass = "border-slate-200 bg-slate-50 opacity-40";
                if (isVisited) cardClass = "border-blue-200 bg-blue-50/50 opacity-100";
                if (isCurrent) cardClass = "border-emerald-500 bg-emerald-100 ring-2 ring-emerald-400 opacity-100";

                return (
                  <div key={idx} className={`p-3 rounded-xl border text-xs flex items-center justify-between transition ${cardClass}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        {step.step}
                      </span>
                      <div>
                        <div className="font-bold text-slate-800">{step.action}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {step.visited?.join(" → ")}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono font-bold text-slate-900">
                      {step.distance_so_far} km
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 6x6 Distance Matrix */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Table className="w-4 h-4 text-purple-600" />
                <span>Restocking Route Symmetric Distance Matrix (km)</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">Index 0 = Warehouse W1</span>
            </div>

            {tspComparison?.matrix_data && (
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2 border border-slate-200">Point</th>
                      {tspComparison.labels?.map((l: string) => (
                        <th key={l} className="p-2 border border-slate-200">{l}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tspComparison.matrix_data.map((row: number[], rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        <td className="p-2 font-bold bg-slate-50 border border-slate-200">
                          {tspComparison.labels[rIdx]}
                        </td>
                        {row.map((val: number, cIdx: number) => (
                          <td
                            key={cIdx}
                            className={`p-2 border border-slate-200 ${
                              rIdx === cIdx ? "bg-slate-100 text-slate-400 font-bold" : "text-slate-800"
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            Theoretical takeaway: For n=6 nodes, evaluating 5! = 120 cycles takes milliseconds; for n=20 hubs, exhaustive search requires 10^17 steps, mandating heuristics like Nearest-Neighbour or Branch-and-Bound.
          </div>
        </div>
      </div>

      {/* Top 5 Best & Worst Routes Table */}
      {exhaustiveResult && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Top Optimal Routes from Exhaustive Permutation Search
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1.5">
              <span className="font-bold text-emerald-700 block font-sans">Top 5 Shortest Routes (Optimal = 24 km):</span>
              {exhaustiveResult.sample_routes?.slice(0, 5).map((r: any, i: number) => (
                <div key={i} className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 flex justify-between">
                  <span>{r.route_str}</span>
                  <span className="font-bold text-emerald-800">{r.distance_km} km</span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-red-700 block font-sans">Sample Worst Routes (Suboptimal Detours):</span>
              {exhaustiveResult.all_routes?.slice(-5).reverse().map((r: any, i: number) => (
                <div key={i} className="p-2 rounded-lg bg-red-50/60 border border-red-200 flex justify-between">
                  <span>{r.route_str}</span>
                  <span className="font-bold text-red-800">{r.distance_km} km</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <LogPanel logs={logs} title="Nearest-Neighbour Step Trace" />
      <CodeDrawer title="TSP Nearest-Neighbour and Permutation Search (Pure Python)" concept="Module 8: TSP" pythonCode={pythonTSPCode} />
    </div>
  );
};
