import { useSimulationStore } from '../../stores/simulationStore';
import { PROCEDURES } from '../../stores/procedureSlice';
import { Badge } from '../ui/badge';
import type { InstrumentType } from '../../../../packages/instrument-engine/src/types/instrument';

// ── Step metadata ──────────────────────────────────────────────────────────
const STEP_LABEL: Record<string, string> = {
  incision:            '1. Incision',
  capsulorhexis:       '2. Capsulorhexis',
  hydrodissection:     '3. Hydrodissection',
  phacoemulsification: '4. Phacoemulsification',
  cortex_removal:      '5. Cortex Removal',
  iol_insertion:       '6. IOL Insertion',
  wound_hydration:     '7. Wound Hydration',
};

const STEP_INSTRUMENT: Record<string, InstrumentType> = {
  incision:            'keratome',
  capsulorhexis:       'capsulorhexis_forceps',
  hydrodissection:     'hydrodissection_cannula',
  phacoemulsification: 'phaco_tip',
  cortex_removal:      'irrigation_aspiration',
  iol_insertion:       'iol_injector',
  wound_hydration:     'hydrodissection_cannula',
};

const INSTRUMENT_LABEL: Record<string, string> = {
  keratome:               'Keratome',
  capsulorhexis_forceps:  'Capsulorhexis Forceps',
  hydrodissection_cannula:'Hydro Cannula',
  phaco_tip:              'Phaco Tip',
  irrigation_aspiration:  'I/A Handpiece',
  iol_injector:           'IOL Injector',
};

const STEP_ACTION: Record<string, string> = {
  incision:
    'Set tilt ≥ 15° (preset 2), drag down to >2.5 mm depth.',
  capsulorhexis:
    'Drag to 1.5–4.5 mm depth at low angle.',
  hydrodissection:
    'Wait for AC to pressurise (bar → green), then drag to >1 mm depth.',
  phacoemulsification:
    'Drag to 3–8 mm depth in the nuclear zone.',
  cortex_removal:
    'Let vacuum build (bar fills), maintain stable chamber.',
  iol_insertion:
    'Drag to 0.5–3.5 mm depth for controlled lens delivery.',
  wound_hydration:
    'Drag to 0.5–2.0 mm depth to hydrate and seal wound edges.',
};

const STEP_ORDER = Object.keys(STEP_LABEL);

/** Steps that need fluidics to stabilise before they can pass. */
const NEEDS_STABLE_AC = new Set(['hydrodissection', 'phacoemulsification', 'cortex_removal']);

/** Steps where vacuum level is also shown. */
const SHOWS_VACUUM = new Set(['cortex_removal']);

