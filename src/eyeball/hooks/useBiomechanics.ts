import { useFrame } from "@react-three/fiber";
import { useSimulationStore } from "../stores/simulationStore";
import { biomechanics } from "../../../packages/physics-engine/src/Biomechanics";
import type { Vec3 } from "../types";

/**
 * useBiomechanics (Step 5 + pose-sync fix)
 *
 * Two responsibilities every frame:
 *   1. POSE SYNC — push tiltAlpha/tiltBeta/insertionDepth from the store into the
 *      instrument's internal pose via updateCurrentInstrumentPose(). Without this,
 *      currentInstrument.getState().pose is always null, breaking curriculum
 *      validation, the AI coach, scoring, and biomechanics collision detection.
 *
 *   2. COLLISION — check the updated tip position against lens-capsule and apply
 *      elastic deformation to TissueDeformation if a hit is detected.
 */
export function useBiomechanics() {
  const physicsEnabled = useSimulationStore((s) => s.physicsEnabled);
  const applyTissueDeformation = useSimulationStore((s) => s.applyTissueDeformation);

  useFrame(() => {
    const store = useSimulationStore.getState();
    const { currentInstrument, tiltAlpha, tiltBeta, insertionDepth } = store;
    if (!currentInstrument) return;

    // ── 1. Sync pose ──────────────────────────────────────────────────────────
    // updateCurrentInstrumentPose computes the 3-D tip position from RCM + angles
    // and stores it on the instrument object so all downstream consumers see it.
    store.updateCurrentInstrumentPose(tiltAlpha, tiltBeta, insertionDepth);

    // ── 2. Collision / deformation ────────────────────────────────────────────
    if (!physicsEnabled) return;
    const pose = currentInstrument.getState().pose;
    if (!pose) return;

    const collision = biomechanics.checkCollision(pose.tipPosition, "lens-capsule", 0.35);
    if (collision.hit && collision.point && collision.normal) {
      const force: Vec3 = [
        collision.normal[0] * collision.penetrationDepth * 0.8,
        collision.normal[1] * collision.penetrationDepth * 0.8,
        collision.normal[2] * collision.penetrationDepth * 0.8,
      ];
      applyTissueDeformation("lens-capsule", collision.point, force, collision.resistance * 1.2);
    }
  });
}
