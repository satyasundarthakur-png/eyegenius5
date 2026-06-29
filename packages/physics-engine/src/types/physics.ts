import type { Vec3 } from '../../../../src/types';
import type { LayerId } from '../../../../packages/anatomy-engine/types/anatomy';

export interface CollisionResult {
  hit: boolean;
  layerId: LayerId | null;
  point: Vec3 | null;
  normal: Vec3 | null;
  penetrationDepth: number;
  resistance: number; // 0–1 normalized force feedback
}

export interface DeformationState {
  layerId: LayerId;
  points: Vec3[];
  intensity: number;
  timestamp: number;
}

export interface TearState {
  layerId: LayerId;
  startPoint: Vec3;
  currentPoint: Vec3;
  length: number;
  isPropagating: boolean;
}

export interface BiomechanicsConfig {
  enabled: boolean;
  capsuleElasticity: number;      // 0–1 multiplier
  cornealStiffness: number;
  tearPropagationSpeed: number;
  maxDeformation: number;         // mm
}
