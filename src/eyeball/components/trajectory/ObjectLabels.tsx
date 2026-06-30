import { Html } from '@react-three/drei';
import { useSimulationStore } from '../../stores/simulationStore';
import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * 3D annotations showing real-time spatial information (RCM point,
 * needle tip coordinates, tilt angles).
 *
 * Gated on `showHUD` — these are coordinate/debug overlays, not part of
 * the clean surgical field. They were previously always rendered, which
 * meant the "Tip" label sat centered directly on top of the needle tip
 * during active surgery, covering the exact point the surgeon needs to
 * see clearly. They now only appear when the ☰ Help panel is open, and
 * even then are offset away from the tip rather than centered on it.
 */
export function ObjectLabels() {
  const showHUD = useSimulationStore((s) => s.showHUD);
  const rcmPoint = useSimulationStore((s) => s.rcmPoint);
  const surfaceNormal = useSimulationStore((s) => s.surfaceNormal);
  const tiltAlpha = useSimulationStore((s) => s.tiltAlpha);
  const tiltBeta = useSimulationStore((s) => s.tiltBeta);
  const insertionDepth = useSimulationStore((s) => s.insertionDepth);

  const tipPosition = useMemo(() => {
    if (!rcmPoint || !surfaceNormal) return null;

    const normal = new THREE.Vector3(...surfaceNormal);
    const up = new THREE.Vector3(0, 0, 1);
    const right = new THREE.Vector3().crossVectors(normal, up).normalize();

    const direction = normal.clone();
    direction.applyAxisAngle(right, tiltAlpha);
    direction.applyAxisAngle(normal, tiltBeta);

    const tip = new THREE.Vector3(...rcmPoint).add(direction.clone().multiplyScalar(insertionDepth));
    return [tip.x, tip.y, tip.z] as [number, number, number];
  }, [rcmPoint, surfaceNormal, tiltAlpha, tiltBeta, insertionDepth]);

  // Hidden entirely outside the HUD-open state — never covers the tip
  // during the clean surgical view.
  if (!showHUD || !rcmPoint || !tipPosition) return null;

  // Offset vector — pushes each label up and to the right of its anchor
  // point so the label box never sits directly on top of the geometry
  // it describes; it points at it instead, like a leader line.
  const LABEL_OFFSET = new THREE.Vector3(1.2, 1.8, 0);

  const rcmLabelPos = new THREE.Vector3(...rcmPoint).add(LABEL_OFFSET);
  const tipLabelPos = new THREE.Vector3(...tipPosition).add(LABEL_OFFSET);
  const tiltLabelPos = new THREE.Vector3(...tipPosition).add(new THREE.Vector3(1.2, 3.6, 0));

  return (
    <>
      {/* RCM Point Label — offset, not centered on the marker */}
      <Html position={rcmLabelPos} center={false} distanceFactor={8} zIndexRange={[0, 0]}>
        <div className="pointer-events-none -translate-y-1/2 rounded bg-blue-950/90 px-2 py-1 text-[10px] text-blue-100 shadow-lg backdrop-blur-sm border border-blue-500/30">
          <div className="font-semibold text-blue-400">RCM Point</div>
          <div className="font-mono">
            [{rcmPoint[0].toFixed(1)}, {rcmPoint[1].toFixed(1)}, {rcmPoint[2].toFixed(1)}]
          </div>
        </div>
      </Html>

      {/* Needle Tip Label — offset up-right of the actual tip, never covering it */}
      <Html position={tipLabelPos} center={false} distanceFactor={8} zIndexRange={[0, 0]}>
        <div className="pointer-events-none -translate-y-1/2 rounded bg-red-950/90 px-2 py-1 text-[10px] text-red-100 shadow-lg backdrop-blur-sm border border-red-500/30">
          <div className="font-semibold text-red-400">Tip</div>
          <div className="font-mono">
            [{tipPosition[0].toFixed(1)}, {tipPosition[1].toFixed(1)}, {tipPosition[2].toFixed(1)}]
          </div>
          <div className="mt-1 text-red-300">Depth: {insertionDepth.toFixed(1)}mm</div>
        </div>
      </Html>

      {/* Tilt Angles Label — stacked further above so it doesn't collide with Tip label */}
      {insertionDepth > 0 && (
        <Html position={tiltLabelPos} center={false} distanceFactor={10} zIndexRange={[0, 0]}>
          <div className="pointer-events-none -translate-y-1/2 rounded bg-amber-950/90 px-2 py-1 text-[10px] text-amber-100 shadow-lg backdrop-blur-sm border border-amber-500/30">
            <div className="font-semibold text-amber-400">Tilt</div>
            <div className="font-mono">
              α: {(tiltAlpha * (180 / Math.PI)).toFixed(1)}°
            </div>
            <div className="font-mono">
              β: {(tiltBeta * (180 / Math.PI)).toFixed(1)}°
            </div>
          </div>
        </Html>
      )}
    </>
  );
}
