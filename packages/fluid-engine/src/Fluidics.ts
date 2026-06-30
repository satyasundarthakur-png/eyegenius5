import type { FluidicsState, FluidicsConfig } from './types/fluid';

/**
 * OpenEyeSim AI — Fluidics Engine (Step 6)
 *
 * Simulates anterior chamber fluid dynamics during cataract surgery:
 * - Irrigation / Aspiration balance
 * - Vacuum control
 * - Viscoelastic injection and retention
 * - Wound leakage
 * - Chamber stability (critical for safe surgery)
 *
 * Used by I/A handpiece, phaco tip, and future viscoelastic injector.
 */

const DEFAULT_CONFIG: FluidicsConfig = {
  enabled: true,
  targetPressure: 18,           // mmHg
  maxVacuum: 400,
  irrigationEfficiency: 0.92,
  aspirationEfficiency: 0.88,
  viscoelasticRetention: 0.75,
  woundLeakage: 0.08,
};

export class Fluidics {
  private config: FluidicsConfig;
  private state: FluidicsState;

  constructor(config?: Partial<FluidicsConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = this.createInitialState();
  }

  private createInitialState(): FluidicsState {
    return {
      // Anterior chamber starts collapsed (pressure 8 mmHg, well below the
      // 18 mmHg target). The surgeon must run irrigation to raise pressure
      // to a stable working level before hydro/phaco/cortex steps validate.
      chamberPressure: 8,
      chamberVolume: 0.6,
      irrigationFlow: 0,
      aspirationFlow: 0,
      vacuumLevel: 0,
      viscoelasticVolume: 0,
      leakageRate: this.config.woundLeakage,
      stability: 0.2,   // low — only rises with active irrigation
      isStable: false,  // unlocked only once stability > 0.65
    };
  }

  getState(): FluidicsState {
    return { ...this.state };
  }

  getConfig(): FluidicsConfig {
    return { ...this.config };
  }

  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
  }

  /**
   * Main simulation step — call every frame when fluidics is active.
   */
  update(deltaTime: number, instrumentActive: boolean, instrumentType?: string) {
    if (!this.config.enabled) return;

    const dt = Math.min(deltaTime, 0.05); // cap for stability

    // Base leakage
    let pressureChange = -this.config.woundLeakage * 12 * dt;

    // Irrigation effect (when I/A or phaco is active)
    if (instrumentActive && (instrumentType === 'irrigation_aspiration' || instrumentType === 'phaco_tip' || instrumentType === 'hydrodissection_cannula')) {
      const irrigation = 45 * this.config.irrigationEfficiency; // ml/min
      this.state.irrigationFlow = irrigation;
      pressureChange += (irrigation / 60) * 0.8 * dt;
    } else {
      this.state.irrigationFlow = Math.max(0, this.state.irrigationFlow * 0.6);
    }

    // Aspiration + Vacuum
    if (instrumentActive && instrumentType === 'irrigation_aspiration') {
      const vacuum = Math.min(this.config.maxVacuum, 180 + this.state.vacuumLevel * 0.6);
      this.state.vacuumLevel = vacuum;
      const aspiration = (vacuum / this.config.maxVacuum) * 28 * this.config.aspirationEfficiency;
      this.state.aspirationFlow = aspiration;
      pressureChange -= (aspiration / 60) * 1.1 * dt;
    } else {
      this.state.vacuumLevel = Math.max(0, this.state.vacuumLevel * 0.5);
      this.state.aspirationFlow = Math.max(0, this.state.aspirationFlow * 0.5);
    }

    // Viscoelastic effect (increases stability and pressure retention)
    if (this.state.viscoelasticVolume > 0.01) {
      pressureChange += this.state.viscoelasticVolume * 18 * dt;
      this.state.viscoelasticVolume *= (1 - 0.08 * dt); // gradual washout
    }

    // Apply pressure change
    this.state.chamberPressure = Math.max(4, Math.min(45, this.state.chamberPressure + pressureChange));

    // Update volume (simplified)
    this.state.chamberVolume = 0.7 + (this.state.chamberPressure / 25) * 0.3;

    // Calculate stability
    const pressureDeviation = Math.abs(this.state.chamberPressure - this.config.targetPressure);
    this.state.stability = Math.max(0.3, 1 - pressureDeviation / 18);
    this.state.isStable = this.state.stability > 0.65;

    // Clamp values
    this.state.chamberPressure = Math.max(5, Math.min(40, this.state.chamberPressure));
  }

  /** Inject viscoelastic (used by future IOL injector or manual injection) */
  injectViscoelastic(amount: number) {
    this.state.viscoelasticVolume = Math.min(0.8, this.state.viscoelasticVolume + amount);
    this.state.chamberPressure += amount * 22;
  }

  /** Set manual vacuum level (from foot pedal or UI) */
  setVacuum(level: number) {
    this.state.vacuumLevel = Math.max(0, Math.min(this.config.maxVacuum, level));
  }

  reset() {
    this.state = this.createInitialState();
  }
}

// Singleton
export const fluidics = new Fluidics();
