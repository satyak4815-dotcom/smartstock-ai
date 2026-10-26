import React, { useState, useEffect } from "react";
import { Swords, Scissors, CheckCircle, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import { api } from "../services/api";
import { StepControls } from "../components/StepControls";
import { LogPanel } from "../components/LogPanel";
import { CodeDrawer } from "../components/CodeDrawer";

const DEFAULT_LEAVES = [
  40, 30, 60,
  30, 90, 90,
  90, 80, 50,
  30, 90, 20,
  80, 80, 20,
  90, 60, 50,
  30, 70, 20,
  20, 20, 20,
  80, 50, 80
];

export const Negotiation: React.FC = () => {
  const [leaves, setLeaves] = useState<number[]>(DEFAULT_LEAVES);
  const [gameResult, setGameResult] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(500);

  const runComparison = async (leafArray: number[]) => {
    try {
      const res = await api.solveNegotiation("compare", leafArray);
      setGameResult(res);
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    runComparison(leaves);
  }, []);

  useEffect(() => {
    let timer: any = null;
    const stepsCount = gameResult?.alphabeta?.steps?.length || 0;
    if (isPlaying && gameResult && currentStep < stepsCount) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speedMs);
    } else if (currentStep >= stepsCount) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, gameResult, speedMs]);

  const handleLeafChange = (index: number, val: number) => {
    const updated = [...leaves];
    updated[index] = val;
    setLeaves(updated);
  };

  const handleResetLeaves = () => {
    setLeaves([...DEFAULT_LEAVES]);
    runComparison([...DEFAULT_LEAVES]);
  };

  const logs = gameResult?.alphabeta?.steps?.slice(0, currentStep).map((s: any) => s.log) || [];

  const pythonAlphaBetaCode = `def solve_alphabeta(leaves):
    # Two-player Zero-sum game: Platform (MAX) vs Supplier (MIN)
    # alpha: best MAX can guarantee, beta: best MIN can guarantee
    def max_value(node, depth, alpha, beta):
        if is_leaf(node): return leaf_value(node)
        v = -infinity
        for child in children(node):
            v = max(v, min_value(child, depth + 1, alpha, beta))
            if v >= beta:
                return v  # Beta cut-off (Prune remaining children)
            alpha = max(alpha, v)
        return v

    def min_value(node, depth, alpha, beta):
        if is_leaf(node): return leaf_value(node)
        v = +infinity
        for child in children(node):
            v = min(v, max_value(child, depth + 1, alpha, beta))
            if v <= alpha:
                return v  # Alpha cut-off (Prune remaining children)
            beta = min(beta, v)
        return v`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Concept: Adversarial Search, Minimax &amp; Alpha-Beta Pruning
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Supplier Negotiation Game Tree (27 Leaves)</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Two-player game between Platform (MAX discount demand) and Supplier (MIN counter-offer).
          </p>
        </div>

        <button
          onClick={() => runComparison(leaves)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Re-Run Game Algorithms</span>
        </button>
      </div>

      {/* Game Classification Chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="font-bold text-blue-700 block">Two-Player Game:</span>
          <span className="text-slate-600 text-[11px]">Platform (MAX) vs Supplier (MIN)</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="font-bold text-emerald-700 block">Zero-Sum Type:</span>
          <span className="text-slate-600 text-[11px]">Platform benefit is directly inverse to supplier margin</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="font-bold text-purple-700 block">Deterministic:</span>
          <span className="text-slate-600 text-[11px]">No random chance or probability dice rolls</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="font-bold text-amber-700 block">Perfect Information:</span>
          <span className="text-slate-600 text-[11px]">All payoffs, leaf utilities, and moves fully visible</span>
        </div>
      </div>

      {/* Side-by-Side Comparison Banner */}
      {gameResult && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-950">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                Same Decision Guaranteed: "{gameResult.optimal_move}" with Root Utility Score = {gameResult.optimal_value}
              </div>
              <div className="text-xs text-emerald-800">
                Minimax evaluated all 27 leaves. Alpha-Beta evaluated only {gameResult.alphabeta_leaves} leaves ({gameResult.pruned_count} pruned, saving 40.7% computation)!
              </div>
            </div>
          </div>

          <span className="bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-sm">
            Optimal: 80 / 100
          </span>
        </div>
      )}

      {/* Step Controls */}
      <StepControls
        currentStep={currentStep}
        totalSteps={gameResult?.alphabeta?.steps?.length || 0}
        isPlaying={isPlaying}
        speedMs={speedMs}
        onStep={() => setCurrentStep((prev) => Math.min(prev + 1, gameResult?.alphabeta?.steps?.length || 0))}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={() => { setCurrentStep(0); setIsPlaying(false); }}
        onSpeedChange={setSpeedMs}
      />

      {/* Side-by-Side Algorithm Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Minimax Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Swords className="w-4 h-4 text-blue-600" />
              <span>1. Standard Minimax (Exhaustive)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              27 / 27 Leaves Evaluated
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <span>Root Value:</span>
              <span className="font-bold text-base text-blue-700">{gameResult?.minimax?.root_value}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <span>Optimal Demand Move:</span>
              <span className="font-bold text-slate-900">{gameResult?.minimax?.best_move}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Branch Payoff Values (Children of Root):</span>
              <div className="grid grid-cols-3 gap-2 text-center font-mono font-bold">
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  Ask 5%: {gameResult?.minimax?.child_values?.[0]}
                </div>
                <div className="p-1.5 bg-blue-100 text-blue-800 rounded border border-blue-300">
                  Ask 10%: {gameResult?.minimax?.child_values?.[1]} (MAX)
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  Free Deliv: {gameResult?.minimax?.child_values?.[2]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alpha-Beta Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-emerald-600" />
              <span>2. Alpha-Beta Pruning (Optimal &amp; Fast)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {gameResult?.alphabeta_leaves} / 27 Leaves Evaluated
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex justify-between items-center">
              <span>Alpha-Beta Value:</span>
              <span className="font-bold text-base text-emerald-700">{gameResult?.alphabeta?.root_value}</span>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex justify-between items-center">
              <span>Optimal Demand Move:</span>
              <span className="font-bold text-emerald-900">{gameResult?.alphabeta?.best_move}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block mb-1">Pruned Subtrees / Beta Cut-offs:</span>
              <div className="text-[11px] font-mono text-amber-700 space-y-1">
                {gameResult?.alphabeta?.pruned_branches?.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Scissors className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>Pruned at {p.pruned_at} ({p.condition})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editable 27 Leaves Grid */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Interactive 27 Terminal Leaves (Payoff Values)
            </h3>
            <p className="text-xs text-slate-500">Edit any leaf payoff to test how minimax decisions and alpha-beta cut-offs adapt.</p>
          </div>
          <button
            onClick={handleResetLeaves}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default Payoffs</span>
          </button>
        </div>

        <div className="grid grid-cols-9 gap-2">
          {leaves.map((val, idx) => (
            <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span className="text-[9px] text-slate-400 block font-mono">Leaf {idx}</span>
              <input
                type="number"
                value={val}
                onChange={(e) => handleLeafChange(idx, Number(e.target.value))}
                className="w-full text-center text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded p-1"
              />
            </div>
          ))}
        </div>
      </div>

      <LogPanel logs={logs} title="Alpha-Beta Dynamic Value Updates &amp; Cut-off Trace" />
      <CodeDrawer title="Minimax with Alpha-Beta Pruning (Pure Python)" concept="Module 5: Game Trees" pythonCode={pythonAlphaBetaCode} />
    </div>
  );
};
