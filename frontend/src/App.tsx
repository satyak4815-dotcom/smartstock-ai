import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Search, MapPin, Sliders, Swords, Puzzle, Grid3X3,
  Route as RouteIcon, BookOpen, Cpu, Award, Users, Sparkles, HelpCircle,
  Menu, X, ShieldAlert, CheckCircle2
} from "lucide-react";

import { Dashboard } from "./pages/Dashboard";
import { ReorderSearch } from "./pages/ReorderSearch";
import { RouteSearch } from "./pages/RouteSearch";
import { Constraints } from "./pages/Constraints";
import { Negotiation } from "./pages/Negotiation";
import { WarehousePuzzles } from "./pages/WarehousePuzzles";
import { ShelfAllocation } from "./pages/ShelfAllocation";
import { RestockingRoute } from "./pages/RestockingRoute";
import { KnowledgeBase } from "./pages/KnowledgeBase";
import { ExpertSystem } from "./pages/ExpertSystem";
import { Reports } from "./pages/Reports";
import { About } from "./pages/About";
import { GuidedDemoModal } from "./components/GuidedDemoModal";
import { api } from "./services/api";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, badge: "M1+11" },
  { path: "/reorder", label: "Reorder Search", icon: Search, badge: "M2" },
  { path: "/route", label: "Supplier & Route Search", icon: MapPin, badge: "M3" },
  { path: "/csp", label: "Constraints (CSP)", icon: Sliders, badge: "M4" },
  { path: "/negotiation", label: "Negotiation Game Tree", icon: Swords, badge: "M5" },
  { path: "/puzzles", label: "Warehouse Puzzles", icon: Puzzle, badge: "M6" },
  { path: "/shelf", label: "Shelf Allocation", icon: Grid3X3, badge: "M7" },
  { path: "/tsp", label: "Restocking Route (TSP)", icon: RouteIcon, badge: "M8" },
  { path: "/knowledge", label: "Knowledge Base", icon: BookOpen, badge: "M9" },
  { path: "/expert-system", label: "Expert System", icon: Cpu, badge: "M10" },
  { path: "/reports", label: "Reports & Results", icon: Award, badge: "M11" },
  { path: "/about", label: "Syllabus Map & About", icon: Users, badge: "M12" }
];

export function AppContent() {
  const location = useLocation();
  const [festivalSeason, setFestivalSeason] = useState<boolean>(false);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [demoStopIndex, setDemoStopIndex] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleToggleFestival = async (enabled: boolean) => {
    try {
      setFestivalSeason(enabled);
      await api.toggleFestival(enabled);
    } catch (err) {
      console.error("Festival toggle failed:", err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 md:static md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-md">
                S
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white block">SmartStock AI</span>
                <span className="text-[10px] text-slate-400 font-mono">Team 80 • CCSAI0301</span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition group ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isActive ? "bg-blue-700 text-white" : "bg-slate-800 text-slate-500 group-hover:text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>Semester 4 AI Demo</span>
              <span className="text-emerald-400 font-bold">Offline Ready</span>
            </div>
            <div className="text-[10px] text-slate-500">NIET Greater Noida • Pure Python AI</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-slate-500 hover:text-slate-800 md:hidden p-1.5 rounded-lg border border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm md:text-base">
                SmartStock AI – Demo Store
              </span>
              <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-700" />
                <span>Sample data – 12 products</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Festival Season Global Toggle */}
            <button
              onClick={() => handleToggleFestival(!festivalSeason)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                festivalSeason
                  ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
              title="Applies festival season heuristic: 1.5x customer demand & elevated safety stock buffer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Festival Season:</span>
              <span>{festivalSeason ? "ON (+50%)" : "OFF"}</span>
            </button>

            {/* Guided Demo Button */}
            <button
              onClick={() => setIsDemoOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Guided Demo (5 Min)</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard festivalSeason={festivalSeason} />} />
            <Route path="/reorder" element={<ReorderSearch />} />
            <Route path="/route" element={<RouteSearch />} />
            <Route path="/csp" element={<Constraints />} />
            <Route path="/negotiation" element={<Negotiation />} />
            <Route path="/puzzles" element={<WarehousePuzzles />} />
            <Route path="/shelf" element={<ShelfAllocation />} />
            <Route path="/tsp" element={<RestockingRoute />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
            <Route
              path="/expert-system"
              element={<ExpertSystem festivalSeason={festivalSeason} onToggleFestival={handleToggleFestival} />}
            />
            <Route path="/reports" element={<Reports />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>

      {/* Guided Viva Demo Modal */}
      <GuidedDemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        currentStopIndex={demoStopIndex}
        onNavigateStop={setDemoStopIndex}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