// ── Component ──────────────────────────────────────────────────────────────
export function CurriculumPanel() {
  const currentStep          = useSimulationStore((s) => s.currentCurriculumStep);
  const validation           = useSimulationStore((s) => s.curriculumValidation);
  const complications        = useSimulationStore((s) => s.complications);
  const advanceCurriculumStep= useSimulationStore((s) => s.advanceCurriculumStep);
  const validateStep         = useSimulationStore((s) => s.validateCurrentCurriculumStep);
  const resetCurriculum      = useSimulationStore((s) => s.resetCurriculum);
  const selectedProcedure    = useSimulationStore((s) => s.selectedProcedure);
  const procedureStarted     = useSimulationStore((s) => s.procedureStarted);
  const startProcedure       = useSimulationStore((s) => s.startProcedure);
  const endProcedure         = useSimulationStore((s) => s.endProcedure);
  const currentInstrument    = useSimulationStore((s) => s.currentInstrument);
  const setCurrentInstrument = useSimulationStore((s) => s.setCurrentInstrument);
  const insertionDepth       = useSimulationStore((s) => s.insertionDepth);
  const tiltAlpha            = useSimulationStore((s) => s.tiltAlpha);
  const fluidics             = useSimulationStore((s) => s.fluidics);

  const currentIndex   = STEP_ORDER.indexOf(currentStep);
  const procedureInfo  = PROCEDURES.find((p) => p.id === selectedProcedure);
  const neededInstrument = STEP_INSTRUMENT[currentStep];
  const wrongInstrument  = neededInstrument && currentInstrument?.getType() !== neededInstrument;

  // ── Non-cataract procedures ──────────────────────────────────────────────
  if (procedureInfo && !procedureInfo.hasGuidedCurriculum) {
    return (
      <div className="pointer-events-auto w-64 rounded-lg border border-blue-500/30 bg-gray-950/85 p-3 text-blue-100 backdrop-blur">
        <h3 className="mb-2 border-b border-blue-500/20 pb-1 text-xs font-semibold tracking-wider text-blue-400 uppercase">
          {procedureInfo.name}
        </h3>
        <p className="text-xs leading-snug text-blue-200/70">
          Free practice — no scored curriculum for this procedure yet.
        </p>
      </div>
    );
  }

  // ── Pre-start ──────────────────────────────────────────────────────────
  if (!procedureStarted) {
    return (
      <div className="pointer-events-auto w-64 rounded-lg border border-blue-500/30 bg-gray-950/85 p-3 text-blue-100 backdrop-blur">
        <h3 className="mb-2 border-b border-blue-500/20 pb-1 text-xs font-semibold tracking-wider text-blue-400 uppercase">
          Cataract Surgery
        </h3>
        <p className="mb-1 text-xs text-blue-200/70 leading-snug">
          7-step guided procedure: incision → capsulorhexis → hydrodissection
          → phaco → cortex removal → IOL → wound hydration.
        </p>
        <p className="mb-3 text-xs text-blue-300/50 leading-snug">
          First: press <kbd className="rounded border border-blue-500/30 bg-blue-500/15 px-1 font-mono text-[10px]">P</kbd>,
          click the eyeball to mark the entry point, then start.
        </p>
        <button
          onClick={startProcedure}
          className="w-full rounded bg-blue-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
        >
          ▶ Start Procedure
        </button>
      </div>
    );
  }

  // ── Complete ─────────────────────────────────────────────────────────────
  if (currentStep === 'complete') {
    return (
      <div className="pointer-events-auto w-64 rounded-lg border border-emerald-500/40 bg-gray-950/85 p-3 text-blue-100 backdrop-blur">
        <h3 className="mb-2 border-b border-emerald-500/20 pb-1 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
          Surgery Complete ✓
        </h3>
        <p className="mb-3 text-xs text-emerald-200/80">
          All 7 steps completed. IOL implanted, wound sealed.
        </p>
        {complications.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-[10px] uppercase tracking-wide text-red-400">Intra-op complications</p>
            <div className="flex flex-wrap gap-1">
              {complications.map((c, i) => (
                <Badge key={i} variant="destructive" className="text-[10px]">
                  {c.type.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={resetCurriculum}
          className="w-full rounded bg-blue-700 px-2 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
        >
          ↺ Restart Procedure
        </button>
      </div>
    );
  }

  // ── In-progress ───────────────────────────────────────────────────────────
  const needsStableAC = NEEDS_STABLE_AC.has(currentStep);
  const showVacuum    = SHOWS_VACUUM.has(currentStep);
  const stabilityPct  = Math.round(fluidics.stability * 100);
  const vacuumPct     = Math.round((fluidics.vacuumLevel / 400) * 100);

  return (
    <div className="pointer-events-auto w-64 rounded-lg border border-blue-500/30 bg-gray-950/85 p-3 text-blue-100 backdrop-blur">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between border-b border-blue-500/20 pb-1">
        <h3 className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
          Cataract Surgery
        </h3>
        <div className="flex gap-2">
          <button onClick={endProcedure}   className="text-[10px] text-blue-300/60 hover:text-blue-200">Pause</button>
          <button onClick={resetCurriculum} className="text-[10px] text-blue-300/60 hover:text-blue-200">Reset</button>
        </div>
      </div>

      {/* Step list */}
      <ol className="mb-3 space-y-0.5">
        {STEP_ORDER.map((step, i) => {
          const isCurrent = step === currentStep;
          const isDone    = currentIndex > i;
          return (
            <li key={step}
              className={`flex items-center gap-2 rounded px-1.5 py-1 text-xs ${
                isCurrent ? 'bg-blue-600/30 text-white font-semibold'
                : isDone   ? 'text-emerald-400/80'
                : 'text-gray-500'
              }`}
            >
              <span className="w-4 text-center font-mono text-[10px]">
                {isDone ? '✓' : i + 1}
              </span>
              {STEP_LABEL[step]}
            </li>
          );
        })}
      </ol>

      {/* Current step action card */}
      <div className="mb-2 rounded border border-blue-500/20 bg-blue-950/40 px-2 py-2 text-xs">
        <p className="mb-1.5 font-semibold text-blue-200">{STEP_LABEL[currentStep]}</p>

        {/* Instrument required — with one-click switch */}
        {neededInstrument && (
          <div className={`mb-1.5 flex items-center justify-between rounded px-1.5 py-1 ${
            wrongInstrument ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'
          }`}>
            <span className="text-[10px]">
              {wrongInstrument ? '⚠ Switch to:' : '✓ Using:'}&nbsp;
              <strong>{INSTRUMENT_LABEL[neededInstrument]}</strong>
            </span>
            {wrongInstrument && (
              <button
                onClick={() => { setCurrentInstrument(neededInstrument); }}
                className="ml-2 rounded bg-amber-500/30 px-1.5 py-0.5 text-[10px] font-semibold hover:bg-amber-500/50"
              >
                Switch
              </button>
            )}
          </div>
        )}

        {/* Fluidics bar — shown for steps that depend on AC stability */}
        {needsStableAC && (
          <div className="mb-1.5">
            <div className="mb-0.5 flex items-center justify-between text-[10px]">
              <span className="text-blue-300/70">Chamber stability</span>
              <span className={stabilityPct >= 65 ? 'text-emerald-400' : 'text-amber-400'}>
                {stabilityPct} %{stabilityPct >= 65 ? ' ✓' : ' — keep instrument in'}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${stabilityPct >= 65 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${stabilityPct}%` }}
              />
            </div>
          </div>
        )}

        {showVacuum && (
          <div className="mb-1.5">
            <div className="mb-0.5 flex items-center justify-between text-[10px]">
              <span className="text-blue-300/70">Vacuum</span>
              <span className={vacuumPct >= 25 ? 'text-emerald-400' : 'text-amber-400'}>
                {Math.round(fluidics.vacuumLevel)} mmHg{vacuumPct >= 25 ? ' ✓' : ' — drag deeper'}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${vacuumPct >= 25 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${vacuumPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Action instruction */}
        <p className="text-[10px] leading-snug text-blue-200/70">{STEP_ACTION[currentStep]}</p>
      </div>

      {/* Validation feedback */}
      {validation && validation.feedback.length > 0 && (
        <div className="mb-2 rounded border border-blue-500/20 bg-black/20 px-2 py-1.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wide text-blue-300/60">Score</span>
            <span className="font-mono text-sm font-semibold text-white">{validation.score}</span>
          </div>
          {validation.feedback.map((msg, i) => (
            <p key={i} className="text-[11px] leading-snug text-blue-200/80">{msg}</p>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <button
        onClick={() => {
          if (currentInstrument) {
            validateStep(currentInstrument.getType(), insertionDepth, tiltAlpha);
          }
        }}
        className="mb-1.5 w-full rounded border border-blue-500/30 px-2 py-1 text-xs font-medium text-blue-300 hover:bg-blue-500/10"
      >
        ↻ Validate step
      </button>
      <button
        onClick={advanceCurriculumStep}
        disabled={!validation?.isValid}
        className={`w-full rounded px-2 py-1.5 text-xs font-semibold transition-colors ${
          validation?.isValid
            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
            : 'cursor-not-allowed bg-gray-800 text-gray-500'
        }`}
      >
        {validation?.isValid ? '✓ Next step →' : 'Validate first'}
      </button>

      {/* Complications */}
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
