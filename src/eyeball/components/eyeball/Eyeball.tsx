import { Sclera, EyeInterior, Retina } from './Sclera';
import { Cornea, CorneaCatchlight, Iris, LimbusRing, CapsulorhexisGuide } from './Cornea';
import { Lens } from './Lens';
import { TissueDeformation } from './TissueDeformation';
import { BloodSimulation } from './BloodSimulation';
import { SurgicalField } from './SurgicalField';

/**
 * Eyeball assembly — rendered in correct z-order (back to front):
 *
 * 1. Sclera (opaque white outer shell)
 * 2. Retina (semi-transparent inner layer)
 * 3. EyeInterior (dark inner sphere, BackSide — backdrop for front features)
 * 4. Lens (biconvex capsule + cortex + nucleus) — powered by anatomy-engine (Step 2)
 * 5. CapsulorhexisGuide (pulsing CCC guide ring, cataract rhexis step only)
 * 6. Iris + Pupil (colored ring at front, inside the eye)
 * 7. Cornea (transparent dome covering the front)
 * 8. LimbusRing (decorative ring at cornea-sclera boundary)
 * 9. SurgicalField — periocular skin, lid speculum, fenestrated drape.
 *    Surrounds the limbus without covering it, so the cornea/iris/pupil view
 *    is completely unobstructed; replaces the bare-sphere look with a
 *    properly draped, exam-realistic operative field.
 * 10. TissueDeformation (indentation indicator at RCM point)
 * 11. BloodSimulation (particle-based bleeding effect)
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
      <Lens />
      <CapsulorhexisGuide />  {/* Pulsing CCC zone — visible during capsulorhexis step only */}
      <Iris />
      <Cornea />
      <CorneaCatchlight />
      <LimbusRing />
      <SurgicalField />
      <TissueDeformation />
      <BloodSimulation />
    </group>
  );
}
