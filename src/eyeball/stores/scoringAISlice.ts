import type { StateCreator } from "zustand";
import type { SimulationState } from "./simulationStore";
import { scoringEngine } from "../../../packages/scoring-engine/src/ScoringEngine";
import { aiCoach, type CoachingFeedback } from "../../../packages/ai-engine/src/AICoach";
import type { ScoringSession } from "../../../packages/scoring-engine/src/types/scoring";
import type { InstrumentPose } from "../../../packages/instrument-engine/src/types/instrument";
import type { CataractStep } from "../../../packages/curriculum/src/types/curriculum";

export interface ScoringAISlice {
  scoring: ScoringSession;
  lastCoachingFeedback: CoachingFeedback | null;

  updateScoring: (
    pose: InstrumentPose | null,
    deltaTime: number,
    complicationsCount: number,
  ) => void;
  getCoachingFeedback: (
    currentStep: CataractStep,
    complicationsCount: number,
  ) => CoachingFeedback | null;
  resetScoringAndCoaching: () => void;
}

export const createScoringAISlice: StateCreator<SimulationState, [], [], ScoringAISlice> = (
  set,
) => ({
  scoring: scoringEngine.getSession(),
  lastCoachingFeedback: null,

  updateScoring: (pose, deltaTime, complicationsCount) => {
    scoringEngine.update(pose, deltaTime, complicationsCount);
    set({ scoring: scoringEngine.getSession() });
  },

  getCoachingFeedback: (currentStep, complicationsCount) => {
    const feedback = aiCoach.generateFeedback(
      scoringEngine.getSession(),
      currentStep,
      complicationsCount,
    );
    if (feedback) {
      set({ lastCoachingFeedback: feedback });
    }
    return feedback;
  },

  resetScoringAndCoaching: () => {
    scoringEngine.reset();
    aiCoach.reset();
    set({
      scoring: scoringEngine.getSession(),
      lastCoachingFeedback: null,
    });
  },
});
