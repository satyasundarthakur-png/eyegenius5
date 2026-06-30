import * as THREE from 'three';
import { useMemo } from 'react';
import { eyeAnatomy } from '../../../../packages/anatomy-engine/src/EyeAnatomy';

/**
 * Anatomically improved Lens assembly (Step 2)
 *
 * Renders:
 * - Lens Capsule (very thin outer membrane)
 * - Lens Cortex
 * - Lens Nucleus (denser central core)
 * - CapsularReflex — the bright, glistening specular highlight that a real
 *   anterior lens capsule shows under coaxial microscope light. Without this,
 *   the capsule's 0.55-opacity transmissive shell blends into the cortex
 *   behind it and effectively disappears from the operative view, which is
 *   what made the lens look "capsule-less" through the dilated pupil.
 *
 * Positioned inside the anterior chamber, behind the iris.
 * Uses data from the anatomy-engine for future consistency with deformation & cutting.
 *
 * Visual style kept close to medical illustration / surgical microscope view.
 */
export function Lens() {
  const capsuleData = eyeAnatomy.getLayerRenderData('lens-capsule');
  const cortexData = eyeAnatomy.getLayerRenderData('cortex');
  const nucleusData = eyeAnatomy.getLayerRenderData('nucleus');

  const capsuleGeometry = useMemo(() => {
    if (capsuleData) return capsuleData.geometry;
    // Fallback biconvex
    const g = new THREE.SphereGeometry(5.0, 32, 32);
    g.scale(1, 1, 0.6);
    return g;
  }, [capsuleData]);

  const cortexGeometry = useMemo(() => {
    if (cortexData) return cortexData.geometry;
    const g = new THREE.SphereGeometry(4.8, 32, 32);
    g.scale(1, 1, 0.62);
    return g;
  }, [cortexData]);

  const nucleusGeometry = useMemo(() => {
    if (nucleusData) return nucleusData.geometry;
    const g = new THREE.SphereGeometry(3.2, 28, 28);
    g.scale(1, 1, 0.7);
    return g;
  }, [nucleusData]);

  // Capsular reflex — a thin bright ring just inside the capsule's anterior
  // equator, simulating the glistening specular highlight a real anterior
  // lens capsule shows under coaxial light. This is what makes a capsule
  // visually register as "a capsule" rather than disappearing into the
  // cortex behind it. Radius matches the capsule's approximate equatorial
  // extent (capsule fallback sphere radius 5.0, scaled 0.6 on z — at the
  // anterior-most point the cross-section radius is close to the full 5.0).
  const reflexGeometry = useMemo(() => {
    const geo = new THREE.TorusGeometry(4.3, 0.12, 10, 64);
    return geo;
  }, []);

  return (
    <group position={[0, 0, 4.5]}> {/* Positioned behind iris, inside anterior chamber */}
      {/* Lens Capsule - thin transparent outer layer */}
      <mesh geometry={capsuleGeometry}>
        <meshPhysicalMaterial
          color="#f0f8ff"
          transparent
          opacity={0.6}
          roughness={0.08}
          metalness={0.18}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          transmission={0.55}
          thickness={0.3}
        />
      </mesh>

      {/* Capsular reflex — glistening anterior-capsule highlight ring, always
          visible (unlike CapsulorhexisGuide, which only appears during the
          rhexis curriculum step and uses a distinct warm-yellow pulsing color
          to mark the target zone rather than the capsule's natural sheen). */}
      <mesh geometry={reflexGeometry} position={[0, 0, 0.95]}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.35}
          toneMapped={false}
        />
      </mesh>

      {/* Lens Cortex - main refractive body */}
      <mesh geometry={cortexGeometry}>
        <meshPhysicalMaterial
          color="#f8f0e8"
          transparent
          opacity={0.75}
          roughness={0.12}
          metalness={0.08}
          clearcoat={0.7}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Nucleus - denser central core (visible in mature cataracts) */}
      <mesh geometry={nucleusGeometry}>
        <meshPhysicalMaterial
          color="#e8d8c0"
          transparent
          opacity={0.9}
          roughness={0.25}
          metalness={0.05}
          clearcoat={0.5}
        />
      </mesh>
    </group>
  );
}
