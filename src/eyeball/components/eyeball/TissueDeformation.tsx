import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSimulationStore } from "../../stores/simulationStore";
import { biomechanics } from "../../../../packages/physics-engine/src/Biomechanics";

/**
 * TissueDeformation (enhanced in Step 5)
 *
 * Shows realistic elastic indentation at the RCM point.
 * Now also reacts to capsule deformation from the biomechanics engine
 * when instruments interact with the lens capsule.
 */
export function TissueDeformation() {
  const meshRef = useRef<THREE.Mesh>(null);
  const rcmPoint = useSimulationStore((s) => s.rcmPoint);
  const surfaceNormal = useSimulationStore((s) => s.surfaceNormal);
  const insertionDepth = useSimulationStore((s) => s.insertionDepth);
  const physicsEnabled = useSimulationStore((s) => s.physicsEnabled);

  const geometry = useMemo(() => {
    return new THREE.RingGeometry(0.25, 1.1, 48);
  }, []);

  useFrame(() => {
    if (!meshRef.current || !rcmPoint || !surfaceNormal) return;

    const capsuleDef = biomechanics.getDeformation("lens-capsule");
    const deformationScale = capsuleDef ? 1 + capsuleDef.intensity * 0.6 : 1;

    // Position at RCM point with slight offset
    const offset = 0.08;
    meshRef.current.position.set(
      rcmPoint[0] + surfaceNormal[0] * offset,
      rcmPoint[1] + surfaceNormal[1] * offset,
      rcmPoint[2] + surfaceNormal[2] * offset,
    );

    // Scale deformation ring based on insertion + capsule elasticity
    const baseScale = 0.6 + insertionDepth * 0.08;
    meshRef.current.scale.setScalar(baseScale * deformationScale);

    // Subtle color change when physics deformation is active
    if ("color" in meshRef.current.material) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.color.set(physicsEnabled && capsuleDef ? "#ffaa66" : "#4488ff");
    }
    // Face outward along the surface normal
    meshRef.current.lookAt(
      rcmPoint[0] + surfaceNormal[0] * 2,
      rcmPoint[1] + surfaceNormal[1] * 2,
      rcmPoint[2] + surfaceNormal[2] * 2,
    );

    // Opacity based on insertion depth (scale already set above from biomechanics)
    const maxDepth = 18;
    const depthRatio = Math.min(insertionDepth / maxDepth, 1);
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.opacity = 0.1 + depthRatio * 0.4;
  });

  if (!rcmPoint || !surfaceNormal) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color="#cc4444"
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
