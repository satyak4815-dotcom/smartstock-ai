import React, { useState, useEffect } from "react";
import { Layers, Truck, CheckCircle2, ArrowRight, Grid3X3, Beaker } from "lucide-react";
import { api } from "../services/api";
import { StepControls } from "../components/StepControls";
import { LogPanel } from "../components/LogPanel";
import { CodeDrawer } from "../components/CodeDrawer";

export const WarehousePuzzles: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"jug" | "transport" | "plan" | "tiles">("jug");
  const [puzzleResult, setPuzzleResult] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(600);
  const [loading, setLoading] = useState<boolean>(false);

  const loadPuzzle = async (tabName: string) => {
    setLoading(true);
    try {
      const res = await api.solvePuzzle(tabName);
      setPuzzleResult(res);
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPuzzle(activeTab);
  }, [activeTab]);

  useEffect(() => {
    let timer: any = null;
    const stepsCount = puzzleResult?.steps?.length || 0;
    if (isPlaying && puzzleResult && currentStep < stepsCount) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speedMs);
    } else if (currentStep >= stepsCount) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, puzzleResult, speedMs]);

  const currentStepData = puzzleResult?.steps?.[Math.max(0, currentStep - 1)];
  const logs = puzzleResult?.steps?.slice(0, currentStep).map((s: any) => s.log) || [];

  const pythonPuzzleCode = `# Module 6: Classic AI Puzzles applied to Warehouse Operations
# 1. Rack Transfer (Water-Jug): BFS on state space (x, y) where cap=(3, 5), goal=4
# 2. Zone Transfer (Missionaries & Cannibals): 3 Perishable, 3 Cleaning, cart=2, BFS 11 steps
# 3. Restocking STRIPS Planning: Forward state-space planner with preconditions & add/del effects
# 4. 8-Puzzle Shelf Rearrangement: A* search with Manhattan distance & misplaced tiles heuristics`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Concept: Classic State-Space Puzzles Mapped to Retail Operations
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Warehouse Problem-Solving Case Studies</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Four textbook AI problem formulations translated into store logistics operations.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: "jug", label: "1. Rack Transfer (Water Jug)" },
            { id: "transport", label: "2. Zone Transfer (Cannibals)" },
            { id: "plan", label: "3. Restocking STRIPS Plan" },
            { id: "tiles", label: "4. Shelf Rearrangement (8-Tiles)" }
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

      {/* Step Controls */}
      <StepControls
        currentStep={currentStep}
        totalSteps={puzzleResult?.steps?.length || 0}
        isPlaying={isPlaying}
        speedMs={speedMs}
        onStep={() => setCurrentStep((prev) => Math.min(prev + 1, puzzleResult?.steps?.length || 0))}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={() => { setCurrentStep(0); setIsPlaying(false); }}
        onSpeedChange={setSpeedMs}
      />

      {/* Tab 1: Water-Jug -> Rack Transfer */}
      {activeTab === "jug" && puzzleResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual Racks */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Beaker className="w-4 h-4 text-blue-600" />
                <span>Crate Rack Storage Bays: (Capacities: Rack 1 = 3, Rack 2 = 5 Crates)</span>
              </h3>

              <div className="flex justify-around items-end h-56 pt-4 pb-2 border-b border-slate-100">
                {/* Rack 1 (Cap 3) */}
                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold text-slate-700 mb-2">Rack 1 (Max 3)</div>
                  <div className="w-24 h-36 border-2 border-blue-500 rounded-b-xl flex flex-col-reverse p-1 bg-blue-50/30 gap-1">
                    {Array.from({ length: currentStepData?.state?.rack1_3 || 0 }).map((_, i) => (
                      <div key={i} className="h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        Crate {i + 1}
                      </div>
                    ))}
                  </div>
                  <span className="font-mono font-bold text-blue-700 mt-2 text-sm">
                    {currentStepData?.state?.rack1_3 || 0} / 3
                  </span>
                </div>

                {/* Rack 2 (Cap 5) */}
                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold text-slate-700 mb-2">Rack 2 (Max 5) [Target: 4]</div>
                  <div className="w-28 h-48 border-2 border-emerald-500 rounded-b-xl flex flex-col-reverse p-1 bg-emerald-50/30 gap-1">
                    {Array.from({ length: currentStepData?.state?.rack2_5 || 0 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                          (currentStepData?.state?.rack2_5 === 4 && i === 3) ? "bg-amber-500 animate-pulse" : "bg-emerald-600"
                        }`}
                      >
                        Crate {i + 1}
                      </div>
                    ))}
                  </div>
                  <span className="font-mono font-bold text-emerald-700 mt-2 text-sm">
                    {currentStepData?.state?.rack2_5 || 0} / 5
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block">Current Action:</span>
                <span className="text-blue-700 font-semibold">{currentStepData?.action || "Initial state"}</span>
              </div>
            </div>

            {/* Optimal Result & State Space */}
            <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>BFS Optimal Solution: Exactly {puzzleResult.optimal_moves} Moves</span>
              </div>

              <div className="text-xs text-slate-600 space-y-2">
                <span className="font-semibold text-slate-700 block">Shortest Solution Step Sequence:</span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {puzzleResult.solution_path?.map((step: any, i: number) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border flex items-center justify-between ${
                        i === currentStep - 1 ? "bg-blue-100 border-blue-400 font-bold" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <span>Move {i}: {step.action}</span>
                      <span className="text-slate-500">({step.state[0]}, {step.state[1]})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Missionaries and Cannibals -> Zone Transfer */}
      {activeTab === "transport" && puzzleResult && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Contamination Hazard Zone Transfer (3 Perishables + 3 Cleaning Crates; Cart Max Load 2)</span>
            </h3>

            <div className="grid grid-cols-3 gap-4 items-center py-6 text-center">
              {/* Zone A (Left) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">Zone A (Origin)</span>
                <div className="space-y-2">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                    Perishable: {currentStepData?.zone_A?.perishable}
                  </div>
                  <div className="p-2 bg-purple-100 text-purple-800 rounded-lg text-xs font-bold">
                    Cleaning: {currentStepData?.zone_A?.cleaning}
                  </div>
                </div>
              </div>

              {/* Transport Vehicle */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs">
                <span className="font-bold text-blue-800 block mb-1">Transport Cart</span>
                <div className="text-slate-600">{currentStepData?.cart_location}</div>
                <div className="text-slate-700 font-semibold text-[11px] mt-2">{currentStepData?.action}</div>
              </div>

              {/* Zone B (Right) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-2">Zone B (Destination)</span>
                <div className="space-y-2">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                    Perishable: {currentStepData?.zone_B?.perishable}
                  </div>
                  <div className="p-2 bg-purple-100 text-purple-800 rounded-lg text-xs font-bold">
                    Cleaning: {currentStepData?.zone_B?.cleaning}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safety Rule: On any side, Cleaning crates never exceed Perishables when Perishables are present. (BFS Optimal: {puzzleResult.crossings_count} Crossings).</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: STRIPS Restocking Plan */}
      {activeTab === "plan" && puzzleResult && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Restocking Multi-Step Planning (STRIPS Formulation: Preconditions &amp; Effects)</span>
            </h3>

            <div className="space-y-3">
              {puzzleResult.steps?.map((step: any, idx: number) => {
                const isExecuted = idx < currentStep;
                const isCurrent = idx === currentStep - 1;

                let cardClass = "bg-slate-50 border-slate-200 opacity-50";
                if (isExecuted) cardClass = "bg-emerald-50/70 border-emerald-300 opacity-100";
                if (isCurrent) cardClass = "bg-blue-100 border-blue-400 ring-2 ring-blue-400 opacity-100";

                return (
                  <div key={idx} className={`p-4 rounded-xl border text-xs transition ${cardClass}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                          {step.step}
                        </span>
                        <span>{step.action_name} ({step.action_id})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isExecuted ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        {isExecuted ? "EXECUTED" : "PRECONDITIONS REQUIRED"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-700">Preconditions:</span>{" "}
                        <span className="font-mono">{step.preconditions.join(", ")}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-emerald-700">Add Effects:</span>{" "}
                        <span className="font-mono text-emerald-800">+{step.add_effects.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: 8-Tiles Shelf Rearrangement */}
      {activeTab === "tiles" && puzzleResult && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-blue-600" />
              <span>3x3 Shelf Rearrangement (8-Puzzle A* Search with Manhattan Distance)</span>
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-4">
              {/* Current Grid Visualizer */}
              <div className="grid grid-cols-3 gap-2 w-64 h-64 p-3 bg-slate-900 rounded-2xl shadow-inner border border-slate-800">
                {(currentStepData?.grid || puzzleResult.initial_grid)?.map((val: number, i: number) => (
                  <div
                    key={i}
                    className={`rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                      val === 0
                        ? "bg-slate-800/40 border-2 border-dashed border-slate-700 text-transparent"
                        : "bg-blue-600 text-white shadow-md border border-blue-400"
                    }`}
                  >
                    {val !== 0 && val}
                  </div>
                ))}
              </div>

              {/* Goal Grid */}
              <div className="text-xs space-y-2">
                <span className="font-bold text-slate-700 block">Goal Shelf Arrangement:</span>
                <div className="grid grid-cols-3 gap-1.5 w-40 h-40 p-2 bg-slate-100 rounded-xl border border-slate-200">
                  {puzzleResult.goal_grid?.map((val: number, i: number) => (
                    <div
                      key={i}
                      className={`rounded-lg flex items-center justify-center font-bold text-xs ${
                        val === 0 ? "bg-transparent text-transparent" : "bg-emerald-600 text-white"
                      }`}
                    >
                      {val !== 0 && val}
                    </div>
                  ))}
                </div>
                <div className="text-slate-500 text-[11px]">Solved via A* in {puzzleResult.solution_moves} moves.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <LogPanel logs={logs} title="Warehouse Case Study Execution Trace" />
      <CodeDrawer title="Classic AI Case Studies (Pure Python)" concept="Module 6: Classic Problems" pythonCode={pythonPuzzleCode} />
    </div>
  );
};
