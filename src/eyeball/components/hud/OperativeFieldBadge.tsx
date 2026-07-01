import { useSimulationStore } from "../../stores/simulationStore";
import { getOperatorPosition } from "../../stores/procedureSlice";

export function OperativeFieldBadge() {
  const eyeSide = useSimulationStore((s) => s.eyeSide);
  const setEyeSide = useSimulationStore((s) => s.setEyeSide);

  return (
    <div className="pointer-events-auto w-56 rounded-lg border border-blue-500/30 bg-gray-950/85 p-3 text-blue-100 backdrop-blur">
      <h3 className="mb-2 border-b border-blue-500/20 pb-1 text-xs font-semibold tracking-wider text-blue-400 uppercase">
        Operative Eye
      </h3>

      <div className="mb-2 grid grid-cols-2 gap-1.5">
        <button
          onClick={() => {
            setEyeSide("OD");
          }}
          className={`rounded px-2 py-1.5 text-xs font-semibold transition-colors ${
            eyeSide === "OD"
              ? "border border-blue-400 bg-blue-600 text-white"
              : "border border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          }`}
        >
          OD — Right Eye
        </button>
        <button
          onClick={() => {
            setEyeSide("OS");
          }}
          className={`rounded px-2 py-1.5 text-xs font-semibold transition-colors ${
            eyeSide === "OS"
              ? "border border-blue-400 bg-blue-600 text-white"
              : "border border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          }`}
        >
          OS — Left Eye
        </button>
      </div>

      <p className="text-[10px] leading-snug text-blue-300/60">{getOperatorPosition(eyeSide)}.</p>
    </div>
  );
}
