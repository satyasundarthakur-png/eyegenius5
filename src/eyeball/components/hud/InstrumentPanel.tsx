import { useSimulationStore } from "../../stores/simulationStore";
import { PROCEDURES } from "../../stores/procedureSlice";
import type { InstrumentType } from "../../../../packages/instrument-engine/src/types/instrument";

/** Short labels for the instrument picker buttons (full name shown as the active readout). */
const SHORT_LABEL: Record<InstrumentType, string> = {
  keratome: "Keratome",
  capsulorhexis_forceps: "Forceps",
  hydrodissection_cannula: "Hydro Cannula",
  phaco_tip: "Phaco",
  irrigation_aspiration: "I/A",
  iol_injector: "IOL Injector",
  vitrector: "Vitrector",
  endolaser: "Endolaser",
  micro_forceps: "Micro Forceps",
  needle: "Needle",
};

export function InstrumentPanel() {
  const availableInstruments = useSimulationStore((s) => s.availableInstruments);
  const currentInstrument = useSimulationStore((s) => s.currentInstrument);
  const setCurrentInstrument = useSimulationStore((s) => s.setCurrentInstrument);
  const selectedProcedure = useSimulationStore((s) => s.selectedProcedure);

  const procedureInfo = PROCEDURES.find((p) => p.id === selectedProcedure);
  const relevantInstruments = procedureInfo
    ? availableInstruments.filter((inst) => procedureInfo.instruments.includes(inst.getType()))
    : availableInstruments;

  return (
    <div className="text-blue-100">
      <h3 className="mb-2 border-b border-blue-500/20 pb-1 text-xs font-semibold tracking-wider text-blue-400 uppercase">
        Instrument
      </h3>

      <div className="mb-2 text-sm font-medium text-white">
        {currentInstrument ? currentInstrument.getDisplayName() : "None selected"}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {relevantInstruments.map((inst) => {
          const type = inst.getType();
          const isActive = currentInstrument?.getType() === type;
          return (
            <button
              key={type}
              onClick={() => {
                setCurrentInstrument(type);
              }}
              className={`rounded px-2 py-1.5 text-left text-xs font-medium transition-colors ${
                isActive
                  ? "border border-blue-400 bg-blue-600 text-white"
                  : "border border-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
              style={
                isActive ? { boxShadow: `inset 3px 0 0 ${inst.getConfig().color}` } : undefined
              }
            >
              {SHORT_LABEL[type]}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-[10px] leading-snug text-blue-300/50">
        {procedureInfo?.hasGuidedCurriculum
          ? "Only instruments used by the cataract curriculum are shown. Switching tints the needle shaft to the instrument's reference color."
          : "Free-practice instruments for this procedure. Switching tints the needle shaft to the instrument's reference color."}
      </p>
    </div>
  );
}
