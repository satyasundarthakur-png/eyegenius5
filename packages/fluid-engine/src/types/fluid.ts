export interface FluidicsState {
  chamberPressure: number;      // mmHg (normal ~15-20)
  chamberVolume: number;        // relative units
  irrigationFlow: number;       // ml/min
  aspirationFlow: number;       // ml/min
  vacuumLevel: number;          // mmHg
  viscoelasticVolume: number;   // injected viscoelastic
  leakageRate: number;          // wound leak
  stability: number;            // 0-1 chamber stability score
  isStable: boolean;
}

export interface FluidicsConfig {
  enabled: boolean;
  targetPressure: number;
  maxVacuum: number;
  irrigationEfficiency: number;
  aspirationEfficiency: number;
  viscoelasticRetention: number;
  woundLeakage: number;
}
