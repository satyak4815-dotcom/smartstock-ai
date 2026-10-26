import React, { useRef, useEffect } from "react";
import { Terminal, ChevronDown, ChevronUp } from "lucide-react";

interface LogPanelProps {
  logs: string[];
  maxHeight?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  title?: string;
}

export const LogPanel: React.FC<LogPanelProps> = ({
  logs,
  maxHeight = "h-48",
  isOpen = true,
  onToggle,
  title = "Algorithm Execution Log Trace"
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-md">
      <div
        className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span>{title}</span>
          <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full">
            {logs.length} entries
          </span>
        </div>
        {onToggle && (
          <button className="text-slate-400 hover:text-white transition">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={scrollRef}
          className={`${maxHeight} overflow-y-auto p-3 font-mono text-xs leading-relaxed space-y-1 bg-slate-900/90`}
        >
          {logs.length === 0 ? (
            <div className="text-slate-500 italic">No steps recorded yet. Click 'Step' or 'Play' to begin execution...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 text-slate-300">
                <span className="text-slate-500 select-none text-[10px] w-6 shrink-0 text-right">
                  {index + 1}
                </span>
                <span className={log.includes("GOAL") || log.includes("optimal") || log.includes("PROVEN") ? "text-emerald-400 font-semibold" : log.includes("PRUNED") || log.includes("cut-off") ? "text-amber-400 font-medium" : ""}>
                  {log}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
