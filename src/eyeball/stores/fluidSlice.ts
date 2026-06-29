import type { StateCreator } from 'zustand';
import type { SimulationState } from './simulationStore';
import { fluidics, type FluidicsState } from '../../packages/fluid-engine/src';

export interface FluidSlice {
  fluidics: FluidicsState;
  fluidicsEnabled: boolean;

  updateFluidics: (deltaTime: number) => void;
  setFluidicsVacuum: (level: number) => void;
  injectViscoelastic: (amount: number) => void;
  toggleFluidics: () => void;
  resetFluidics: () => void;
}

export const createFluidSlice: StateCreator<SimulationState, [], [], FluidSlice> = (set, get) => ({
  fluidics: fluidics.getState(),
  fluidicsEnabled: true,

  updateFluidics: (deltaTime) => {
    const currentInstrument = get().currentInstrument;
    const pose = currentInstrument?.getState().pose;
    const instrumentActive = !!pose && pose.insertionDepth > 0.1;
    const type = currentInstrument?.getType();

    fluidics.update(deltaTime, instrumentActive, type);
    set({ fluidics: fluidics.getState() });
  },

  setFluidicsVacuum: (level) => {
    fluidics.setVacuum(level);
    set({ fluidics: fluidics.getState() });
  },

  injectViscoelastic: (amount) => {
    fluidics.injectViscoelastic(amount);
    set({ fluidics: fluidics.getState() });
  },

  toggleFluidics: () => {
    const enabled = !fluidics.getConfig().enabled;
    fluidics.setEnabled(enabled);
    set({ fluidicsEnabled: enabled });
  },

  resetFluidics: () => {
    fluidics.reset();
    set({ fluidics: fluidics.getState() });
  },
});
