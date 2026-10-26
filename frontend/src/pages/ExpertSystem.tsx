import React, { useState, useEffect } from "react";
import {
  Cpu, Database, Layers, Monitor, HelpCircle, Play, Sparkles,
  ArrowRight, CheckCircle2, RotateCcw, AlertTriangle, ShieldCheck
} from "lucide-react";
import { api } from "../services/api";
import { ProofTreeModal } from "../components/ProofTreeModal";

interface ExpertSystemProps {
  festivalSeason: boolean;
  onToggleFestival: (enabled: boolean) => void;
}

export const ExpertSystem: React.FC<ExpertSystemProps> = ({
  festivalSeason,
  onToggleFestival
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [inferenceResult, setInferenceResult] = useState<any>(null);
  const [activeComponent, setActiveComponent] = useState<string>("Inference Engine");
  const [proofModalData, setProofModalData] = useState<any>(null);
  const [isInferring, setIsInferring] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [prods, inf] = await Promise.all([
        api.getProducts(),
        api.forwardInference()
      ]);
      setProducts(prods);
      setInferenceResult(inf);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [festivalSeason]);

  const handleStockChange = async (id: string, newStock: number) => {
    try {
      await api.updateProduct(id, { stock: newStock });
      const updatedProds = await api.getProducts();
      setProducts(updatedProds);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSalesChange = async (id: string, newSales: number) => {
    try {
      await api.updateProduct(id, { daily_sales: newSales });
      const updatedProds = await api.getProducts();
      setProducts(updatedProds);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetCatalog = async () => {
    await api.resetProducts();
    await loadData();
  };

  const handleRunInference = async () => {
    setIsInferring(true);
    setActiveComponent("Inference Engine (Executing Production Rules)");
    try {
      const res = await api.forwardInference();
      setInferenceResult(res);
      setTimeout(() => {
        setActiveComponent("Explanation Facility");
        setIsInferring(false);
      }, 600);
    } catch (err) {
      console.error(err);
      setIsInferring(false);
    }
  };

  const handleWhy = async (productId: string, action: string) => {
    let goal = "ReorderUrgent";
    if (action === "reorder_normal") goal = "ReorderNormal";
    if (action === "discount") goal = "Discount";
    if (action === "find_other_supplier") goal = "FindOtherSupplier";
    if (action === "check_stock") goal = "CheckStock";

    const proof = await api.backwardInference(productId, goal);
    setProofModalData(proof);
  };

  const grouped = inferenceResult?.grouped_recommendations || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Module 10: Rule-Based Expert System Architecture
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Expert System &amp; Shop Owner Workstation</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Architecture with live active component tracing, editable working memory, and explainability.
          </p>
        </div>

        {/* Global Festival Toggle Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleFestival(!festivalSeason)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              festivalSeason
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Festival Season: {festivalSeason ? "ACTIVATED (+50% Demand)" : "OFF"}</span>
          </button>

          <button
            onClick={handleRunInference}
            disabled={isInferring}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Run Inference</span>
          </button>
        </div>
      </div>

      {/* Live Expert System Architecture Diagram */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100">Live Expert System Architecture (5 Classical Components)</h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
            Active: {activeComponent}
          </span>
        </div>

        {/* Architecture Blocks Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center text-xs">
          {/* 1. Knowledge Base */}
          <div className="p-4 rounded-xl bg-slate-800/90 border border-blue-500/30 flex flex-col items-center justify-between h-32">
            <Database className="w-6 h-6 text-blue-400 mb-1" />
            <div>
              <span className="font-bold text-slate-100 block">1. Knowledge Base</span>
              <span className="text-[10px] text-slate-400">Rules R1-R5, Frames &amp; Constraints</span>
            </div>
            <span className="text-[9px] bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded font-mono">Domain Facts</span>
          </div>

          {/* 2. Inference Engine */}
          <div className={`p-4 rounded-xl border flex flex-col items-center justify-between h-32 transition-all ${
            isInferring
              ? "bg-blue-600 border-blue-400 ring-2 ring-blue-400 animate-pulse"
              : "bg-slate-800/90 border-slate-700"
          }`}>
            <Cpu className="w-6 h-6 text-amber-400 mb-1" />
            <div>
              <span className="font-bold text-slate-100 block">2. Inference Engine</span>
              <span className="text-[10px] text-slate-400">Forward &amp; Backward Chaining</span>
            </div>
            <span className="text-[9px] bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded font-mono">Modus Ponens</span>
          </div>

          {/* 3. Working Memory */}
          <div className="p-4 rounded-xl bg-slate-800/90 border border-emerald-500/30 flex flex-col items-center justify-between h-32">
            <Layers className="w-6 h-6 text-emerald-400 mb-1" />
            <div>
              <span className="font-bold text-slate-100 block">3. Working Memory</span>
              <span className="text-[10px] text-slate-400">Today's 12-Product Stock Sheet</span>
            </div>
            <span className="text-[9px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-mono">Current State</span>
          </div>

          {/* 4. Explanation Facility */}
          <div className="p-4 rounded-xl bg-slate-800/90 border border-purple-500/30 flex flex-col items-center justify-between h-32">
            <HelpCircle className="w-6 h-6 text-purple-400 mb-1" />
            <div>
              <span className="font-bold text-slate-100 block">4. Explanation Facility</span>
              <span className="text-[10px] text-slate-400">Proof Trees &amp; Justifications</span>
            </div>
            <span className="text-[9px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded font-mono">Backward Proof</span>
          </div>

          {/* 5. User Interface */}
          <div className="p-4 rounded-xl bg-slate-800/90 border border-teal-500/30 flex flex-col items-center justify-between h-32">
            <Monitor className="w-6 h-6 text-teal-400 mb-1" />
            <div>
              <span className="font-bold text-slate-100 block">5. User Interface</span>
              <span className="text-[10px] text-slate-400">Shop Owner Workstation</span>
            </div>
            <span className="text-[9px] bg-teal-900/60 text-teal-300 px-2 py-0.5 rounded font-mono">Interactive Web</span>
          </div>
        </div>
      </div>

      {/* Shop Owner Screen: Editable Working Memory Stock Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today's Working Memory Stock Sheet (Editable)</h2>
            <p className="text-xs text-slate-500">Edit current stock or sales velocity in real-time, then press "Run Inference" to watch the expert system adapt.</p>
          </div>
          <button
            onClick={handleResetCatalog}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sample Data</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 font-bold uppercase text-[10px] border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-3">SKU ID</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Reorder Threshold</th>
                <th className="p-3">Daily Sales Rate</th>
                <th className="p-3">Days to Expiry</th>
                <th className="p-3">Suppliers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const effectiveThreshold = festivalSeason ? Math.round(p.reorder_level * 1.5) : p.reorder_level;
                const effectiveSales = festivalSeason ? Math.round(p.daily_sales * 1.5) : p.daily_sales;

                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-800">{p.id}</td>
                    <td className="p-3 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3 text-slate-500">{p.category}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={p.stock}
                        onChange={(e) => handleStockChange(p.id, Number(e.target.value))}
                        className={`w-16 p-1 text-center font-bold font-mono rounded border ${
                          p.stock < effectiveThreshold ? "border-red-400 bg-red-50 text-red-700" : "border-slate-300"
                        }`}
                      />
                    </td>
                    <td className="p-3 font-mono">
                      {effectiveThreshold}{" "}
                      {festivalSeason && <span className="text-[10px] text-amber-600 font-bold">(+50%)</span>}
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={effectiveSales}
                        onChange={(e) => handleSalesChange(p.id, Number(e.target.value))}
                        className="w-16 p-1 text-center font-bold font-mono rounded border border-slate-300"
                      />
                    </td>
                    <td className="p-3 font-mono">
                      {p.days_to_expiry !== null ? (
                        <span className={p.days_to_expiry <= 2 ? "text-amber-600 font-bold" : ""}>
                          {p.days_to_expiry} days
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      {p.suppliers?.length > 0 ? (
                        p.suppliers.map((s: any) => s.supplier_id).join(", ")
                      ) : (
                        <span className="text-red-600 font-bold">None (Gap)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations Grouped by Action */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Inference Results Grouped by Operational Action (Total: {inferenceResult?.total_conclusions || 11})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Urgent Reorder Group */}
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-2">
            <span className="font-bold text-red-900 flex items-center justify-between">
              <span>Urgent Reorders (Rule R1)</span>
              <span className="bg-red-200 text-red-900 px-2 py-0.5 rounded text-[10px]">
                {grouped.reorder_urgent?.length || 0} Items
              </span>
            </span>
            <div className="space-y-1.5">
              {grouped.reorder_urgent?.map((item: any) => (
                <div key={item.product_id} className="p-2 bg-white rounded-lg border border-red-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">{item.product_name}</span>
                    <div className="text-[10px] text-slate-500">{item.reason}</div>
                  </div>
                  <button
                    onClick={() => handleWhy(item.product_id, item.action)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                  >
                    Why?
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Normal Reorder Group */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
            <span className="font-bold text-blue-900 flex items-center justify-between">
              <span>Normal Reorders (Rule R2)</span>
              <span className="bg-blue-200 text-blue-900 px-2 py-0.5 rounded text-[10px]">
                {grouped.reorder_normal?.length || 0} Items
              </span>
            </span>
            <div className="space-y-1.5">
              {grouped.reorder_normal?.map((item: any) => (
                <div key={item.product_id} className="p-2 bg-white rounded-lg border border-blue-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">{item.product_name}</span>
                    <div className="text-[10px] text-slate-500">{item.reason}</div>
                  </div>
                  <button
                    onClick={() => handleWhy(item.product_id, item.action)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                  >
                    Why?
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Discount Clearance Group */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
            <span className="font-bold text-amber-900 flex items-center justify-between">
              <span>Shelf Clearance Markdown (Rule R3)</span>
              <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px]">
                {grouped.discount?.length || 0} Items
              </span>
            </span>
            <div className="space-y-1.5">
              {grouped.discount?.map((item: any) => (
                <div key={item.product_id} className="p-2 bg-white rounded-lg border border-amber-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">{item.product_name}</span>
                    <div className="text-[10px] text-slate-500">{item.reason}</div>
                  </div>
                  <button
                    onClick={() => handleWhy(item.product_id, item.action)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                  >
                    Why?
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Find Supplier & Checks Group */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
            <span className="font-bold text-purple-900 flex items-center justify-between">
              <span>Supplier Gap (R4) &amp; Stock Checks (R5)</span>
              <span className="bg-purple-200 text-purple-900 px-2 py-0.5 rounded text-[10px]">
                {(grouped.find_other_supplier?.length || 0) + (grouped.check_stock?.length || 0)} Items
              </span>
            </span>
            <div className="space-y-1.5">
              {grouped.find_other_supplier?.map((item: any) => (
                <div key={item.product_id} className="p-2 bg-white rounded-lg border border-purple-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">{item.product_name}</span>
                    <div className="text-[10px] text-purple-700 font-semibold">{item.reason}</div>
                  </div>
                  <button
                    onClick={() => handleWhy(item.product_id, item.action)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                  >
                    Why?
                  </button>
                </div>
              ))}
              {grouped.check_stock?.map((item: any) => (
                <div key={item.product_id} className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">{item.product_name}</span>
                    <div className="text-[10px] text-slate-500">{item.reason}</div>
                  </div>
                  <button
                    onClick={() => handleWhy(item.product_id, item.action)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                  >
                    Why?
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ProofTreeModal
        isOpen={!!proofModalData}
        onClose={() => setProofModalData(null)}
        data={proofModalData}
      />
    </div>
  );
};
