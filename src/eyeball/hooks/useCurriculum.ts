import { useEffect } from "react";
import { useSimulationStore } from "../stores/simulationStore";

/**
 * useCurriculum (Step 7 — fixed)
 *
 * Previously: only re-validated when currentInstrument reference changed (instrument switch).
 * Root cause of "Advance button always greyed out": instrument.getState().pose was never
 * populated (updateCurrentInstrumentPose was never called), so all validation conditions
 * relying on insertionDepth/tiltAlpha from the pose always saw 0/null.
 *
 * Fixed: subscribe to insertionDepth, tiltAlpha, and currentInstrument.
 * useBiomechanics now syncs pose every frame, so by the time this effect fires
 * the pose is already up-to-date. We pass store values directly to avoid
 * a one-frame lag.
 */
export function useCurriculum() {
  const currentInstrument = useSimulationStore((s) => s.currentInstrument);
  const insertionDepth = useSimulationStore((s) => s.insertionDepth);
  const tiltAlpha = useSimulationStore((s) => s.tiltAlpha);
  const validateCurrentCurriculumStep = useSimulationStore((s) => s.validateCurrentCurriculumStep);
  const currentStep = useSimulationStore((s) => s.currentCurriculumStep);
  const selectedProcedure = useSimulationStore((s) => s.selectedProcedure);
  const procedureStarted = useSimulationStore((s) => s.procedureStarted);

  useEffect(() => {
    if (selectedProcedure !== "cataract" || !procedureStarted) return;
    if (!currentInstrument || currentStep === "complete" || currentStep === "idle") return;

    // Pass store values directly — instrument pose is also synced by useBiomechanics
    // but we don't want a one-frame lag here; the curriculum only needs type + depth + alpha.
    validateCurrentCurriculumStep(currentInstrument.getType(), insertionDepth, tiltAlpha);
  }, [
    currentInstrument,
    insertionDepth,
    tiltAlpha,
    currentStep,
    validateCurrentCurriculumStep,
    selectedProcedure,
    procedureStarted,
  ]);
}
