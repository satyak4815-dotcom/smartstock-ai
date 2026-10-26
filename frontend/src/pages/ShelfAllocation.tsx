import React, { useState, useEffect } from "react";
import { Sliders, RefreshCw, AlertTriangle, ShieldCheck, Crown, Flame } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../services/api";
import { StepControls } from "../components/StepControls";
import { LogPanel } from "../components/LogPanel";
import { CodeDrawer } from "../components/CodeDrawer";

export const ShelfAllocation: React.FC = () => {
  const [shelfResult, setShelfResult] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(300);

  // N-Queens sub-demo
  const [queenN, setQueenN] = useState<number>(8);
  const [queensResult, setQueensResult] = useState<any>(null);

  const runShelfSolver = async (forceScramble = false) => {
    try {
      const res = await api.optimizeShelf(forceScramble, 42);
      setShelfResult(res);
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (err) {
      console.error(err);
    }
  };

  const runQueensSolver = async (n: number) => {
    try {
      const res = await api.solveQueens(n, 42);
      setQueensResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    runShelfSolver();
    runQueensSolver(queenN);
  }, []);

  useEffect(() => {
    runQueensSolver(queenN);
  }, [queenN]);

  useEffect(() => {
    let timer: any = null;
    const stepsCount = shelfResult?.history?.length || 0;
    if (isPlaying && shelfResult && currentStep < stepsCount) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speedMs);
    } else if (currentStep >= stepsCount) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, shelfResult, speedMs]);

  const logs = shelfResult?.history?.slice(0, currentStep).map((s: any) => s.log) || [];

  const pythonLocalSearchCode = `def solve_shelf_allocation_hill_climbing(scramble_seed=42):
    # Objective to MINIMISE: 100 * (perishable next to cleaning) + sum(pick_frequency * distance_to_exit)
    current_layout = scrambled_layout_with_4_conflicts()
    current_obj = compute_objective(current_layout)
    sideways_count = 0

    for step in range(300):
        if conflicts(current_layout) == 0 and step > 40:
            break

        best_neighbour = None
        for i in range(10):
            for j in range(i + 1, 10):
                trial = swap(current_layout, i, j)
                if obj(trial) < current_obj:
                    best_neighbour = trial
                elif obj(trial) == current_obj and sideways_count < 15:
                    best_neighbour = trial # Allow sideways move

        if best_neighbour and obj(best_neighbour) <= current_obj:
            current_layout = best_neighbour
        else:
            # Escape local optimum via random neighbour perturbation
            current_layout = random_swap(current_layout)`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Concept: Local Search, Hill Climbing &amp; Objective Optimization (N-Queens Analogue)
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Shelf Allocation by Hill Climbing</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Arranging 10 shelf slots closest to exit to eliminate chemical contamination while optimizing picking speed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => runShelfSolver(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-xl shadow-sm transition"
            title="Scrambles the shelf layout with chemical conflicts for live recovery demonstration"
          >
            <Flame className="w-4 h-4" />
            <span>"Make It Worse" (Scramble)</span>
          </button>

          <button
            onClick={() => runShelfSolver(false)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Re-Run Local Search</span>
          </button>
        </div>
      </div>

      {/* Conflicts & Objective Summary Card */}
      {shelfResult && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-red-50 rounded-xl border border-red-200">
            <span className="text-[11px] font-bold text-red-600 block">Starting Hazard Conflicts:</span>
            <span className="text-2xl font-bold text-red-700">{shelfResult.start_conflicts} Pairs</span>
            <span className="text-[10px] text-red-500 block mt-0.5">Perishable adjacent to Cleaning</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-600 block">Final Conflicts (Resolved):</span>
            <span className="text-2xl font-bold text-emerald-700">{shelfResult.final_conflicts} Pairs</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Zero contamination hazard</span>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-[11px] font-bold text-blue-600 block">Objective Improvement:</span>
            <span className="text-2xl font-bold text-blue-700">
              {shelfResult.initial_objective} → {shelfResult.final_objective}
            </span>
            <span className="text-[10px] text-blue-500 block mt-0.5">Cost minimisation achieved</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 block">Local Search Moves:</span>
            <span className="text-2xl font-bold text-slate-800">{shelfResult.total_moves} Moves</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Swaps + sideways plateau steps</span>
          </div>
        </div>
      )}

      {/* Step Controls */}
      <StepControls
        currentStep={currentStep}
        totalSteps={shelfResult?.history?.length || 0}
        isPlaying={isPlaying}
        speedMs={speedMs}
        onStep={() => setCurrentStep((prev) => Math.min(prev + 1, shelfResult?.history?.length || 0))}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={() => { setCurrentStep(0); setIsPlaying(false); }}
        onSpeedChange={setSpeedMs}
      />

      {/* 10 Shelf Slots Visualizer */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-sm font-bold text-slate-800">
            Aisle Display Shelf: Slots 1 to 10 (Slot 1 is Closest to the Exit)
          </h3>
          <span className="text-xs text-slate-500">
            Objective = 100 × (Adjacent Incompatible Pairs) + Σ(Pick Frequency × Distance)
          </span>
        </div>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-2.5">
          {shelfResult?.shelf_slots?.map((slot: any) => {
            const isClean = slot.category === "Cleaning";
            const isPerish = ["Dairy & Eggs", "Bakery & Snacks"].includes(slot.category);

            let bgClass = "bg-slate-50 border-slate-200";
            if (isClean) bgClass = "bg-purple-50 border-purple-300";
            if (isPerish) bgClass = "bg-emerald-50 border-emerald-300";

            return (
              <div
                key={slot.slot}
                className={`p-3 rounded-xl border text-center relative transition flex flex-col justify-between h-32 ${bgClass}`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span className="font-bold">Slot {slot.slot}</span>
                    <span>{slot.slot === 1 ? "Exit" : `${slot.slot}m`}</span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 leading-tight line-clamp-2">
                    {slot.product_name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{slot.category}</div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[10px]">
                  <span className="text-slate-600">Pick Freq: </span>
                  <span className="font-mono font-bold text-blue-700">{slot.pick_frequency}</span>
                </div>

                {slot.hazard_conflict && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5" title="Hazard Conflict!">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart: Objective Score & Conflicts vs Move Number */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3">
          Local Search Convergence: Objective Function &amp; Conflicts Reduction vs Move Number
        </h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={shelfResult?.history || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="move" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="objective" stroke="#2563eb" strokeWidth={2} dot={false} name="Total Objective" />
              <Line type="stepAfter" dataKey="conflicts" stroke="#ef4444" strokeWidth={2} dot={false} name="Hazard Conflicts" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* N-Queens Textbook Analogue Mini-Demo */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">
              Textbook N-Queens Problem (Same Min-Conflicts Local Search)
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Select Board Size N:</span>
            {[4, 6, 8, 10, 12].map((n) => (
              <button
                key={n}
                onClick={() => setQueenN(n)}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  queenN === n ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                N={n}
              </button>
            ))}
          </div>
        </div>

        {queensResult && (
          <div className="flex flex-col md:flex-row items-center justify-around gap-6 text-xs">
            {/* Visual Board */}
            <div
              className="grid gap-1 p-2 bg-slate-950 rounded-xl border border-slate-800 shadow-inner"
              style={{ gridTemplateColumns: `repeat(${queenN}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: queenN * queenN }).map((_, idx) => {
                const r = Math.floor(idx / queenN);
                const c = idx % queenN;
                const hasQueen = queensResult.board[c] === r;
                const isDark = (r + c) % 2 === 1;

                return (
                  <div
                    key={idx}
                    className={`w-7 h-7 flex items-center justify-center rounded transition-all ${
                      isDark ? "bg-slate-800" : "bg-slate-700"
                    }`}
                  >
                    {hasQueen && <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="text-emerald-400 font-bold text-sm">
                {queensResult.solved ? "N-Queens Solved (0 Attacking Pairs)" : `Conflicts Reduced to ${queensResult.final_conflicts}`}
              </div>
              <div>Board Size: <span className="font-mono font-bold text-white">{queenN} x {queenN}</span></div>
              <div>Initial Random Conflicts: <span className="font-mono text-red-400">{queensResult.start_conflicts}</span></div>
              <div>Final Conflicts: <span className="font-mono text-emerald-400">{queensResult.final_conflicts}</span></div>
              <div>Algorithm Moves: <span className="font-mono text-blue-400">{queensResult.total_moves}</span></div>
            </div>
          </div>
        )}
      </div>

      <LogPanel logs={logs} title="Shelf Allocation Local Search Move Log" />
      <CodeDrawer title="Hill Climbing Local Search (Pure Python)" concept="Module 7: Local Search" pythonCode={pythonLocalSearchCode} />
    </div>
  );
};
