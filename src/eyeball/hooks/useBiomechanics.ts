import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../stores/simulationStore';
import { biomechanics } from '../../../packages/physics-engine/src/Biomechanics';
import type { Vec3 } from '../types';

/**
 * useBiomechanics (Step 5)
 *
 * Runs biomechanics simulation every frame.
 * Applies collision detection and deformation when an active instrument
 * interacts with tissue layers (especially lens capsule).
 */
export function useBiomechanics() {
  const currentInstrument = useSimulationStore((s) => s.currentInstrument);
  const physicsEnabled = useSimulationStore((s) => s.physicsEnabled);
  const applyTissueDeformation = useSimulationStore((s) => s.applyTissueDeformation);

  useFrame(() => {
    if (!physicsEnabled || !currentInstrument) return;

    const pose = currentInstrument.getState().pose;
    if (!pose) return;

    // Check collision with lens capsule (most important for cataract steps)
    const collision = biomechanics.checkCollision(pose.tipPosition, 'lens-capsule', 0.35);

    if (collision.hit && collision.point && collision.normal) {
      // Apply elastic deformation to capsule
      const force: Vec3 = [
        collision.normal[0] * collision.penetrationDepth * 0.8,
        collision.normal[1] * collision.penetrationDepth * 0.8,
        collision.normal[2] * collision.penetrationDepth * 0.8,
      ];

      applyTissueDeformation('lens-capsule', collision.point, force, collision.resistance * 1.2);
    }
  });
}
