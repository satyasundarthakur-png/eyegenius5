import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../stores/simulationStore';

/**
 * useFluidics (Step 6)
 * Runs fluidics simulation every frame when enabled.
 */
export function useFluidics() {
  const updateFluidics = useSimulationStore((s) => s.updateFluidics);
  const fluidicsEnabled = useSimulationStore((s) => s.fluidicsEnabled);

  useFrame((_, delta) => {
    if (fluidicsEnabled) {
      updateFluidics(delta);
    }
  });
}
