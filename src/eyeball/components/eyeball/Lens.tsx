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

  return (
    <group position={[0, 0, 4.5]}> {/* Positioned behind iris, inside anterior chamber */}
      {/* Lens Capsule - thin transparent outer layer */}
      <mesh geometry={capsuleGeometry}>
        <meshPhysicalMaterial
          color="#f0f8ff"
          transparent
          opacity={0.55}
          roughness={0.1}
          metalness={0.15}
          clearcoat={0.9}
          clearcoatRoughness={0.08}
          transmission={0.6}
          thickness={0.3}
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
