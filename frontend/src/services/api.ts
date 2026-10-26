/**
 * SmartStock AI - Frontend API Service
 * Communicates with FastAPI backend endpoints.
 */

const BASE_URL = "/api";

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    },
    ...options
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export const api = {
  // Products
  getProducts: () => fetchJson<any[]>("/products"),
  updateProduct: (id: string, updates: any) =>
    fetchJson<any>(`/products/${id}`, { method: "PUT", body: JSON.stringify(updates) }),
  resetProducts: () => fetchJson<any>("/products/reset", { method: "POST" }),

  // Agent (M1)
  getPeas: () => fetchJson<any>("/agent/peas"),
  runAgent: (agentType: string = "goal", productId?: string) =>
    fetchJson<any>(`/agent/run?agent_type=${agentType}${productId ? `&product_id=${productId}` : ""}`, { method: "POST" }),

  // Reorder Search (M2)
  searchReorder: (productId: string) =>
    fetchJson<any>(`/reorder/search?product_id=${productId}`, { method: "POST" }),

  // Route & Suppliers (M3)
  searchRoute: (algo: string, startNode: string = "A") =>
    fetchJson<any>(`/route/${algo}?start_node=${startNode}`, { method: "POST" }),
  verifyHeuristics: () => fetchJson<any>("/route/verify-heuristics"),
  scoreSupplier: (productId: string, wPrice = 0.4, wDist = 0.25, wDeliv = 0.2, wRel = 0.15) =>
    fetchJson<any>(`/supplier/score?product_id=${productId}&w_price=${wPrice}&w_dist=${wDist}&w_delivery=${wDeliv}&w_rel=${wRel}`, { method: "POST" }),
  solveAOStar: () => fetchJson<any>("/aostar", { method: "POST" }),

  // Constraints CSP (M4)
  solveCSP: (budget = 15000, capacity = 400) =>
    fetchJson<any>(`/csp/solve?daily_budget=${budget}&warehouse_capacity=${capacity}`, { method: "POST" }),

  // Negotiation Game Tree (M5)
  solveNegotiation: (algo: string, leaves?: number[]) =>
    fetchJson<any>(`/negotiation/${algo}`, {
      method: "POST",
      body: leaves ? JSON.stringify(leaves) : undefined
    }),

  // Warehouse Puzzles (M6)
  solvePuzzle: (puzzleName: string) =>
    fetchJson<any>(`/puzzles/${puzzleName}`, { method: "POST" }),

  // Shelf Allocation Local Search (M7)
  optimizeShelf: (forceScramble = false, seed = 42) =>
    fetchJson<any>(`/shelf/optimize?force_scramble=${forceScramble}&seed=${seed}`, { method: "POST" }),
  solveQueens: (n = 8, seed = 42) =>
    fetchJson<any>(`/queens?n=${n}&seed=${seed}`, { method: "POST" }),

  // Restocking Route TSP (M8)
  solveTSP: (mode: string) =>
    fetchJson<any>(`/tsp/${mode}`, { method: "POST" }),

  // Knowledge Base (M9)
  getTruthTable: () => fetchJson<any>("/logic/truthtable"),
  getGaps: () => fetchJson<any>("/logic/gaps"),
  getInferenceRules: () => fetchJson<any>("/logic/inference-rules"),
  unify: (term1: string[], term2: string[]) =>
    fetchJson<any>("/logic/unify", { method: "POST", body: JSON.stringify({ term1, term2 }) }),
  resolveRefutation: () => fetchJson<any>("/logic/resolve", { method: "POST" }),
  getQuantifiers: () => fetchJson<any>("/logic/quantifiers"),

  // Chaining
  forwardInference: () => fetchJson<any>("/inference/forward", { method: "POST" }),
  backwardInference: (productId: string, goal: string) =>
    fetchJson<any>(`/inference/backward?product_id=${productId}&goal=${goal}`, { method: "POST" }),

  // Frames
  getFrames: (productId?: string) =>
    fetchJson<any>(`/frames${productId ? `?product_id=${productId}` : ""}`),
  updateFrameDefault: (className: string, slotName: string, newValue: any) =>
    fetchJson<any>(`/frames/default?class_name=${className}&slot_name=${slotName}&new_value=${newValue}`, { method: "PUT" }),

  // Semantic Net
  getSemanticNet: () => fetchJson<any>("/semantic-net"),
  querySemanticNet: (queryType: string, param: string) =>
    fetchJson<any>(`/semantic-net/query?query_type=${queryType}&param=${param}`, { method: "POST" }),
  getAssociations: () => fetchJson<any>("/semantic-net/associations"),
  getComparison: () => fetchJson<any>("/semantic-net/comparison"),

  // Reasoning & Abduction
  getKnowledgeTypes: () => fetchJson<any>("/reasoning/types"),
  runAbduction: (name = "Milk1L", prev = 40, curr = 14) =>
    fetchJson<any>(`/reasoning/abduction?product_name=${name}&prev_stock=${prev}&curr_stock=${curr}`, { method: "POST" }),

  // Festival Season Toggle
  toggleFestival: (enabled: boolean) =>
    fetchJson<any>(`/festival/toggle?enabled=${enabled}`, { method: "POST" }),

  // Results & Reports (M11)
  getResultsSummary: () => fetchJson<any>("/results/summary")
};
