import { Sclera, EyeInterior, Retina } from "./Sclera";
import {
  AqueousHumour,
  CapsulorhexisGuide,
  Cornea,
  CorneaCatchlight,
  Iris,
  LimbusRing,
} from "./Cornea";
import { Lens } from "./Lens";
import { TissueDeformation } from "./TissueDeformation";
import { BloodSimulation } from "./BloodSimulation";
import { SurgicalField } from "./SurgicalField";

/**
 * Eyeball assembly — rendered in correct z-order (back to front):
 *
 * 1.  Sclera              — ivory-white outer shell, matte
 * 2.  Retina              — fundal red-reflex background with macula/vessels
 * 3.  EyeInterior         — dark inner sphere (BackSide), backdrop for iris/lens
 * 4.  Lens                — capsule + cortical spokes + amber nuclear sclerosis
 * 5.  CapsulorhexisGuide  — pulsing yellow CCC target ring (rhexis step only)
 * 6.  Iris                — narrow coloured annulus, pupil 86% of iris outer
 * 7.  AqueousHumour       — slow shimmer disc in the anterior chamber space
 * 8.  Cornea              — near-colourless refractive dome (transmission 0.97)
 * 9.  CorneaCatchlight    — Purkinje reflection sprite, superior-nasal offset
 * 10. LimbusRing          — corneoscleral junction torus
 * 11. SurgicalField       — limbal conjunctiva, episcleral conjunctiva,
 *                           periocular skin, fenestrated drape (no speculum)
 * 12. TissueDeformation   — indentation indicator at entry point
 * 13. BloodSimulation     — particle bleeding effect
 */
export function Eyeball() {
  return (
    <group position={[0, 0, 0]}>
      <Sclera />
      <Retina />
      <EyeInterior />
      <Lens />
      <CapsulorhexisGuide />
      <Iris />
      <AqueousHumour />
      <Cornea />
      <CorneaCatchlight />
      <LimbusRing />
      <SurgicalField />
      <TissueDeformation />
      <BloodSimulation />
    </group>
  );
}
