import { Sclera, EyeInterior, Retina } from './Sclera';
import { Cornea, Iris, LimbusRing } from './Cornea';
import { Lens } from './Lens';
import { TissueDeformation } from './TissueDeformation';
import { BloodSimulation } from './BloodSimulation';

/**
 * Eyeball assembly — rendered in correct z-order (back to front):
 *
 * 1. Sclera (opaque white outer shell)
 * 2. Retina (semi-transparent inner layer)
 * 3. EyeInterior (dark inner sphere, BackSide — backdrop for front features)
 * 4. Lens (biconvex capsule + cortex + nucleus) — powered by anatomy-engine (Step 2)
 * 5. Iris + Pupil (colored ring at front, inside the eye)
 * 6. Cornea (transparent dome covering the front)
 * 7. LimbusRing (decorative ring at cornea-sclera boundary)
 * 8. TissueDeformation (indentation indicator at RCM point)
 * 9. BloodSimulation (particle-based bleeding effect)
 *
 * The new Lens component uses @openeyesim/anatomy-engine data.
 * Existing RCM needle interaction on the sclera surface remains completely unaffected.
 */
export function Eyeball() {
  return (
    <group position={[0, 0, 0]}>
      <Sclera />
      <Retina />
      <EyeInterior />
      <Lens />          {/* New in Step 2 — anatomically richer lens */}
      <Iris />
      <Cornea />
      <LimbusRing />
      <TissueDeformation />
      <BloodSimulation />
    </group>
  );
}
