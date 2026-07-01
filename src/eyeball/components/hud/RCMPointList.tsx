import { useSimulationStore } from "../../stores/simulationStore";
import type { RCMPoint } from "../../stores/simulationStore";
import { ENTRY_POINT_LABEL, ENTRY_POINT_LABEL_PLURAL } from "../../constants/terminology";

export function RCMPointList() {
  const rcmPoints = useSimulationStore((s) => s.rcmPoints);
  const currentRCMIndex = useSimulationStore((s) => s.currentRCMIndex);
  const setCurrentRCMIndex = useSimulationStore((s) => s.setCurrentRCMIndex);
  const removeRCMPoint = useSimulationStore((s) => s.removeRCMPoint);
  const mode = useSimulationStore((s) => s.mode);

  if (rcmPoints.length === 0) return null;

  return (
    <div className="text-blue-100">
      <h4 className="mb-2 border-b border-blue-500/20 pb-1 text-sm font-semibold text-blue-400">
        {ENTRY_POINT_LABEL_PLURAL}
      </h4>
      <div className="space-y-1">
        {rcmPoints.map((rcm: RCMPoint, index: number) => (
          <div
            key={rcm.id}
            className={`flex items-center justify-between rounded px-2 py-1.5 text-xs transition-colors ${
              index === currentRCMIndex
                ? "bg-blue-500/20 text-blue-100"
                : "bg-blue-500/5 text-blue-300/70 hover:bg-blue-500/10"
            }`}
          >
            <button
              onClick={() => {
                setCurrentRCMIndex(index);
              }}
              className="flex-1 text-left"
            >
              <div className="font-mono text-[10px]">
                {ENTRY_POINT_LABEL} {index + 1}
              </div>
              <div className="font-mono text-[9px] text-blue-300/60">
                [{rcm.point[0].toFixed(1)}, {rcm.point[1].toFixed(1)}, {rcm.point[2].toFixed(1)}]
              </div>
            </button>
            <button
              onClick={() => {
                removeRCMPoint(index);
              }}
              disabled={mode === "EDIT" && rcmPoints.length === 1}
              className="ml-2 rounded px-1.5 py-0.5 text-red-400 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
              title={`Remove ${ENTRY_POINT_LABEL.toLowerCase()}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-blue-500/20 pt-2 text-[10px] text-blue-300/60">
        {rcmPoints.length}{" "}
        {rcmPoints.length === 1
          ? ENTRY_POINT_LABEL.toLowerCase()
          : ENTRY_POINT_LABEL_PLURAL.toLowerCase()}
      </div>
    </div>
  );
}
