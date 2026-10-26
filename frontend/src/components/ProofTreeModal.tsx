import React from "react";
import { X, CheckCircle2, XCircle, GitBranch, ShieldAlert } from "lucide-react";

interface ProofTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    product_id?: string;
    goal?: string;
    proof_tree?: {
      goal: string;
      product: string;
      subgoals: Array<{
        subgoal: string;
        condition: string;
        satisfied: boolean;
        type: string;
      }>;
      proved: boolean;
      explanation: string;
    };
    explanation?: string;
    confidence?: string;
  } | null;
}

export const ProofTreeModal: React.FC<ProofTreeModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!isOpen || !data || !data.proof_tree) return null;

  const { proof_tree, confidence } = data;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-800">
              Backward Chaining Proof Tree: <span className="text-blue-600">{proof_tree.goal}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl flex items-start gap-3 border ${
              proof_tree.proved
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            {proof_tree.proved ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                {proof_tree.proved ? "Goal Derived (PROVEN)" : "Goal Refuted / Unsatisfied (DISPROVEN)"}
              </div>
              <div className="text-xs mt-1 leading-relaxed">{proof_tree.explanation}</div>
            </div>
          </div>

          {/* Subgoals evaluation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Subgoal Fact Evaluation in Working Memory
            </h4>
            <div className="space-y-2">
              {proof_tree.subgoals.map((sg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                    sg.satisfied
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-red-50/50 border-red-200"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      {sg.satisfied ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                      )}
                      <span>Subgoal {idx + 1}: {sg.subgoal}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] font-mono">Condition: {sg.condition}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sg.satisfied
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {sg.satisfied ? "TRUE (Satisfied)" : "FALSE (Failed)"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Meta Knowledge */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Meta-Knowledge Confidence:</span>
            <span className="font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full text-[11px]">
              {confidence || "Medium (Sample Data Cap)"}
            </span>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition"
          >
            Close Proof
          </button>
        </div>
      </div>
    </div>
  );
};
