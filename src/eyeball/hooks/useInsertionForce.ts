import { useMemo } from 'react';
import { MAX_INSERTION_DEPTH, MAX_TILT_ANGLE } from '../constants';
import { useSimulationStore } from '../stores/simulationStore';

/**
 * Simulated contact force (0-1), combining insertion depth ratio (60% weight)
 * and tilt angle ratio (40% weight). Used to drive tip color/glow feedback
 * across all instrument tip visualizations.
 */
export function useInsertionForce(): number {
  const insertionDepth = useSimulationStore((s) => s.insertionDepth);
  const tiltAlpha = useSimulationStore((s) => s.tiltAlpha);

  return useMemo(() => {
    const depthRatio = insertionDepth / MAX_INSERTION_DEPTH;
    const tiltRatio = Math.abs(tiltAlpha) / MAX_TILT_ANGLE;
    return Math.min(1, depthRatio * 0.6 + tiltRatio * 0.4);
  }, [insertionDepth, tiltAlpha]);
}
