import type { InstrumentConfig, InstrumentState, InstrumentPose, InstrumentType, TipGeometryDescriptor } from './types/instrument';
import type { Vec3 } from '../../../src/types';
import { computeNeedlePose, type RCMConfig } from '../../../src/lib/rcm';
import { MAX_INSERTION_DEPTH, MAX_TILT_ANGLE } from '../../../src/constants';

/**
 * Base class for all surgical instruments in OpenEyeSim AI.
 * Provides common state, RCM kinematics (when applicable), and pose computation.
 *
 * Specific instruments (Keratome, PhacoTip, Forceps, etc.) extend this class
 * and override geometry, behavior, and interaction rules.
 */
export abstract class Instrument {
  protected config: InstrumentConfig;
  protected state: InstrumentState;

  constructor(config: InstrumentConfig) {
    this.config = {
      ...config,
      maxInsertionDepth: Math.min(config.maxInsertionDepth, MAX_INSERTION_DEPTH),
      maxTiltAngle: Math.min(config.maxTiltAngle, MAX_TILT_ANGLE),
    };
    this.state = {
      type: config.type,
      pose: null,
      isActive: false,
      isRCMConstrained: config.usesRCM,
    };
  }

  getType(): InstrumentType {
    return this.config.type;
  }

  getConfig(): InstrumentConfig {
    return this.config;
  }

  getState(): InstrumentState {
    return { ...this.state };
  }

  setActive(active: boolean) {
    this.state.isActive = active;
  }

  setRCM(rcmPoint: Vec3, surfaceNormal: Vec3) {
    this.state.rcmPoint = rcmPoint;
    this.state.surfaceNormal = surfaceNormal;
  }

  clearRCM() {
    this.state.rcmPoint = undefined;
    this.state.surfaceNormal = undefined;
  }

  /**
   * Compute the current pose of the instrument.
   * For RCM-constrained instruments, this reuses the existing high-quality rcm.ts logic.
   */
  computePose(alpha: number, beta: number, depth: number): InstrumentPose | null {
    if (!this.state.rcmPoint || !this.state.surfaceNormal) {
      return null;
    }

    if (this.config.usesRCM) {
      const rcmConfig: RCMConfig = {
        rcmPoint: this.state.rcmPoint,
        surfaceNormal: this.state.surfaceNormal,
        maxInsertionDepth: this.config.maxInsertionDepth,
        maxTiltAngle: this.config.maxTiltAngle,
      };

      const pose = computeNeedlePose(rcmConfig, alpha, beta, depth);

      return {
        tipPosition: pose.tipPosition,
        shaftDirection: pose.shaftDirection,
        transform: pose.needleTransform,
        tiltAlpha: pose.tiltAlpha,
        tiltBeta: pose.tiltBeta,
        insertionDepth: pose.insertionDepth,
      };
    }

    // Non-RCM instruments (future: phaco, vitrector, etc.) can have custom kinematics here
    return null;
  }

  updatePose(pose: InstrumentPose) {
    this.state.pose = pose;
  }

  abstract getDisplayName(): string;
  abstract getTipGeometry(): TipGeometryDescriptor;
}
