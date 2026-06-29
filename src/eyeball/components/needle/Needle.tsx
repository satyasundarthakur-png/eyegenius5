import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useNeedlePose } from '../../hooks/useNeedlePose';
import { NeedleShaft } from './NeedleShaft';
import { InstrumentTip } from './InstrumentTip';
import { NeedleHolder } from './NeedleHolder';
import { useSimulationStore } from '../../stores/simulationStore';
import { COLORS } from '../../constants';

// How much of the needle shaft is visible outside the eyeball (mm)
const OUTSIDE_LENGTH = 15;

export function Needle() {
  const groupRef = useRef<THREE.Group>(null);
  const pose = useNeedlePose();
  const currentInstrument = useSimulationStore((s) => s.currentInstrument);
  const instrumentColor = currentInstrument?.getConfig().color;
  const tipDescriptor = currentInstrument?.getTipGeometry() ?? null;

  useEffect(() => {
    if (!groupRef.current || !pose) return;
    groupRef.current.matrix.fromArray(Array.from(pose.needleTransform));
    groupRef.current.matrixWorldNeedsUpdate = true;
  }, [pose]);

  if (!pose) return null;

  const d = pose.insertionDepth;
  // Total shaft length: visible outside + insertion inside
  const totalShaftLength = OUTSIDE_LENGTH + d;

  return (
    <group ref={groupRef} matrixAutoUpdate={false}>
      {/* Shaft extends from -OUTSIDE_LENGTH to +d along local z */}
      <NeedleShaft length={totalShaftLength} offset={-(OUTSIDE_LENGTH - d) / 2} color={instrumentColor} />
      {/* Instrument-specific tip at +d along local z (relative to RCM origin) */}
      <InstrumentTip position={[0, 0, d]} descriptor={tipDescriptor} color={instrumentColor ?? COLORS.needleShaft} />
      {/* Needle holder at the proximal end (-OUTSIDE_LENGTH) */}
      <NeedleHolder position={[0, 0, -OUTSIDE_LENGTH]} />
    </group>
  );
}
