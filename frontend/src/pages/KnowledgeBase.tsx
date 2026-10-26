import React, { useState, useEffect } from "react";
import {
  BookOpen, GitCommit, Network, Cpu, Database, Binary, CheckCircle,
  HelpCircle, ArrowRight, ShieldCheck, Search, Sliders, Play, Edit3
} from "lucide-react";
import { api } from "../services/api";
import { LogPanel } from "../components/LogPanel";
import { CodeDrawer } from "../components/CodeDrawer";

export const KnowledgeBase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"types" | "prop" | "fol" | "chaining" | "frames" | "semantic">("prop");

  // Tab 1: Types of Knowledge & Abduction
  const [knowledgeTypes, setKnowledgeTypes] = useState<any>(null);
  const [abductionResult, setAbductionResult] = useState<any>(null);

  // Tab 2: Propositional Logic
  const [truthTable, setTruthTable] = useState<any>(null);
  const [gapsResult, setGapsResult] = useState<any>(null);
  const [inferenceRules, setInferenceRules] = useState<any[]>([]);

  // Tab 3: FOL
  const [term1, setTerm1] = useState<string>("Reorder, x, Bread");
  const [term2, setTerm2] = useState<string>("Reorder, Milk1L, y");
  const [unifyResult, setUnifyResult] = useState<any>(null);
  const [resolutionResult, setResolutionResult] = useState<any>(null);
  const [quantifiersData, setQuantifiersData] = useState<any>(null);

  // Tab 4: Chaining
  const [forwardChainingData, setForwardChainingData] = useState<any>(null);
  const [backwardGoal, setBackwardGoal] = useState<string>("ReorderUrgent");
  const [backwardProduct, setBackwardProduct] = useState<string>("P1");
  const [backwardResult, setBackwardResult] = useState<any>(null);

  // Tab 5: Frames
  const [framesData, setFramesData] = useState<any>(null);
  const [selectedFrameProduct, setSelectedFrameProduct] = useState<string>("P1");
  const [productFrameInspection, setProductFrameInspection] = useState<any>(null);
  const [productDefaultReorder, setProductDefaultReorder] = useState<number>(20);

  // Tab 6: Semantic Net
  const [semanticNetData, setSemanticNetData] = useState<any>(null);
  const [netQueryType, setNetQueryType] = useState<string>("is_perishable");
  const [netQueryParam, setNetQueryParam] = useState<string>("P1");
  const [netQueryResult, setNetQueryResult] = useState<any>(null);
  const [basketAssociations, setBasketAssociations] = useState<any>(null);
  const [netVsFrameComp, setNetVsFrameComp] = useState<any[]>([]);

  useEffect(() => {
    // Initial fetch for active views
    api.getTruthTable().then(setTruthTable);
    api.getGaps().then(setGapsResult);
    api.getInferenceRules().then(setInferenceRules);
    api.getKnowledgeTypes().then(setKnowledgeTypes);
    api.runAbduction("Milk1L", 40, 14).then(setAbductionResult);
    api.getQuantifiers().then(setQuantifiersData);
    api.resolveRefutation().then(setResolutionResult);
    api.forwardInference().then(setForwardChainingData);
    api.getFrames().then(setFramesData);
    api.getSemanticNet().then(setSemanticNetData);
    api.getAssociations().then(setBasketAssociations);
    api.getComparison().then(setNetVsFrameComp);
  }, []);

  // Unification trigger
  const handleUnify = async () => {
    try {
      const t1 = term1.split(",").map((s) => s.trim());
      const t2 = term2.split(",").map((s) => s.trim());
      const res = await api.unify(t1, t2);
      setUnifyResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleUnify();
  }, []);

  // Backward chaining trigger
  useEffect(() => {
    api.backwardInference(backwardProduct, backwardGoal).then(setBackwardResult);
  }, [backwardProduct, backwardGoal]);

  // Frame inspection
  useEffect(() => {
    api.getFrames(selectedFrameProduct).then(setProductFrameInspection);
  }, [selectedFrameProduct]);

  // Frame default modification
  const handleUpdateFrameDefault = async (newVal: number) => {
    setProductDefaultReorder(newVal);
    await api.updateFrameDefault("Product", "reorder_level", newVal);
    const updated = await api.getFrames(selectedFrameProduct);
    setProductFrameInspection(updated);
  };

  // Semantic query trigger
  const handleRunNetQuery = async () => {
    try {
      const res = await api.querySemanticNet(netQueryType, netQueryParam);
      setNetQueryResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleRunNetQuery();
  }, [netQueryType, netQueryParam]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Module 9: Knowledge Representation &amp; Reasoning Paradigms
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">SmartStock Knowledge Base &amp; Logic Studio</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Propositional logic, First-Order Logic (FOL), Chaining, Frame systems, and Semantic Networks.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold flex-wrap">
          {[
            { id: "types", label: "Types of Knowledge" },
            { id: "prop", label: "Propositional Logic" },
            { id: "fol", label: "First-Order Logic (FOL)" },
            { id: "chaining", label: "Forward/Backward Chaining" },
            { id: "frames", label: "Frames & Inheritance" },
            { id: "semantic", label: "Semantic Network" }
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

      {/* Tab 1: Types of Knowledge & Reasoning */}
      {activeTab === "types" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {knowledgeTypes?.types?.map((item: any, i: number) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold text-blue-700 block">{item.type}</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">{item.definition}</p>
                <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-700 font-mono">
                  {item.example}
                </div>
              </div>
            ))}
          </div>

          {/* 6 Steps of Building a Knowledge Base */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              The 6 Steps of Knowledge Engineering (Russell &amp; Norvig Standard)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-xs">
              {knowledgeTypes?.kb_construction_steps?.map((st: any) => (
                <div key={st.step} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                      {st.step}
                    </span>
                    <span className="font-bold text-slate-800">{st.title}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Abductive Reasoning Mini-Demo */}
          {abductionResult && (
            <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-100">
                    Abductive Reasoning Mini-Demo: Inference to Best Explanation
                  </h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Best Guess: {abductionResult.best_explanation}
                </span>
              </div>

              <div className="text-xs text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                {abductionResult.observation}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                {abductionResult.hypotheses?.map((h: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border ${
                      idx === 0
                        ? "bg-amber-950/60 border-amber-500/60 ring-2 ring-amber-500/40"
                        : "bg-slate-800 border-slate-700 opacity-70"
                    }`}
                  >
                    <div className="font-bold text-slate-100 mb-1">{h.hypothesis}</div>
                    <div className="text-[11px] text-slate-400">{h.evidence}</div>
                    <div className="mt-2 pt-2 border-t border-slate-700/60 text-[11px] flex justify-between">
                      <span className="text-slate-400">Likelihood:</span>
                      <span className="font-bold text-amber-400">{h.overall_rank_score} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Propositional Logic */}
      {activeTab === "prop" && (
        <div className="space-y-6">
          {/* Rules Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Formal Propositional Knowledge Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
                R1: L ∧ F ∧ S → ReorderUrgent
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
                R2: L ∧ ¬F ∧ S → ReorderNormal
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                R3: P ∧ N ∧ ¬L → Discount
              </div>
              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 font-bold">
                R4: L ∧ ¬S → FindOtherSupplier (Gap Fix)
              </div>
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900">
                R5: ¬L ∧ ¬N ∧ (Stock ≤ 1.25×Reorder) → CheckStock
              </div>
            </div>
          </div>

          {/* Truth Table Tool: Proof that R1 & R3 can NEVER fire together */}
          {truthTable && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <Binary className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Auto-Generated Truth Table: Mutual Exclusion Proof (R1 vs R3)
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {truthTable.is_mutually_exclusive ? "PROVEN: Mutually Exclusive (0 Conflicts)" : "Conflict"}
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                {truthTable.formal_proof}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2">L</th>
                      <th className="p-2">F</th>
                      <th className="p-2">S</th>
                      <th className="p-2">P</th>
                      <th className="p-2">N</th>
                      <th className="p-2 bg-blue-50 text-blue-800">R1 Premise</th>
                      <th className="p-2 bg-amber-50 text-amber-800">R3 Premise</th>
                      <th className="p-2 bg-slate-100 font-bold">Both Fire (R1 ∧ R3)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {truthTable.rows?.slice(0, 10).map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2">{r.L ? "T" : "F"}</td>
                        <td className="p-2">{r.F ? "T" : "F"}</td>
                        <td className="p-2">{r.S ? "T" : "F"}</td>
                        <td className="p-2">{r.P ? "T" : "F"}</td>
                        <td className="p-2">{r.N ? "T" : "F"}</td>
                        <td className={`p-2 ${r.R1 ? "bg-blue-100 font-bold text-blue-900" : "text-slate-400"}`}>
                          {r.R1 ? "TRUE" : "false"}
                        </td>
                        <td className={`p-2 ${r.R3 ? "bg-amber-100 font-bold text-amber-900" : "text-slate-400"}`}>
                          {r.R3 ? "TRUE" : "false"}
                        </td>
                        <td className="p-2 font-bold text-slate-700 bg-slate-50">
                          {r.both ? "CONFLICT" : "FALSE (Safe)"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Gap Finder: L ^ not S */}
          {gapsResult && (
            <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm bg-gradient-to-br from-white to-purple-50/30">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm mb-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Propositional Gap Finder (Discovered Gap Closed by Rule R4)</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">{gapsResult.gap_explanation}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {gapsResult.combinations?.map((c: any, i: number) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border ${
                      c.was_gap
                        ? "bg-purple-100/70 border-purple-300 ring-2 ring-purple-400 text-purple-950 font-medium"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">L={c.L ? "T" : "F"}, F={c.F ? "T" : "F"}, S={c.S ? "T" : "F"}</span>
                      {c.was_gap && (
                        <span className="bg-purple-700 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                          GAP RESOLVED BY R4
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600">{c.state_description}</div>
                    <div className="mt-2 pt-1 border-t border-slate-200/60 text-[11px] flex justify-between font-mono">
                      <span>Before: <span className="line-through text-red-600">{c.action_before_r4}</span></span>
                      <span className="text-emerald-700 font-bold">After: {c.action_after_r4}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules of Inference Demonstration */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Standard Rules of Inference (Propositional Logic)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {inferenceRules.map((ir: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-blue-700">{ir.name}</div>
                  <div className="font-mono text-[11px] bg-white p-1.5 rounded border border-slate-200 text-slate-800">
                    {ir.rule}
                  </div>
                  <div className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed pt-1">
                    {ir.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: First-Order Logic (FOL) */}
      {activeTab === "fol" && (
        <div className="space-y-6">
          {/* Robinson's Unification Algorithm Interactive UI */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>First-Order Unification Algorithm with Occurs-Check</span>
              </h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                Variables: x, y | Constants: Milk1L, Bread
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Term 1 (Operator, Arg1, Arg2):
                </label>
                <input
                  type="text"
                  value={term1}
                  onChange={(e) => setTerm1(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold"
                  placeholder="e.g. Reorder, x, Bread"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Term 2 (Operator, Arg1, Arg2):
                </label>
                <input
                  type="text"
                  value={term2}
                  onChange={(e) => setTerm2(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold"
                  placeholder="e.g. Reorder, Milk1L, y"
                />
              </div>
            </div>

            <button
              onClick={handleUnify}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition"
            >
              Run Robinson's Unification
            </button>

            {unifyResult && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Most General Unifier (MGU θ):</span>
                  <span className="font-mono font-bold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {unifyResult.formatted_result}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-500 space-y-0.5 pt-2 border-t border-slate-200">
                  {unifyResult.trace?.map((t: string, i: number) => (
                    <div key={i}>{t}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resolution Refutation Proving ReorderUrgent(Milk1L) */}
          {resolutionResult && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Binary className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    First-Order Resolution Refutation: Prove ReorderUrgent(Milk1L)
                  </h3>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                  Empty Clause Derived (□)
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {resolutionResult.conclusion}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Step</th>
                      <th className="p-2.5">Parent Clauses</th>
                      <th className="p-2.5">MGU Unifier</th>
                      <th className="p-2.5">Resolvent Clause</th>
                      <th className="p-2.5">Inference Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resolutionResult.steps?.map((st: any) => (
                      <tr key={st.step} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-blue-700">R{st.step}</td>
                        <td className="p-2.5">{st.parent1} + {st.parent2}</td>
                        <td className="p-2.5 text-purple-700 font-semibold">{st.unifier || "{}"}</td>
                        <td className="p-2.5 font-bold text-slate-900">{st.resolvent}</td>
                        <td className="p-2.5 text-slate-500 font-sans text-[11px]">{st.explanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Why Group Rules need FOL */}
          {quantifiersData && (
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm text-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-100">{quantifiersData.title}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <span className="text-red-400 font-bold block mb-1">Propositional Limitation:</span>
                  <p className="text-slate-300 leading-relaxed">{quantifiersData.propositional_drawback}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <span className="text-emerald-400 font-bold block mb-1">FOL Advantage (Quantifiers ∀x, ∃x):</span>
                  <p className="text-slate-300 leading-relaxed">{quantifiersData.fol_advantage}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Forward and Backward Chaining */}
      {activeTab === "chaining" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Forward Chaining Panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                  <span>Forward Chaining (Data-Driven Inference)</span>
                </h3>
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                  Daily Store Cycle
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Fires all matching production rules from Working Memory facts, producing today's conclusions:
              </p>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {forwardChainingData?.conclusions?.map((c: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">{c.product_name} ({c.action})</div>
                      <div className="text-[11px] text-slate-500 font-mono">{c.rule_fired}</div>
                    </div>
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                      {c.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Backward Chaining Panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  <span>Backward Chaining (Goal-Driven "Why?" Inference)</span>
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  Explanation Facility
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Goal Hypothesis:</label>
                  <select
                    value={backwardGoal}
                    onChange={(e) => setBackwardGoal(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800"
                  >
                    <option value="ReorderUrgent">ReorderUrgent</option>
                    <option value="ReorderNormal">ReorderNormal</option>
                    <option value="Discount">Discount</option>
                    <option value="FindOtherSupplier">FindOtherSupplier</option>
                    <option value="CheckStock">CheckStock</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Product:</label>
                  <select
                    value={backwardProduct}
                    onChange={(e) => setBackwardProduct(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800"
                  >
                    <option value="P1">P1 - Milk1L</option>
                    <option value="P2">P2 - Bread</option>
                    <option value="P3">P3 - Eggs (tray)</option>
                    <option value="P4">P4 - Curd 500g</option>
                    <option value="P7">P7 - Detergent</option>
                  </select>
                </div>
              </div>

              {backwardResult?.proof_tree && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                  <div className={`p-2.5 rounded-lg border font-bold flex items-center justify-between ${
                    backwardResult.proof_tree.proved
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : "bg-red-50 border-red-300 text-red-900"
                  }`}>
                    <span>Goal: {backwardResult.proof_tree.goal}</span>
                    <span>{backwardResult.proof_tree.proved ? "PROVEN" : "FAILED"}</span>
                  </div>

                  <div className="space-y-1.5 font-mono text-[11px]">
                    {backwardResult.proof_tree.subgoals?.map((sg: any, i: number) => (
                      <div key={i} className="p-2 bg-white rounded border border-slate-200 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-800">{sg.subgoal}</span>
                          <div className="text-slate-400 text-[10px]">{sg.condition}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sg.satisfied ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>
                          {sg.satisfied ? "TRUE" : "FALSE"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Frame Representation System */}
      {activeTab === "frames" && (
        <div className="space-y-6">
          {/* Frame Editor Banner */}
          <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm bg-gradient-to-r from-blue-50/50 to-indigo-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Single-Point Default Inheritance Mutation (Seasonal Rule Changes)</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Edit Product.reorder_level default in ONE place. Watch inheriting instances instantly update!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Product.reorder_level default:</span>
              <button
                onClick={() => handleUpdateFrameDefault(20)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  productDefaultReorder === 20 ? "bg-blue-600 text-white" : "bg-white border text-slate-700"
                }`}
              >
                Normal (20)
              </button>
              <button
                onClick={() => handleUpdateFrameDefault(30)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  productDefaultReorder === 30 ? "bg-amber-600 text-white" : "bg-white border text-slate-700"
                }`}
              >
                Festival (30)
              </button>
            </div>
          </div>

          {/* Inspect Product Frame */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Inspect Frame Slots: Own vs Inherited vs If-Needed Demons
                </h3>
              </div>

              <select
                value={selectedFrameProduct}
                onChange={(e) => setSelectedFrameProduct(e.target.value)}
                className="text-xs p-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800"
              >
                <option value="P1">P1 - Milk1L (Perishable)</option>
                <option value="P2">P2 - Bread (Perishable)</option>
                <option value="P5">P5 - Rice 5kg (Non-Perishable)</option>
                <option value="P7">P7 - Detergent (Non-Perishable)</option>
              </select>
            </div>

            {productFrameInspection?.slots && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Slot Name</th>
                      <th className="p-3">Value</th>
                      <th className="p-3">Source Type</th>
                      <th className="p-3">Inheritance Origin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(productFrameInspection.slots).map(([slotKey, slotData]: any) => {
                      let typeColor = "bg-slate-100 text-slate-700";
                      if (slotData.source === "own") typeColor = "bg-green-100 text-green-800 font-semibold";
                      if (slotData.source === "inherited") typeColor = "bg-blue-100 text-blue-800 font-semibold";
                      if (slotData.source === "computed") typeColor = "bg-purple-100 text-purple-800 font-semibold";

                      return (
                        <tr key={slotKey} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-800">{slotKey}</td>
                          <td className="p-3 font-mono text-slate-900 font-bold">
                            {String(slotData.value)}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${typeColor}`}>
                              {slotData.source}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">{slotData.origin}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Semantic Network */}
      {activeTab === "semantic" && (
        <div className="space-y-6">
          {/* Natural Query Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Semantic Graph Traversal Query Engine</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Query Type:</label>
                <select
                  value={netQueryType}
                  onChange={(e) => setNetQueryType(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800"
                >
                  <option value="is_perishable">"Is [Product] perishable?" (is-a traversal)</option>
                  <option value="supplier_products">"Which products does [Supplier] supply?"</option>
                  <option value="incompatible_with_cleaning">"What can't share a rack with Cleaning?"</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Parameter:</label>
                <input
                  type="text"
                  value={netQueryParam}
                  onChange={(e) => setNetQueryParam(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleRunNetQuery}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition"
                >
                  Traverse &amp; Answer
                </button>
              </div>
            </div>

            {netQueryResult && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
                <div className="font-bold text-emerald-950 text-sm">
                  Answer: {netQueryResult.answer}
                </div>
                <div className="text-[11px] font-mono text-emerald-800">
                  Highlighted Graph Path: {netQueryResult.highlighted_nodes?.join(" → ")}
                </div>
              </div>
            )}
          </div>

          {/* Association Mining (Bought-With induction) */}
          {basketAssociations && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Inductive Learning: Bought-Together Rules Mined from 10 Baskets
                </h3>
                <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded">
                  Top: Bread &amp; Milk1L (Support 4/10)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {basketAssociations.rules?.slice(0, 6).map((rule: any, i: number) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-800">{rule.rule}</div>
                    <div className="text-[11px] text-slate-500">Support: <span className="font-bold">{rule.support}</span></div>
                    <div className="text-[11px] text-slate-500">Confidence: <span className="font-bold">{rule.confidence_a_to_b}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Semantic Net vs Frames Comparison */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Semantic Networks vs Frame Representation (Comparative Table)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Evaluation Dimension</th>
                    <th className="p-3 text-blue-700">Semantic Networks</th>
                    <th className="p-3 text-purple-700">Frame Systems</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {netVsFrameComp.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{row.dimension}</td>
                      <td className="p-3 text-slate-600 text-[11px]">{row.semantic_net}</td>
                      <td className="p-3 text-slate-600 text-[11px]">{row.frames}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
