import React, { useEffect, useState } from "react";
import {
  Package, AlertTriangle, Clock, ShoppingCart, Users, Play, Download,
  CheckCircle, ArrowUpRight, HelpCircle, Activity, ShieldCheck
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { api } from "../services/api";
import { ProofTreeModal } from "../components/ProofTreeModal";

interface DashboardProps {
  festivalSeason: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ festivalSeason }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [inferenceData, setInferenceData] = useState<any>(null);
  const [agentType, setAgentType] = useState<string>("goal");
  const [selectedProduct, setSelectedProduct] = useState<string>("P1");
  const [agentTrace, setAgentTrace] = useState<any>(null);
  const [peasData, setPeasData] = useState<any>(null);
  const [showPeas, setShowPeas] = useState<boolean>(false);
  const [proofModalData, setProofModalData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, inf, peas] = await Promise.all([
        api.getProducts(),
        api.forwardInference(),
        api.getPeas()
      ]);
      setProducts(prods);
      setInferenceData(inf);
      setPeasData(peas);

      // Run agent for default selected product
      const trace = await api.runAgent(agentType, "P1");
      setAgentTrace(trace);
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [festivalSeason]);

  const handleAgentTypeChange = async (type: string) => {
    setAgentType(type);
    try {
      const trace = await api.runAgent(type, selectedProduct);
      setAgentTrace(trace);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductSelect = async (pId: string) => {
    setSelectedProduct(pId);
    try {
      const trace = await api.runAgent(agentType, pId);
      setAgentTrace(trace);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunAgent = async () => {
    await loadData();
  };

  const handleWhyClick = async (productId: string, action: string) => {
    let goal = "ReorderUrgent";
    if (action === "reorder_normal") goal = "ReorderNormal";
    if (action === "discount") goal = "Discount";
    if (action === "find_other_supplier") goal = "FindOtherSupplier";
    if (action === "check_stock") goal = "CheckStock";

    try {
      const proof = await api.backwardInference(productId, goal);
      setProofModalData(proof);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    if (!inferenceData || !inferenceData.agenda) return;
    const headers = ["Product ID", "Product Name", "Action", "Rule Fired", "Confidence", "Reason"];
    const rows = inferenceData.agenda.map((item: any) => [
      item.product_id,
      `"${item.product_name}"`,
      item.action,
      `"${item.rule_fired}"`,
      item.confidence,
      `"${item.reason.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smartstock_recommendations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart data: 12 products with current stock vs reorder_level
  const chartData = products.map((p) => {
    const effectiveReorder = festivalSeason ? Math.round(p.reorder_level * 1.5) : p.reorder_level;
    return {
      name: p.name,
      stock: p.stock,
      reorder_level: effectiveReorder,
      isLow: p.stock < effectiveReorder
    };
  });

  const counts = inferenceData?.summary_counts || {
    urgent: 0,
    normal: 0,
    discount: 0,
    find_supplier: 0,
    check_stock: 0
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Concept: Intelligent Agents (PEAS) & Rule-Based Recommendation
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Store Inventory Intelligence Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time percept-decision cycle tracking 12 SKUs with goal-driven autonomous replenishment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunAgent}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Run Agent Loop</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total SKUs</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">12</div>
          <div className="text-[11px] text-slate-400 mt-1">Sample grocer catalog</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
          <div className="flex items-center justify-between text-red-600 text-xs font-semibold">
            <span>Urgent Reorders</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 mt-2">{counts.urgent}</div>
          <div className="text-[11px] text-red-400 mt-1">R1: Stock &lt; Safe Buffer</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between text-blue-600 text-xs font-semibold">
            <span>Normal Reorders</span>
            <ShoppingCart className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{counts.normal}</div>
          <div className="text-[11px] text-blue-400 mt-1">R2: Slow-moving deficit</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 text-xs font-semibold">
            <span>Near-Expiry Clearance</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{counts.discount}</div>
          <div className="text-[11px] text-amber-500 mt-1">R3: Markdown 20% applied</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
          <div className="flex items-center justify-between text-purple-600 text-xs font-semibold">
            <span>Supplier Gaps</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-2">{counts.find_supplier}</div>
          <div className="text-[11px] text-purple-500 mt-1">R4: Missing supplier (Eggs)</div>
        </div>
      </div>

      {/* Stock Levels Chart & Agent Architecture Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Current Stock vs Reorder Level (12 Products)</h3>
                <p className="text-xs text-slate-500">Bars highlighted in red indicate stock falling below safety thresholds.</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500 inline-block"></span> Normal</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500 inline-block"></span> Low Stock</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                            <div className="font-bold">{data.name}</div>
                            <div>Current Stock: <span className="font-semibold text-blue-300">{data.stock}</span></div>
                            <div>Reorder Level: <span className="font-semibold text-amber-300">{data.reorder_level}</span></div>
                            <div className={data.isLow ? "text-red-400 font-semibold" : "text-emerald-400"}>
                              {data.isLow ? "CRITICAL: Below Safety Buffer" : "ADEQUATE: Safe Level"}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="stock"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    shape={(props: any) => {
                      const { x, y, width, height, payload } = props;
                      const fillColor = payload.isLow ? "#ef4444" : "#3b82f6";
                      return <rect x={x} y={y} width={width} height={height} fill={fillColor} rx={4} ry={4} />;
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* M1 Agent Simulator Column */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">M1: Intelligent Agent Simulator</h3>
              </div>
              <button
                onClick={() => setShowPeas(!showPeas)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showPeas ? "Hide PEAS" : "PEAS Spec"}</span>
              </button>
            </div>

            {/* Agent Type Selector */}
            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Select Agent Architecture:
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: "reflex", label: "Simple Reflex" },
                  { id: "model", label: "Model-Based" },
                  { id: "goal", label: "Goal-Based (Chosen)", badge: "Core" },
                  { id: "utility", label: "Utility-Based", badge: "Next" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleAgentTypeChange(t.id)}
                    className={`py-1.5 px-2 rounded-lg font-medium text-left transition flex items-center justify-between border ${
                      agentType === t.id
                        ? "bg-blue-50 border-blue-400 text-blue-800"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{t.label}</span>
                    {t.badge && (
                      <span className="text-[9px] bg-blue-200 text-blue-900 px-1 py-0.2 rounded font-bold">
                        {t.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Percept Selector */}
            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Test SKU Percepts:
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category}) - Stock: {p.stock}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Agent Deliberation Trace */}
            {agentTrace && (
              <div className="mt-3 bg-slate-900 text-slate-200 p-3 rounded-xl text-xs space-y-1.5 font-mono">
                <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">
                  Sense -&gt; Deliberate -&gt; Act Loop
                </div>
                <div className="text-slate-400 text-[11px]">
                  Percepts: Stock={agentTrace.percepts?.current_stock}, Velocity={agentTrace.percepts?.daily_sales}/day
                </div>
                <div className="text-emerald-400 font-semibold">
                  Action: {agentTrace.decision?.chosen_action}
                </div>
                <div className="text-slate-300 text-[11px] leading-snug">
                  {agentTrace.decision?.reason}
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Deterministic state-space deliberation. Seed: 42.</span>
          </div>
        </div>
      </div>

      {/* PEAS Framework Modal / Accordion */}
      {showPeas && peasData && (
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              PEAS Formal Specification Table (Module 1)
            </h3>
            <button onClick={() => setShowPeas(false)} className="text-xs text-slate-500 hover:text-slate-800 font-medium">
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs mb-4">
            {peasData.elements?.map((el: any) => (
              <div key={el.abbreviation} className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
                    {el.abbreviation}
                  </span>
                  <span className="font-bold text-slate-800">{el.dimension}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{el.description}</p>
              </div>
            ))}
          </div>

          <div className="text-xs">
            <div className="font-bold text-slate-700 mb-1.5">Environment Typology (Russell &amp; Norvig Classification):</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {peasData.environment_properties?.map((prop: any, idx: number) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-100 text-[11px]">
                  <span className="font-bold text-slate-800">{prop.value}:</span>{" "}
                  <span className="text-slate-600">{prop.reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Forward Chaining Recommendations &amp; Explanations</h2>
            <p className="text-xs text-slate-500">Every decision is logically deduced from Working Memory facts with full backward-chaining proof.</p>
          </div>
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Total Conclusions: <span className="text-blue-600 font-bold">{inferenceData?.total_conclusions || 11}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stock / Reorder</th>
                <th className="px-4 py-3">Action Badge</th>
                <th className="px-4 py-3">Rule Fired</th>
                <th className="px-4 py-3">Explanation</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3 text-right">Why?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {inferenceData?.agenda?.map((item: any) => {
                const prod = products.find((p) => p.id === item.product_id) || {};
                const effectiveReorder = festivalSeason ? Math.round((prod.reorder_level || 20) * 1.5) : prod.reorder_level;

                let badgeColor = "bg-slate-100 text-slate-700";
                if (item.action === "reorder_urgent") badgeColor = "bg-red-100 text-red-700 border border-red-300 font-semibold";
                if (item.action === "reorder_normal") badgeColor = "bg-blue-100 text-blue-700 border border-blue-300 font-semibold";
                if (item.action === "discount") badgeColor = "bg-amber-100 text-amber-700 border border-amber-300 font-semibold";
                if (item.action === "find_other_supplier") badgeColor = "bg-purple-100 text-purple-700 border border-purple-300 font-semibold";
                if (item.action === "check_stock") badgeColor = "bg-teal-100 text-teal-700 border border-teal-300 font-semibold";

                return (
                  <tr key={item.product_id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {item.product_name}
                      <span className="text-[10px] text-slate-400 block font-mono">{item.product_id}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{prod.category || "-"}</td>
                    <td className="px-4 py-3 font-mono">
                      <span className={prod.stock < effectiveReorder ? "text-red-600 font-bold" : "text-slate-800"}>
                        {prod.stock}
                      </span>{" "}
                      / {effectiveReorder}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] inline-block ${badgeColor}`}>
                        {item.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-700 font-medium">{item.rule_fired}</td>
                    <td className="px-4 py-3 max-w-xs text-[11px] text-slate-600 leading-snug">{item.reason}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        {item.confidence}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.action !== "no_action" ? (
                        <button
                          onClick={() => handleWhyClick(item.product_id, item.action)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <span>Why?</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Ample</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Tree Modal for Explainability */}
      <ProofTreeModal
        isOpen={!!proofModalData}
        onClose={() => setProofModalData(null)}
        data={proofModalData}
      />
    </div>
  );
};
