import type { StateCreator } from 'zustand';
import type { SimulationState } from './simulationStore';
import { microscope, type MicroscopeState } from '../../../packages/microscope-engine/src/Microscope';

export interface MicroscopeSlice {
  microscope: MicroscopeState;
  setMicroscopeZoom: (zoom: number) => void;
  setMicroscopeFocus: (focus: number) => void;
  setMicroscopeRedReflex: (intensity: number) => void;
  setMicroscopeCoaxial: (intensity: number) => void;
  setMicroscopeOblique: (intensity: number) => void;
  setMicroscopeDepthOfField: (dof: number) => void;
  toggleMicroscope: () => void;
  resetMicroscope: () => void;
}

export const createMicroscopeSlice: StateCreator<SimulationState, [], [], MicroscopeSlice> = (set) => ({
  microscope: microscope.getState(),

  setMicroscopeZoom: (zoom) => {
    microscope.setZoom(zoom);
    set({ microscope: microscope.getState() });
  },

  setMicroscopeFocus: (focus) => {
    microscope.setFocus(focus);
    set({ microscope: microscope.getState() });
  },

  setMicroscopeRedReflex: (intensity) => {
    microscope.setRedReflexIntensity(intensity);
    set({ microscope: microscope.getState() });
  },

  setMicroscopeCoaxial: (intensity) => {
    microscope.setCoaxialIntensity(intensity);
    set({ microscope: microscope.getState() });
  },

  setMicroscopeOblique: (intensity) => {
    microscope.setObliqueIntensity(intensity);
    set({ microscope: microscope.getState() });
  },

  setMicroscopeDepthOfField: (dof) => {
    microscope.setDepthOfField(dof);
    set({ microscope: microscope.getState() });
  },

  toggleMicroscope: () => {
    const current = microscope.getState().enabled;
    microscope.setEnabled(!current);
    set({ microscope: microscope.getState() });
  },

  resetMicroscope: () => {
    microscope.reset();
    set({ microscope: microscope.getState() });
  },
});
