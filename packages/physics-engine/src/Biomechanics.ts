import type { Vec3 } from '../../../src/eyeball/types';
import type { LayerId } from '../../anatomy-engine/types/anatomy';
import type { CollisionResult, DeformationState, TearState, BiomechanicsConfig } from './types/physics';
import { eyeAnatomy } from '../../anatomy-engine/src/EyeAnatomy';

/**
 * OpenEyeSim AI — Biomechanics & Collision Engine (Step 5)
 *
 * Handles realistic tissue interaction:
 * - Collision detection between instrument tip and anatomical layers
 * - Elastic deformation (capsule, cornea, iris)
 * - Penetration resistance & force feedback
 * - Basic tear propagation foundation (for capsulorhexis in Step 7)
 *
 * Designed to work with anatomy-engine layers and instrument-engine tools.
 */

const DEFAULT_CONFIG: BiomechanicsConfig = {
  enabled: true,
  capsuleElasticity: 0.85,
  cornealStiffness: 0.7,
  tearPropagationSpeed: 0.6,
  maxDeformation: 1.8,
};

export class Biomechanics {
  private config: BiomechanicsConfig;
  private deformations: Map<LayerId, DeformationState> = new Map();
  private tears: TearState[] = [];

  constructor(config?: Partial<BiomechanicsConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getConfig(): BiomechanicsConfig {
    return { ...this.config };
  }

  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
  }

  /**
   * Simple sphere-based collision detection against a layer.
   * In later steps this can be upgraded to proper mesh-ray or signed distance field.
   */
  checkCollision(
    tipPosition: Vec3,
    layerId: LayerId,
    instrumentRadius = 0.4
  ): CollisionResult {
    if (!this.config.enabled) {
      return { hit: false, layerId: null, point: null, normal: null, penetrationDepth: 0, resistance: 0 };
    }

    const layer = eyeAnatomy.getLayer(layerId);
    if (!layer) {
      return { hit: false, layerId: null, point: null, normal: null, penetrationDepth: 0, resistance: 0 };
    }

    const layerRadius = layer.radius || 12;
    const center: Vec3 = [0, 0, 0];

    // Distance from eye center to instrument tip
    const dx = tipPosition[0] - center[0];
    const dy = tipPosition[1] - center[1];
    const dz = tipPosition[2] - center[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const surfaceDistance = distance - layerRadius;
    const hit = surfaceDistance < instrumentRadius;

    if (!hit) {
      return { hit: false, layerId, point: null, normal: null, penetrationDepth: 0, resistance: 0 };
    }

    const penetration = Math.max(0, instrumentRadius - surfaceDistance);
    const resistance = Math.min(1, penetration / (layer.thickness * 2));

    // Approximate normal (radial from center)
    const normal: Vec3 = [
      dx / (distance || 1),
      dy / (distance || 1),
      dz / (distance || 1),
    ];

    const contactPoint: Vec3 = [
      center[0] + normal[0] * layerRadius,
      center[1] + normal[1] * layerRadius,
      center[2] + normal[2] * layerRadius,
    ];

    return {
      hit: true,
      layerId,
      point: contactPoint,
      normal,
      penetrationDepth: penetration,
      resistance,
    };
  }

  /**
   * Apply elastic deformation to a layer (used by instrument interaction).
   */
  applyDeformation(layerId: LayerId, point: Vec3, force: Vec3, intensity = 1.0): void {
    if (!this.config.enabled) return;

    const layer = eyeAnatomy.getLayer(layerId);
    if (!layer || !layer.cuttable) return;

    const elasticity = layerId === 'lens-capsule' 
      ? this.config.capsuleElasticity 
      : this.config.cornealStiffness;

    const effectiveIntensity = intensity * elasticity;

    if (!this.deformations.has(layerId)) {
      this.deformations.set(layerId, {
        layerId,
        points: [],
        intensity: 0,
        timestamp: Date.now(),
      });
    }

    const def = this.deformations.get(layerId);
    if (!def) return;
    def.points.push([
      point[0] + force[0] * effectiveIntensity * 0.3,
      point[1] + force[1] * effectiveIntensity * 0.3,
      point[2] + force[2] * effectiveIntensity * 0.3,
    ]);

    // Cap number of deformation points
    if (def.points.length > 80) {
      def.points.shift();
    }

    def.intensity = Math.min(this.config.maxDeformation, def.intensity + effectiveIntensity * 0.15);
    def.timestamp = Date.now();

    // Also feed into anatomy engine for consistency
    eyeAnatomy.applyDeformation(layerId, point, force, effectiveIntensity);
  }

  getDeformation(layerId: LayerId): DeformationState | undefined {
    return this.deformations.get(layerId);
  }

  /**
   * Start a controlled tear (foundation for capsulorhexis).
   */
  startTear(layerId: LayerId, startPoint: Vec3): void {
    if (!this.config.enabled) return;

    this.tears.push({
      layerId,
      startPoint: [...startPoint] as Vec3,
      currentPoint: [...startPoint] as Vec3,
      length: 0,
      isPropagating: true,
    });
  }

  propagateTear(layerId: LayerId, direction: Vec3, amount: number): void {
    const tear = this.tears.find(t => t.layerId === layerId && t.isPropagating);
    if (!tear) return;

    tear.currentPoint[0] += direction[0] * amount * this.config.tearPropagationSpeed;
    tear.currentPoint[1] += direction[1] * amount * this.config.tearPropagationSpeed;
    tear.currentPoint[2] += direction[2] * amount * this.config.tearPropagationSpeed;
    tear.length += amount * this.config.tearPropagationSpeed;
  }

  getActiveTears(): TearState[] {
    return this.tears.filter(t => t.isPropagating);
  }

  reset(): void {
    this.deformations.clear();
    this.tears = [];
  }
}

// Singleton instance
export const biomechanics = new Biomechanics();
