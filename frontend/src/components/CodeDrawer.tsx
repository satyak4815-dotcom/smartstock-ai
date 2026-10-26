import React, { useState } from "react";
import { Code, ChevronRight, ChevronDown, Copy, Check } from "lucide-react";

interface CodeDrawerProps {
  title: string;
  concept: string;
  pythonCode: string;
}

export const CodeDrawer: React.FC<CodeDrawerProps> = ({
  title,
  concept,
  pythonCode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-4">
      <div
        className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 cursor-pointer transition select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-800">{title}</span>
          <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
            {concept}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-xs font-medium">{isOpen ? "Hide Python Source" : "Show Algorithm (Pure Python)"}</span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </div>

      {isOpen && (
        <div className="relative border-t border-slate-200">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-md transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Code"}</span>
          </button>
          <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-96">
            <code>{pythonCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
