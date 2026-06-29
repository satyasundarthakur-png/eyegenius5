import { useSimulationStore } from '../../stores/simulationStore';

const PHASE_COLOR: Record<string, string> = {
  IDLE:       'text-gray-400 border-gray-500/40 bg-gray-800/70',
  CONTACT:    'text-blue-300 border-blue-500/40 bg-blue-950/70',
  INSERTING:  'text-green-300 border-green-500/40 bg-green-950/70',
  WITHDRAWING:'text-amber-300 border-amber-500/40 bg-amber-950/70',
  COMPLETE:   'text-emerald-300 border-emerald-500/40 bg-emerald-950/70',
};

const MODE_HINT: Record<string, string> = {
  VIEW:   'Observation — press P to place RCM',
  PLACE:  'Click the eyeball surface to set RCM entry point',
  EDIT:   'Drag ↔ azimuth · Drag ↕ depth · Scroll fine · 1-4 elevation presets',
  REPLAY: 'Playback mode — use Controls panel to adjust speed',
};

/**
 * Minimal always-visible surgical status bar.
 * Floats at bottom-left so it never blocks the operative field.
 * Hidden once surgery is COMPLETE to give a clean end-state view.
 */
export function SurgicalStatusBar() {
  const phase = useSimulationStore((s) => s.phase);
  const mode  = useSimulationStore((s) => s.mode);

  if (phase === 'COMPLETE') return null;

  const phaseClass = PHASE_COLOR[phase] ?? PHASE_COLOR.IDLE;
  const hint       = MODE_HINT[mode]  ?? '';

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 flex items-center gap-2">
      {/* Phase pill */}
      <span
        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase backdrop-blur ${phaseClass}`}
      >
        {phase}
      </span>

      {/* Mode pill */}
      <span className="rounded-full border border-blue-500/30 bg-gray-950/80 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-blue-400 uppercase backdrop-blur">
        {mode}
      </span>

      {/* Context hint */}
      {hint && (
        <span className="rounded border border-blue-500/20 bg-gray-950/70 px-2 py-0.5 text-[10px] text-blue-300/70 backdrop-blur">
          {hint}
        </span>
      )}
    </div>
  );
}
