import type { Vec3 } from '../../../../src/eyeball/types';

/** Supported surgical instrument types in OpenEyeSim AI */
export type InstrumentType =
  | 'keratome'
  | 'capsulorhexis_forceps'
  | 'hydrodissection_cannula'
  | 'phaco_tip'
  | 'irrigation_aspiration'
  | 'iol_injector'
  | 'vitrector'
  | 'endolaser'
  | 'micro_forceps'
  | 'needle'; // legacy / generic RCM needle

export interface InstrumentPose {
  tipPosition: Vec3;
  shaftDirection: Vec3;
  /** 4x4 transform matrix (column-major) for the whole instrument */
  transform: Float64Array;
  tiltAlpha: number;
  tiltBeta: number;
  insertionDepth: number;
}

export interface InstrumentState {
  type: InstrumentType;
  pose: InstrumentPose | null;
  isActive: boolean;
  isRCMConstrained: boolean; // true for most anterior segment tools
  rcmPoint?: Vec3;
  surfaceNormal?: Vec3;
}

export type TipGeometryDescriptor =
  | { type: 'blade'; width: number; length: number }
  | { type: 'forceps'; jawLength: number; opening: number }
  | { type: 'phaco'; diameter: number; length: number; bevel: number }
  | { type: 'ia'; diameter: number; length: number }
  | { type: 'cannula'; diameter: number; length: number; curved: boolean }
  | { type: 'injector'; barrelDiameter: number; length: number }
  | { type: 'vitrector'; diameter: number; length: number; portLength: number }
  | { type: 'laser'; diameter: number; length: number };

/** Base configuration for any instrument */
export interface InstrumentConfig {
  type: InstrumentType;
  name: string;
  /** Whether this instrument uses RCM kinematics (like the original needle) */
  usesRCM: boolean;
  /** Maximum insertion depth in mm */
  maxInsertionDepth: number;
  /** Maximum tilt angle in radians */
  maxTiltAngle: number;
  /** Visual / physical tip length */
  tipLength: number;
  /** Color for force feedback / status */
  color: string;
}
