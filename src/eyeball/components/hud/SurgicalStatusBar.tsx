import { useSimulationStore } from "../../stores/simulationStore";
import { MODE_DISPLAY, PHASE_DISPLAY } from "../../constants/terminology";

const PHASE_COLOR: Record<string, string> = {
  IDLE:        "text-gray-400 border-gray-500/40 bg-gray-800/70",
  CONTACT:     "text-blue-300 border-blue-500/40 bg-blue-950/70",
  INSERTING:   "text-green-300 border-green-500/40 bg-green-950/70",
  WITHDRAWING: "text-amber-300 border-amber-500/40 bg-amber-950/70",
  COMPLETE:    "text-emerald-300 border-emerald-500/40 bg-emerald-950/70",
};

const MODE_HINT_SHORT: Record<string, string> = {
  VIEW:   "Press P to mark the entry point",
  PLACE:  "Click eyeball surface to mark entry point",
  EDIT:   "↕ drag insert/withdraw  ↔ swing  scroll fine depth  1–4 approach angle",
  REPLAY: "Playback — open Controls panel to adjust speed",
};

/**
 * Always-visible bottom-left surgical status bar.
 * Phase pill uses PHASE_DISPLAY from terminology.ts so the surgeon
 * sees clinical language (Pre-Op / Corneal Contact / Advancing / …)
 * instead of raw state-machine codes (IDLE / CONTACT / INSERTING / …).
 * Hidden once surgery reaches COMPLETE to give a clean end-state view.
 */
export function SurgicalStatusBar() {
  const phase = useSimulationStore((s) => s.phase);
  const mode  = useSimulationStore((s) => s.mode);

  if (phase === "COMPLETE") return null;

  const phaseClass = PHASE_COLOR[phase] ?? PHASE_COLOR.IDLE;
  const phaseLabel = PHASE_DISPLAY[phase] ?? phase;
  const modeLabel  = MODE_DISPLAY[mode]   ?? mode;
  const hint       = MODE_HINT_SHORT[mode] ?? "";

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 flex flex-wrap items-center gap-2">
      {/* Surgical phase pill */}
      <span
        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase backdrop-blur ${phaseClass}`}
      >
        {phaseLabel}
      </span>

      {/* Workflow mode pill */}
      <span className="rounded-full border border-blue-500/30 bg-gray-950/80 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-blue-400 uppercase backdrop-blur">
        {modeLabel}
      </span>

      {/* Context hint — hidden on small screens */}
      {hint && (
        <span className="hidden rounded border border-blue-500/20 bg-gray-950/70 px-2 py-0.5 text-[10px] text-blue-300/70 backdrop-blur sm:inline">
          {hint}
        </span>
      )}
    </div>
  );
}
