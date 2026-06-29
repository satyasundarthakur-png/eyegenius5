import { useSimulationStore } from '../../stores/simulationStore';
import { PROCEDURES } from '../../stores/procedureSlice';
import { Badge } from '../ui/badge';

const STEP_LABEL: Record<string, string> = {
  idle: 'Idle',
  incision: 'Incision',
  capsulorhexis: 'Capsulorhexis',
  hydrodissection: 'Hydrodissection',
  phacoemulsification: 'Phacoemulsification',
  cortex_removal: 'Cortex Removal',
  iol_insertion: 'IOL Insertion',
  wound_hydration: 'Wound Hydration',
  complete: 'Complete',
};

const STEP_ORDER = [
  'incision',
  'capsulorhexis',
  'hydrodissection',
  'phacoemulsification',
  'cortex_removal',
  'iol_insertion',
  'wound_hydration',
];

export function CurriculumPanel() {
  const currentStep = useSimulationStore((s) => s.currentCurriculumStep);
  const validation = useSimulationStore((s) => s.curriculumValidation);
  const complications = useSimulationStore((s) => s.complications);
  const advanceCurriculumStep = useSimulationStore((s) => s.advanceCurriculumStep);
  const resetCurriculum = useSimulationStore((s) => s.resetCurriculum);
  const selectedProcedure = useSimulationStore((s) => s.selectedProcedure);
  const procedureStarted = useSimulationStore((s) => s.procedureStarted);
  const startProcedure = useSimulationStore((s) => s.startProcedure);
  const endProcedure = useSimulationStore((s) => s.endProcedure);

  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const procedureInfo = PROCEDURES.find((p) => p.id === selectedProcedure);

  if (procedureInfo && !procedureInfo.hasGuidedCurriculum) {
    return (
      <div className="pointer-events-auto w-64 rounded-lg border border-blue-500/30 bg-gray-950/85 p-3 text-blue-100 backdrop-blur">
        <h3 className="mb-2 border-b border-blue-500/20 pb-1 text-xs font-semibold tracking-wider text-blue-400 uppercase">
          {procedureInfo.name}
        </h3>
        <p className="text-xs leading-snug text-blue-200/70">
          A scored, step-by-step curriculum for {procedureInfo.name.toLowerCase()} isn't implemented yet —
          only cataract surgery has full validation right now.
        </p>
        <p className="mt-2 text-xs leading-snug text-blue-200/70">
          You can still freely practice with this procedure's instruments — switch in the Instrument panel.
        </p>
      </div>
    );
  }

  if (!procedureStarted) {
    return (
      <div className="pointer-events-auto w-64 rounded-lg border border-blue-500/30 bg-gray-950/85 p-3 text-blue-100 backdrop-blur">
        <h3 className="mb-2 border-b border-blue-500/20 pb-1 text-xs font-semibold tracking-wider text-blue-400 uppercase">
          Cataract Curriculum
        </h3>
        <p className="mb-3 text-xs leading-snug text-blue-200/70">
          You're in <span className="font-semibold text-white">Free Observation</span> — orbit the eye and try
          instruments freely. Nothing is scored or stepped through yet.
        </p>
        <button
          onClick={startProcedure}
          className="w-full rounded bg-blue-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
        >
          Start Procedure (Operate)
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto w-64 rounded-lg border border-blue-500/30 bg-gray-950/85 p-3 text-blue-100 backdrop-blur">
      <div className="mb-2 flex items-center justify-between border-b border-blue-500/20 pb-1">
        <h3 className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
          Cataract Curriculum
        </h3>
        <div className="flex items-center gap-2">
          <span className="rounded bg-green-600/30 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-green-300 uppercase">
            Operating
          </span>
          <button
            onClick={endProcedure}
            className="text-[10px] text-blue-300/60 hover:text-blue-200"
          >
            Pause
          </button>
          <button
            onClick={resetCurriculum}
            className="text-[10px] text-blue-300/60 hover:text-blue-200"
          >
            Reset
          </button>
        </div>
      </div>

      <ol className="mb-2 space-y-0.5">
        {STEP_ORDER.map((step, i) => {
          const isCurrent = step === currentStep;
          const isDone = currentIndex > i || currentStep === 'complete';
          return (
            <li
              key={step}
              className={`flex items-center gap-2 rounded px-1.5 py-1 text-xs ${
                isCurrent ? 'bg-blue-600/30 text-white' : isDone ? 'text-green-400/80' : 'text-gray-500'
              }`}
            >
              <span className="w-4 text-center font-mono text-[10px]">
                {isDone ? '✓' : i + 1}
              </span>
              <span className={isCurrent ? 'font-semibold' : ''}>{STEP_LABEL[step]}</span>
            </li>
          );
        })}
      </ol>

      {currentStep === 'complete' ? (
        <div className="rounded bg-green-600/20 px-2 py-1.5 text-xs font-medium text-green-300">
          Procedure complete.
        </div>
      ) : (
        <>
          {validation && (
            <div className="mb-2 rounded border border-blue-500/20 bg-black/20 px-2 py-1.5">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-blue-300/60">
                  Step Score
                </span>
                <span className="font-mono text-sm font-semibold text-white">
                  {validation.score}
                </span>
              </div>
              {validation.feedback.map((msg, i) => (
                <p key={i} className="text-[11px] leading-snug text-blue-200/80">
                  {msg}
                </p>
              ))}
            </div>
          )}

          <button
            onClick={advanceCurriculumStep}
            disabled={!validation?.isValid}
            className={`w-full rounded px-2 py-1.5 text-xs font-medium transition-colors ${
              validation?.isValid
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'cursor-not-allowed bg-gray-800 text-gray-500'
            }`}
          >
            Advance to next step
          </button>
        </>
      )}

      {complications.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {complications.map((c, i) => (
            <Badge key={i} variant="destructive" className="text-[10px]">
              {c.type.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
