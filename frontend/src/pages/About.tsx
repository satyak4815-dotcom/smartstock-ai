import React from "react";
import { Users, BookOpen, GraduationCap, Award, ArrowUpRight, CheckCircle2 } from "lucide-react";

export const About: React.FC = () => {
  const syllabusMap = [
    {
      page: "Dashboard",
      route: "/",
      topic: "Intelligent Agents, PEAS Framework, Rule-Based Recommendations",
      report: "Report I & II",
      unit: "Unit 1: Introduction to Agents & Rule Engines"
    },
    {
      page: "Reorder Search",
      route: "/reorder",
      topic: "Formal State-Space Problem Formulation, Uniform-Cost Search (UCS)",
      report: "Report I",
      unit: "Unit 2: Uninformed Search & State Space"
    },
    {
      page: "Supplier & Route Search",
      route: "/route",
      topic: "BFS, DFS, IDS, Bidirectional Search, A*, AO* on AND-OR Graph, Heuristic Admissibility",
      report: "Report I",
      unit: "Unit 2 & 3: Informed Search & AND-OR Heuristics"
    },
    {
      page: "Constraints (CSP)",
      route: "/csp",
      topic: "Constraint Satisfaction Problems, Backtracking, Forward Checking, MRV Heuristic",
      report: "Report I",
      unit: "Unit 3: Constraint Satisfaction Problems"
    },
    {
      page: "Negotiation Game Tree",
      route: "/negotiation",
      topic: "Adversarial Search, Two-Player Zero-Sum Games, Minimax, Alpha-Beta Pruning",
      report: "Report I",
      unit: "Unit 3: Game Playing & Adversarial Search"
    },
    {
      page: "Warehouse Puzzles",
      route: "/puzzles",
      topic: "Classic Problem Solving: Water-Jug, Missionaries & Cannibals, STRIPS Planning, 8-Tiles A*",
      report: "Report II",
      unit: "Unit 2 & 4: Classic AI Problem Formulations & Planning"
    },
    {
      page: "Shelf Allocation",
      route: "/shelf",
      topic: "Local Search, Hill Climbing, Sideways Moves, Plateau Perturbations, N-Queens Analogue",
      report: "Report II",
      unit: "Unit 2: Local Search & Optimization"
    },
    {
      page: "Restocking Route (TSP)",
      route: "/tsp",
      topic: "Travelling Salesperson Problem, Exhaustive Factorial Permutations, Nearest-Neighbour Heuristic",
      report: "Report II",
      unit: "Unit 2: Search in Complex Graphs"
    },
    {
      page: "Knowledge Base",
      route: "/knowledge",
      topic: "Propositional Logic, Truth Tables, FOL Unification with Occurs-Check, Resolution Refutation, Forward/Backward Chaining, Frames, Semantic Networks",
      report: "Report II",
      unit: "Unit 4: Knowledge Representation & Formal Logic"
    },
    {
      page: "Expert System",
      route: "/expert-system",
      topic: "Expert System 5-Component Architecture, Working Memory, Festival Heuristics, Explainability",
      report: "Report II",
      unit: "Unit 5: Expert Systems & Rule Engines"
    },
    {
      page: "Reports & Results",
      route: "/reports",
      topic: "Review 2 Empirical Validation, Challenges & Fixes Synthesis, Progress Metric",
      report: "Report II",
      unit: "Evaluation & Course Milestone Synthesis"
    }
  ];

  const teamMembers = [
    { name: "Rudra Pratap Rai", role: "Project Lead, System Integration & Knowledge Architecture" },
    { name: "Satya Krishna Singh", role: "AI Search Algorithms, Graph Pathfinding & Game Trees" },
    { name: "Shantanu Bajpai", role: "System Architecture, Network Routing & CSP Optimization" },
    { name: "Satyam Jaiswal", role: "Frontend Engineering, Algorithm Visualization & UI/UX" },
    { name: "Rituraj Agrahari", role: "Data Modeling, Frame Hierarchy & Local Search Optimizer" }
  ];

  const papers = [
    { title: "Gan et al. (2024)", desc: "Storage allocation heuristics for multi-echelon retail fulfillment." },
    { title: "Vis et al. (2024)", desc: "Travelling Salesperson Problem in automated warehousing: A comprehensive survey." },
    { title: "Mollahassani et al. (2025)", desc: "Ontology-driven supply chain representation and semantic networks." },
    { title: "Industry Survey (2025)", desc: "Knowledge graphs and rule-based inference for real-time inventory visibility." },
    { title: "Feremans & Goethals (2025)", desc: "Explainable rule-based recommender systems for retail procurement." }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
            CCSAI0301 Artificial Intelligence Course Project
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">SmartStock AI – Syllabus Map &amp; Team 80</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            NIET Greater Noida • 2nd Year BTech Computer Science and Engineering • Faculty Guide: Ms. Anjali Deshwal
          </p>
        </div>

        {/* Overall Progress Bar */}
        <div className="w-64 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex justify-between font-bold text-slate-800 mb-1">
            <span>Overall Milestone Progress:</span>
            <span className="text-blue-600">60%</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: "60%" }}></div>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
            <span>Month 1: 25%</span>
            <span>Month 2: 35%</span>
          </div>
        </div>
      </div>

      {/* Team Credits */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Team 80 Members &amp; Academic Contributions</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {teamMembers.map((m, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                {i + 1}
              </span>
              <div className="font-bold text-slate-900 text-xs pt-1">{m.name}</div>
              <div className="text-[11px] text-slate-500 leading-snug">{m.role}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
          <span>Faculty Project Mentor: <span className="font-bold">Ms. Anjali Deshwal</span> (Department of CSE, NIET)</span>
          <span className="font-semibold text-blue-700">Aligned with SDG 9: Industry, Innovation &amp; Infrastructure</span>
        </div>
      </div>

      {/* Syllabus Mapping Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Curriculum &amp; Syllabus Coverage Mapping</h2>
          <p className="text-xs text-slate-500">
            Mapping each application page to its theoretical AI topic, university syllabus unit, and submitted report section.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Platform Page</th>
                <th className="p-3.5">AI Topic Implemented</th>
                <th className="p-3.5">Syllabus Unit</th>
                <th className="p-3.5">Report Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {syllabusMap.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-blue-700">{row.page}</td>
                  <td className="p-3.5 text-slate-800 font-medium">{row.topic}</td>
                  <td className="p-3.5 text-slate-600 text-[11px]">{row.unit}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {row.report}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related Academic Literature */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span>Related Academic Research Literature Cited</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {papers.map((p, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
              <span className="font-bold text-slate-800">{p.title}</span>
              <p className="text-slate-600 text-[11px]">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plan for Next Review */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm space-y-2 text-xs">
        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <span>Plan for Review 3 &amp; Final Prototype Submission</span>
        </h4>
        <p className="text-slate-300 leading-relaxed">
          The team's plan for Review 3 focuses on handling uncertainty (Bayesian updating of stockout probabilities) and consolidating all isolated algorithms into a unified end-to-end recommendation pipeline connecting supplier RfPs directly to customer POS registers.
        </p>
      </div>
    </div>
  );
};
