import { useEffect } from 'react';
import { useSimulationStore } from '../stores/simulationStore';

/**
 * useCurriculum (Step 7)
 * Listens to instrument changes and automatically validates the current curriculum step.
 */
export function useCurriculum() {
  const currentInstrument = useSimulationStore((s) => s.currentInstrument);
  const validateCurrentCurriculumStep = useSimulationStore((s) => s.validateCurrentCurriculumStep);
  const currentStep = useSimulationStore((s) => s.currentCurriculumStep);
  const selectedProcedure = useSimulationStore((s) => s.selectedProcedure);
  const procedureStarted = useSimulationStore((s) => s.procedureStarted);

  useEffect(() => {
    if (selectedProcedure !== 'cataract' || !procedureStarted) return;
    if (!currentInstrument || currentStep === 'complete' || currentStep === 'idle') return;

    const pose = currentInstrument.getState().pose;
    if (!pose) return;

    // Auto-validate on significant instrument movement
    validateCurrentCurriculumStep(
      currentInstrument.getType(),
      pose.insertionDepth,
      pose.tiltAlpha
    );
  }, [currentInstrument, currentStep, validateCurrentCurriculumStep, selectedProcedure, procedureStarted]);
}
