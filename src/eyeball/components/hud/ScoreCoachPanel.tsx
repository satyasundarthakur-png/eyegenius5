import { useState } from "react";
import { useSimulationStore } from "../../stores/simulationStore";
import { aiCoach } from "../../../../packages/ai-engine/src/AICoach";

const PRIORITY_STYLE: Record<string, string> = {
  high: "border-red-500/40 bg-red-950/40 text-red-200",
  medium: "border-amber-500/40 bg-amber-950/30 text-amber-200",
  low: "border-green-500/40 bg-green-950/30 text-green-200",
};

function MetricBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = clamped > 75 ? "bg-green-500" : clamped > 45 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="mb-1.5">
      <div className="mb-0.5 flex justify-between text-[10px] text-blue-200/70">
        <span>{label}</span>
        <span className="font-mono">{Math.round(clamped)}</span>
      </div>
      <div className="h-1 w-full rounded-full bg-gray-800">
        <div className={`h-1 rounded-full ${color}`} style={{ width: `${clamped.toFixed(0)}%` }} />
      </div>
    </div>
  );
}

export function ScoreCoachPanel() {
  const scoring = useSimulationStore((s) => s.scoring);
  const feedback = useSimulationStore((s) => s.lastCoachingFeedback);
  const [showHistory, setShowHistory] = useState(false);

  const { performance } = scoring;
  const history = aiCoach.getHistory();
  const previousNotes = history.slice(0, -1).slice(-5).reverse();

  return (
    <div className="text-blue-100">
      <div className="mb-2 flex items-center justify-between border-b border-blue-500/20 pb-1">
        <h3 className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
          Score &amp; AI Coach
        </h3>
        <span className="font-mono text-lg font-bold text-white">
          {Math.round(performance.overall)}
        </span>
      </div>

      <MetricBar label="Precision" value={performance.precision} />
      <MetricBar label="Tremor control" value={performance.tremor} />
      <MetricBar label="Efficiency" value={performance.efficiency} />
      <MetricBar label="Safety" value={performance.safety} />

      <div className="mt-2 min-h-[60px] rounded border border-blue-500/20 bg-black/20 px-2 py-1.5 text-[11px] leading-snug text-blue-300/50">
        {feedback ? (
          <div className={`-m-1.5 rounded border p-1.5 ${PRIORITY_STYLE[feedback.priority]}`}>
            <div className="font-semibold">{feedback.message}</div>
            <div className="mt-0.5 opacity-90">{feedback.detail}</div>
          </div>
        ) : (
          "No coaching notes yet — keep operating."
        )}
      </div>

      {previousNotes.length > 0 && (
        <div className="mt-1.5">
          <button
            onClick={() => {
              setShowHistory((v) => !v);
            }}
            className="text-[10px] text-blue-300/60 hover:text-blue-200"
          >
            {showHistory ? "Hide" : "Show"} previous notes ({previousNotes.length})
          </button>
          {showHistory && (
            <ul className="mt-1 space-y-1">
              {previousNotes.map((note, i) => (
                <li
                  key={i}
                  className="rounded border border-blue-500/10 bg-black/15 px-1.5 py-1 text-[10px] text-blue-200/60"
                >
                  {note.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
