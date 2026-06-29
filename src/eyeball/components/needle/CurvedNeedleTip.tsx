import { useMemo } from 'react';
import * as THREE from 'three';
import { useCollisionDetection } from '../../hooks/useCollisionDetection';
import { useInsertionForce } from '../../hooks/useInsertionForce';
import { forceToColor } from '../../lib/forceColor';

interface CurvedNeedleTipProps {
  position: [number, number, number];
}

/**
 * Curved surgical needle tip with force feedback visualization.
 *
 * Color encodes simulated insertion force:
 * - silver = low force (shallow / low tilt)
 * - pink/orange = moderate force
 * - deep red = high force (deep insertion / high tilt)
 *
 * Additionally glows when colliding with eyeball surface.
 *
 * Used as the default/fallback tip when no specific surgical instrument is
 * selected (legacy single-needle RCM trainer mode).
 */
export function CurvedNeedleTip({ position }: CurvedNeedleTipProps) {
  const { isColliding } = useCollisionDetection();
  const force = useInsertionForce();

  const geometry = useMemo(() => {
    // Create a curved path (180° semi-circle)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0), // Start (connection to shaft)
      new THREE.Vector3(0, 0.5, 0.4), // Control point 1
      new THREE.Vector3(0, 1.0, 0.7), // Control point 2
      new THREE.Vector3(0, 1.5, 0.85), // Control point 3
      new THREE.Vector3(0, 2.0, 0.9), // Control point 4
      new THREE.Vector3(0, 2.5, 0.85), // Control point 5
      new THREE.Vector3(0, 3.0, 0.7), // Control point 6 (tip)
    ]);

    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.15, 12, false);

    // Manually taper the radius along the tube to create pointed tip
    const positions = tubeGeometry.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i);

      const curvePosition = i / (positions.count / 12);
      const taperFactor = 1 - curvePosition * 0.8;

      vertex.multiplyScalar(taperFactor);
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    tubeGeometry.computeVertexNormals();

    return tubeGeometry;
  }, []);

  const tipColor = forceToColor(force);

  return (
    <mesh geometry={geometry} position={position}>
      <meshStandardMaterial
        color={tipColor}
        metalness={0.9}
        roughness={0.1}
        emissive={isColliding ? '#ff3300' : tipColor}
        emissiveIntensity={isColliding ? 0.5 : 0.1}
      />
    </mesh>
  );
}
