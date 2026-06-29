import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../stores/simulationStore';

/**
 * useScoringAI (Step 8)
 * Continuously updates scoring metrics and generates coaching feedback.
 */
export function useScoringAI() {
  const currentInstrument = useSimulationStore((s) => s.currentInstrument);
  const updateScoring = useSimulationStore((s) => s.updateScoring);
  const getCoachingFeedback = useSimulationStore((s) => s.getCoachingFeedback);
  const currentStep = useSimulationStore((s) => s.currentCurriculumStep);
  const complications = useSimulationStore((s) => s.complications);

  useFrame((_, delta) => {
    if (!currentInstrument) return;

    const pose = currentInstrument.getState().pose;
    const complicationsCount = complications.length;

    if (pose) {
      updateScoring(pose, delta, complicationsCount);

      // Occasionally request coaching feedback
      if (Math.random() < 0.08) {
        getCoachingFeedback(currentStep, complicationsCount);
      }
    }
  });
}
