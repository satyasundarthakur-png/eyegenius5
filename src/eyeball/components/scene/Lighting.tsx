import { useSimulationStore } from "../../stores/simulationStore";
import { microscope } from "../../../../packages/microscope-engine/src/Microscope";

/**
 * Lighting setup enhanced with virtual operating microscope illumination (Step 3).
 *
 * - Coaxial light: strong on-axis illumination (creates red reflex through pupil/lens)
 * - Oblique light: side lighting for surface texture and depth perception
 * - Red reflex contribution via emissive/intensity on retina/lens area
 *
 * The microscope engine controls intensities in real time. When the microscope
 * is OFF (free observation mode), getLightIntensities() scales the coaxial
 * "headlight" down and boosts ambient/oblique fill so the eye reads as a real
 * 3D object with shading depth, instead of the flat, shadowless look that a
 * full-strength on-axis light produces.
 */
export function Lighting() {
  // Subscribing keeps this component re-rendering when microscope state changes
  // (the slider panel mutates the same singleton instance read here).
  useSimulationStore((s) => s.microscope);
  const intensities = microscope.getLightIntensities();
  const coaxialPosition = microscope.getCoaxialLightPosition();

  return (
    <>
      <ambientLight intensity={intensities.ambient} />

      {/* Coaxial (on-axis) illumination — key for red reflex in cataract surgery */}
      <directionalLight
        position={coaxialPosition}
        intensity={intensities.coaxial * 0.9}
        color="#fff8f0"
        castShadow={false}
      />

      {/* Oblique / side illumination for surface detail and shadows */}
      <directionalLight position={[18, 12, 22]} intensity={intensities.oblique} color="#fff5e6" />
      <directionalLight
        position={[-14, -8, 18]}
        intensity={intensities.oblique * 0.7}
        color="#e8f0ff"
      />

      {/* Fill light */}
      <pointLight position={[5, 5, 15]} intensity={0.25} color="#aaccff" />

      {/* Rim / back light — outlines the sphere's silhouette against the background,
          the classic third point of 3-point lighting that makes a sphere read as
          a sphere instead of a flat, front-lit disc. */}
      <directionalLight position={[-6, 10, -20]} intensity={0.35} color="#cfe8ff" />

      {/* Subtle red reflex contribution (retina glow when coaxial light is strong) */}
      {intensities.redReflex > 0.3 && (
        <pointLight
          position={[0, 0, -8]}
          intensity={intensities.redReflex * 0.35}
          color="#ff4444"
          distance={25}
        />
      )}
    </>
  );
}
