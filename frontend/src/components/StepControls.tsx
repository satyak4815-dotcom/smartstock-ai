import React, { useEffect } from "react";
import { Play, Pause, SkipForward, RotateCcw, Gauge } from "lucide-react";

interface StepControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speedMs: number;
  onStep: () => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

export const StepControls: React.FC<StepControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  speedMs,
  onStep,
  onTogglePlay,
  onReset,
  onSpeedChange,
  disabled = false,
}) => {
  // Keyboard shortcut: Space = Step
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !disabled && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        if (currentStep < totalSteps) {
          onStep();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onStep, currentStep, totalSteps, disabled]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={onStep}
          disabled={disabled || currentStep >= totalSteps}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition shadow-sm"
          title="Press Spacebar to Step"
        >
          <SkipForward className="w-4 h-4" />
          <span>Step</span>
        </button>

        <button
          onClick={onTogglePlay}
          disabled={disabled || currentStep >= totalSteps}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition shadow-sm text-white ${
            isPlaying ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
          } disabled:opacity-50`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isPlaying ? "Pause" : "Play"}</span>
        </button>

        <button
          onClick={onReset}
          disabled={disabled || currentStep === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-slate-400" />
          <span>Speed:</span>
          <input
            type="range"
            min="100"
            max="1500"
            step="100"
            value={1600 - speedMs}
            onChange={(e) => onSpeedChange(1600 - Number(e.target.value))}
            className="w-20 accent-blue-600 cursor-pointer"
            title={`${speedMs} ms per step`}
          />
          <span className="w-12 text-right">{speedMs}ms</span>
        </div>

        <div className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 border border-slate-200">
          Step <span className="font-bold text-blue-600">{currentStep}</span> of{" "}
          <span className="font-bold">{totalSteps}</span>
        </div>
      </div>
    </div>
  );
};
