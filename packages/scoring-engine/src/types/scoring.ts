export interface MotionMetrics {
  tremorScore: number;        // 0-100 (lower is better)
  precisionScore: number;     // 0-100
  pathEfficiency: number;     // 0-100
  smoothness: number;         // 0-100
}

export interface SafetyMetrics {
  tissueDamage: number;       // cumulative deformation
  endothelialRisk: number;    // how close to cornea
  chamberStability: number;   // from fluidics
}

export interface PerformanceScore {
  overall: number;            // 0-100
  precision: number;
  tremor: number;
  efficiency: number;
  safety: number;
  timePenalty: number;
  complicationPenalty: number;
}

export interface ScoringSession {
  startTime: number;
  totalTime: number;
  motionMetrics: MotionMetrics;
  safetyMetrics: SafetyMetrics;
  performance: PerformanceScore;
  events: Array<{ timestamp: number; type: string; value: number }>;
}
