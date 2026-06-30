import { create } from 'zustand';
import type { NeedlePose } from '../types';
import { computeNeedlePose, type RCMConfig } from '../lib/rcm';
import { MAX_INSERTION_DEPTH, MAX_TILT_ANGLE } from '../constants';

// Slices
import { createRCMSlice } from './rcmSlice';
import { createNeedleSlice } from './needleSlice';
import { createTrajectorySlice } from './trajectorySlice';
import { createHistorySlice } from './historySlice';
import { createMicroscopeSlice } from './microscopeSlice';
import { createInstrumentSlice } from './instrumentSlice';
import { createPhysicsSlice } from './physicsSlice';
import { createFluidSlice } from './fluidSlice';
import { createCurriculumSlice } from './curriculumSlice';
import { createScoringAISlice } from './scoringAISlice';
import { createReplayAnalyticsSlice } from './replayAnalyticsSlice';
import { createProcedureSlice } from './procedureSlice';
import { createUISlice } from './uiSlice';
import type { RCMSlice } from './rcmSlice';
import type { NeedleSlice } from './needleSlice';
import type { TrajectorySlice } from './trajectorySlice';
import type { HistorySlice } from './historySlice';
import type { MicroscopeSlice } from './microscopeSlice';
import type { InstrumentSlice } from './instrumentSlice';
import type { PhysicsSlice } from './physicsSlice';
import type { FluidSlice } from './fluidSlice';
import type { CurriculumSlice } from './curriculumSlice';
import type { ScoringAISlice } from './scoringAISlice';
import type { ReplayAnalyticsSlice } from './replayAnalyticsSlice';
import type { ProcedureSlice } from './procedureSlice';
import type { UISlice } from './uiSlice';

// Re-export for consumers
export type { RCMPoint } from './rcmSlice';

/** Full composed store type */
export type SimulationState = RCMSlice & NeedleSlice & TrajectorySlice & HistorySlice & MicroscopeSlice & InstrumentSlice & PhysicsSlice & FluidSlice & CurriculumSlice & ScoringAISlice & ReplayAnalyticsSlice & ProcedureSlice & UISlice & {
  getNeedlePose: () => NeedlePose | null;
};

function getRCMConfig(state: SimulationState): RCMConfig | null {
  const currentRCM = state.rcmPoints[state.currentRCMIndex];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!currentRCM) {
    return null;
  }
  return {
    rcmPoint: currentRCM.point,
    surfaceNormal: currentRCM.normal,
    maxInsertionDepth: MAX_INSERTION_DEPTH,
    maxTiltAngle: MAX_TILT_ANGLE,
  };
}

export const useSimulationStore = create<SimulationState>()((set, get, api) => ({
  ...createRCMSlice(set, get, api),
  ...createNeedleSlice(set, get, api),
  ...createTrajectorySlice(set, get, api),
  ...createHistorySlice(set, get, api),
  ...createMicroscopeSlice(set, get, api),
  ...createInstrumentSlice(set, get, api),
  ...createPhysicsSlice(set, get, api),
  ...createFluidSlice(set, get, api),
  ...createCurriculumSlice(set, get, api),
  ...createScoringAISlice(set, get, api),
  ...createReplayAnalyticsSlice(set, get, api),
  ...createProcedureSlice(set, get, api),
  ...createUISlice(set, get, api),

  getNeedlePose: () => {
    const state = get();
    const config = getRCMConfig(state);
    if (!config) return null;
    return computeNeedlePose(config, state.tiltAlpha, state.tiltBeta, state.insertionDepth);
  },
}));
