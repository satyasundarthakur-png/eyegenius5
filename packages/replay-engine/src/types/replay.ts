import type { Vec3 } from '../../../../src/eyeball/types';

export interface ReplayEvent {
  timestamp: number;
  type: string;                    // 'RCM_PLACED', 'INCISION_START', 'CAPSULE_TEAR', 'COMPLICATION', etc.
  data: Record<string, unknown>;
  position?: Vec3;
}

export interface EnhancedTrailPoint {
  tipPosition: Vec3;
  tiltAlpha: number;
  tiltBeta: number;
  insertionDepth: number;
  timestamp: number;
  events?: ReplayEvent[];          // Events that occurred at this moment
}

export interface ReplaySession {
  id: string;
  startTime: number;
  duration: number;
  trailData: EnhancedTrailPoint[];
  events: ReplayEvent[];
  metadata: {
    instrumentUsed: string;
    finalScore: number;
    complications: number;
    curriculumStep?: string;
  };
}
