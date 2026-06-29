import { Droplet, Eye, Microscope, Scissors } from 'lucide-react';
import { useSimulationStore } from '../../stores/simulationStore';
import { PROCEDURES, type SurgicalProcedure } from '../../stores/procedureSlice';

/** One icon per surgical module — quick visual recognition at a glance. */
const PROCEDURE_ICONS: Record<SurgicalProcedure, typeof Eye> = {
  cataract: Scissors,
  retina: Eye,
  glaucoma: Droplet,
  cornea: Microscope,
};

export function ProcedureMenu() {
  const selectedProcedure = useSimulationStore((s) => s.selectedProcedure);
  const setProcedure = useSimulationStore((s) => s.setProcedure);

  const current = PROCEDURES.find((p) => p.id === selectedProcedure);

  return (
    <div className="pointer-events-auto w-64 rounded-lg border border-blue-500/30 bg-gray-950/85 p-3 text-blue-100 backdrop-blur">
      <h3 className="mb-2 border-b border-blue-500/20 pb-1 text-xs font-semibold tracking-wider text-blue-400 uppercase">
        Surgical Procedure
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {PROCEDURES.map((proc) => {
          const isActive = proc.id === selectedProcedure;
          const Icon = PROCEDURE_ICONS[proc.id];
          return (
            <button
              key={proc.id}
              onClick={() => {
                setProcedure(proc.id);
              }}
              className={`relative flex items-center gap-1.5 rounded px-2 py-1.5 text-left text-xs font-medium transition-colors ${
                isActive
                  ? 'border border-blue-400 bg-blue-600 text-white'
                  : 'border border-transparent text-gray-300 hover:bg-gray-800 hover:text-gray-100'
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-blue-400/70'}`}
                aria-hidden="true"
              />
              <span>{proc.name.replace(' Surgery', '')}</span>
              {!proc.hasGuidedCurriculum && (
                <span className="absolute top-0.5 right-1 text-[8px] uppercase tracking-wide text-amber-400/80">
                  beta
                </span>
              )}
            </button>
          );
        })}
      </div>

      {current && (
        <p className="mt-2 text-[10px] leading-snug text-blue-300/50">
          {current.description}
          {!current.hasGuidedCurriculum && (
            <span className="mt-1 block text-amber-300/70">
              No scored step-by-step curriculum yet — instruments are available for free practice.
            </span>
          )}
        </p>
      )}
    </div>
  );
}
