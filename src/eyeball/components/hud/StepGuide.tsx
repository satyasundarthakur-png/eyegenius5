import { useSimulationStore } from '../../stores/simulationStore';

/** Per-step instructions shown inline on the operative field. */
const STEP_GUIDE: Record<string, { title: string; action: string; instrument: string }> = {
  incision: {
    title: '① Incision',
    action: 'Insert the keratome 2.5–4 mm at a shallow angle into the limbal zone.',
    instrument: 'Keratome',
  },
  capsulorhexis: {
    title: '② Capsulorhexis',
    action: 'Advance forceps 1.5–4.5 mm into the anterior chamber. Maintain low elevation angle for a controlled CCC.',
    instrument: 'Capsulorhexis Forceps',
  },
  hydrodissection: {
    title: '③ Hydrodissection',
    action: 'Insert cannula 1–3 mm just under the capsule edge. Inject a gentle fluid wave to free the lens.',
    instrument: 'Hydro Cannula',
  },
  phacoemulsification: {
    title: '④ Phacoemulsification',
    action: 'Advance phaco tip 5–8 mm into the nucleus. Maintain chamber stability (watch the fluidics panel).',
    instrument: 'Phaco Tip',
  },
  cortex_removal: {
    title: '⑤ Cortex Removal',
    action: 'Use I/A to aspirate remaining cortex. Maintain vacuum < 280 mmHg and chamber stability > 70%.',
    instrument: 'I/A Handpiece',
  },
  iol_insertion: {
    title: '⑥ IOL Insertion',
    action: 'Advance injector 0.5–3.5 mm through the incision. Slow, controlled delivery into the capsular bag.',
    instrument: 'IOL Injector',
  },
  wound_hydration: {
    title: '⑦ Wound Hydration',
    action: 'Final step: hydrate the incision to seal the wound. Advance gently and confirm watertight closure.',
    instrument: 'Hydro Cannula',
  },
};

const PLACE_GUIDE = {
  title: 'Place Entry Point',
  action: 'Click anywhere on the white sclera to set the instrument entry (RCM) point.',
  instrument: '',
};

const VIEW_GUIDE = {
  title: 'Free Observation',
  action: 'Press P to enter Place mode and click the eye to begin. Open ☰ Help → Cataract Curriculum → Start Procedure.',
  instrument: '',
};

export function StepGuide() {
  const currentStep      = useSimulationStore((s) => s.currentCurriculumStep);
  const procedureStarted = useSimulationStore((s) => s.procedureStarted);
  const selectedProc     = useSimulationStore((s) => s.selectedProcedure);
  const mode             = useSimulationStore((s) => s.mode);
  const phase            = useSimulationStore((s) => s.phase);

  // Hide once complete
  if (phase === 'COMPLETE' || currentStep === 'complete') return null;

  let guide = VIEW_GUIDE as typeof PLACE_GUIDE;

  if (mode === 'PLACE') {
    guide = PLACE_GUIDE;
  } else if (selectedProc === 'cataract' && procedureStarted && STEP_GUIDE[currentStep]) {
    guide = STEP_GUIDE[currentStep];
  }

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-40 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-blue-500/25 bg-gray-950/80 px-4 py-1.5 backdrop-blur">
        <span className="text-[11px] font-semibold text-blue-300">{guide.title}</span>
        <span className="h-3 w-px bg-blue-500/30" />
        <span className="max-w-xs text-[11px] text-blue-200/70">{guide.action}</span>
        {guide.instrument && (
          <>
            <span className="h-3 w-px bg-blue-500/30" />
            <span className="rounded bg-blue-600/30 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">
              {guide.instrument}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
