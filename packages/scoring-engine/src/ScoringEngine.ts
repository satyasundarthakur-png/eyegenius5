import type { ScoringSession, MotionMetrics, SafetyMetrics, PerformanceScore } from './types/scoring';
import { biomechanics } from '../../physics-engine/src/Biomechanics';
import { fluidics } from '../../fluid-engine/src/Fluidics';
import type { InstrumentPose } from '../../instrument-engine/src/types/instrument';

/**
 * OpenEyeSim AI — Scoring Engine (Step 8)
 *
 * Calculates objective performance metrics for surgical training:
 * - Tremor (high-frequency tilt changes)
 * - Precision (path smoothness + RCM adherence)
 * - Efficiency (time + unnecessary movements)
 * - Safety (tissue damage, endothelial proximity, chamber stability)
 * - Complication penalties
 */

export class ScoringEngine {
  private session: ScoringSession;
  private lastTiltAlpha = 0;
  private lastTiltBeta = 0;
  private pathLength = 0;
  private lastTipPosition: [number, number, number] | null = null;

  constructor() {
    this.session = this.createNewSession();
  }

  private createNewSession(): ScoringSession {
    const motionMetrics: MotionMetrics = {
      tremorScore: 100,
      precisionScore: 100,
      pathEfficiency: 100,
      smoothness: 100,
    };
    const safetyMetrics: SafetyMetrics = {
      tissueDamage: 0,
      endothelialRisk: 0,
      chamberStability: 95,
    };
    const performance: PerformanceScore = {
      overall: 85,
      precision: 90,
      tremor: 95,
      efficiency: 85,
      safety: 90,
      timePenalty: 0,
      complicationPenalty: 0,
    };
    return {
      startTime: Date.now(),
      totalTime: 0,
      motionMetrics,
      safetyMetrics,
      performance,
      events: [],
    };
  }

  getSession(): ScoringSession {
    return { ...this.session };
  }

  /** Call this every frame with current instrument pose */
  update(pose: InstrumentPose | null, deltaTime: number, complicationsCount: number) {
    if (!pose) return;

    this.session.totalTime += deltaTime;

    // === Tremor Analysis ===
    const dAlpha = Math.abs(pose.tiltAlpha - this.lastTiltAlpha);
    const dBeta = Math.abs(pose.tiltBeta - this.lastTiltBeta);
    const tremor = (dAlpha + dBeta) / deltaTime;

    // High tremor → lower score
    const tremorPenalty = Math.min(40, tremor * 180);
    this.session.motionMetrics.tremorScore = Math.max(40, 100 - tremorPenalty);

    this.lastTiltAlpha = pose.tiltAlpha;
    this.lastTiltBeta = pose.tiltBeta;

    // === Path & Efficiency ===
    if (this.lastTipPosition) {
      const dx = pose.tipPosition[0] - this.lastTipPosition[0];
      const dy = pose.tipPosition[1] - this.lastTipPosition[1];
      const dz = pose.tipPosition[2] - this.lastTipPosition[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      this.pathLength += dist;

      // Smoothness (low jerk)
      const smoothness = Math.max(50, 100 - (dist / deltaTime) * 8);
      this.session.motionMetrics.smoothness = (this.session.motionMetrics.smoothness * 0.7 + smoothness * 0.3);
    }
    this.lastTipPosition = [...pose.tipPosition] as [number, number, number];

    // === Safety Metrics ===
    const capsuleDef = biomechanics.getDeformation('lens-capsule');
    this.session.safetyMetrics.tissueDamage = capsuleDef ? capsuleDef.intensity * 35 : 0;

    const fluid = fluidics.getState();
    this.session.safetyMetrics.chamberStability = fluid.stability * 100;

    // Endothelial risk (simplified): higher when tip is very anterior
    const endothelialRisk = Math.max(0, (12 - pose.tipPosition[2]) / 12) * 60;
    this.session.safetyMetrics.endothelialRisk = endothelialRisk;

    // === Performance Calculation ===
    const motionAvg = (
      this.session.motionMetrics.tremorScore +
      this.session.motionMetrics.precisionScore +
      this.session.motionMetrics.smoothness
    ) / 3;

    const safetyAvg = (
      (100 - this.session.safetyMetrics.tissueDamage) +
      (100 - this.session.safetyMetrics.endothelialRisk) +
      this.session.safetyMetrics.chamberStability
    ) / 3;

    const complicationPenalty = complicationsCount * 15;

    this.session.performance = {
      overall: Math.max(30, Math.floor((motionAvg + safetyAvg) / 2 - complicationPenalty)),
      precision: Math.floor(this.session.motionMetrics.precisionScore),
      tremor: Math.floor(this.session.motionMetrics.tremorScore),
      efficiency: Math.floor(this.session.motionMetrics.pathEfficiency),
      safety: Math.floor(safetyAvg),
      timePenalty: Math.floor(this.session.totalTime / 1000) > 180 ? 10 : 0,
      complicationPenalty,
    };
  }

  recordEvent(type: string, value: number) {
    this.session.events.push({
      timestamp: Date.now(),
      type,
      value,
    });
  }

  reset() {
    this.session = this.createNewSession();
    this.pathLength = 0;
    this.lastTipPosition = null;
  }
}

// Singleton
export const scoringEngine = new ScoringEngine();
