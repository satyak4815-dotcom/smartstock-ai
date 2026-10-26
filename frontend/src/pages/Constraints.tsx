import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Sliders, DollarSign, Layers, ShieldCheck, AlertOctagon } from "lucide-react";
import { api } from "../services/api";
import { StepControls } from "../components/StepControls";
import { LogPanel } from "../components/LogPanel";
import { CodeDrawer } from "../components/CodeDrawer";

export const Constraints: React.FC = () => {
  const [budget, setBudget] = useState<number>(15000);
  const [capacity, setCapacity] = useState<number>(400);
  const [cspResult, setCspResult] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(500);
  const [loading, setLoading] = useState<boolean>(false);

  const runSolver = async () => {
    setLoading(true);
    try {
      const res = await api.solveCSP(budget, capacity);
      setCspResult(res);
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSolver();
  }, [budget, capacity]);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && cspResult && currentStep < cspResult.steps.length) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, speedMs);
    } else if (currentStep >= (cspResult?.steps?.length || 0)) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, cspResult, speedMs]);

  const logs = cspResult?.steps?.slice(0, currentStep).map((s: any) => `${s.reason} -> ${s.valid ? 'VALID' : 'PRUNED'}`) || [];

  const pythonCSPCode = `def solve_replenishment_csp(products, daily_budget=15000, warehouse_capacity=400):
    # Variables X: products needing replenishment
    # Domains D: {0, 10, 20, 30, 40} respecting MOQ & Perishable shelf life
    # Constraints C: Budget, MOQ, Warehouse Capacity, Perishable limit
    
    def backtrack(assignment, current_domains):
        if len(assignment) == len(variables):
            return assignment

        # MRV Heuristic: Variable with Minimum Remaining Values
        unassigned = [v for v in variables if v not in assignment]
        var = min(unassigned, key=lambda v: len(current_domains[v]))

        for val in sorted(current_domains[var], reverse=True):
            if cost(assignment, var, val) > daily_budget:
                continue # Pruned by budget constraint
            if stock(assignment, var, val) > warehouse_capacity:
                continue # Pruned by capacity constraint

            # Forward Checking on future variables
            new_domains = forward_check(current_domains, var, val, remaining_budget)
            if not any_domain_wiped_out(new_domains):
                res = backtrack({**assignment, var: val}, new_domains)
                if res is not None:
                    return res
        return None`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Concept: Constraint Satisfaction Problems (CSP), Forward Checking &amp; MRV
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Multi-Constraint Replenishment Optimization</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Backtracking solver satisfying daily budget, supplier MOQ, perishable shelf life, and storage limits.
          </p>
        </div>

        {/* Tighten budget quick buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Quick Test:</span>
          <button
            onClick={() => setBudget(15000)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              budget === 15000 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Normal (Rs 15k)
          </button>
          <button
            onClick={() => setBudget(3500)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              budget === 3500 ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Tight (Rs 3.5k)
          </button>
          <button
            onClick={() => setBudget(500)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              budget === 500 ? "bg-red-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Deficit (Rs 500)
          </button>
        </div>
      </div>

      {/* Constraints Sliders Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Daily Procurement Budget Constraint:
            </span>
            <span className="font-mono text-base font-bold text-blue-700">Rs {budget.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="500"
            max="25000"
            step="500"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>Rs 500 (Strict Deficit)</span>
            <span>Rs 15,000 (Default)</span>
            <span>Rs 25,000 (Abundant)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-600" />
              Warehouse Total Storage Capacity Constraint:
            </span>
            <span className="font-mono text-base font-bold text-purple-700">{capacity} Units</span>
          </div>
          <input
            type="range"
            min="200"
            max="600"
            step="20"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>200 Units</span>
            <span>400 Units (Standard)</span>
            <span>600 Units</span>
          </div>
        </div>
      </div>

      {/* Decision Status Banner */}
      {cspResult && (
        <div
          className={`p-5 rounded-2xl border flex items-center justify-between transition ${
            cspResult.is_approved
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : "bg-red-50 border-red-300 text-red-950"
          }`}
        >
          <div className="flex items-center gap-3">
            {cspResult.is_approved ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            ) : (
              <AlertOctagon className="w-8 h-8 text-red-600 shrink-0" />
            )}
            <div>
              <div className="font-bold text-lg">
                {cspResult.is_approved ? "Replenishment Plan APPROVED by CSP Engine" : "Replenishment Plan REJECTED / Constrained"}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {cspResult.is_approved
                  ? `Total allocated cost: Rs ${cspResult.total_cost.toFixed(0)} (${cspResult.budget_utilized_pct}% of budget utilized). All domain constraints satisfied.`
                  : "Constraint violation: Budget limit too low to meet supplier Minimum Order Quantity (MOQ) or domain wipeout occurred during Forward Checking."}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              cspResult.is_approved ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}>
              {cspResult.status}
            </span>
          </div>
        </div>
      )}

      {/* Step Controls */}
      <StepControls
        currentStep={currentStep}
        totalSteps={cspResult?.steps?.length || 0}
        isPlaying={isPlaying}
        speedMs={speedMs}
        onStep={() => setCurrentStep((prev) => Math.min(prev + 1, cspResult?.steps?.length || 0))}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={() => { setCurrentStep(0); setIsPlaying(false); }}
        onSpeedChange={setSpeedMs}
      />

      {/* Solution Table & Constraint Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Variables Assigned &amp; Domain Results</h3>
            <span className="text-xs text-slate-500 font-mono">
              MRV Order: {cspResult?.assignment_order?.slice(0, 4).join(" → ")}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Variable (SKU)</th>
                  <th className="p-3">Approved Qty</th>
                  <th className="p-3">Unit Cost</th>
                  <th className="p-3">Line Subtotal</th>
                  <th className="p-3">Constraint Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cspResult?.solution_rows?.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{row.product_name}</td>
                    <td className="p-3 font-mono font-bold text-blue-700">+{row.approved_order_qty} Units</td>
                    <td className="p-3 font-mono text-slate-600">Rs {row.unit_cost}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">Rs {row.subtotal}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.approved_order_qty > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Forward Checking Pruning Log */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Forward Checking Domain Pruning</span>
          </h3>

          <div className="text-xs text-slate-600 space-y-2 max-h-60 overflow-y-auto font-mono">
            {cspResult?.pruning_log?.length === 0 ? (
              <div className="text-slate-400 italic">No domain values needed pruning under current budget.</div>
            ) : (
              cspResult?.pruning_log?.map((log: string, i: number) => (
                <div key={i} className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-700">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <LogPanel logs={logs} title="Backtracking &amp; MRV Assignment Steps" />
      <CodeDrawer title="CSP Backtracking with Forward Checking (Pure Python)" concept="Module 4: Constraints" pythonCode={pythonCSPCode} />
    </div>
  );
};
