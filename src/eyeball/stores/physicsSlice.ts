import type { StateCreator } from 'zustand';
import type { SimulationState } from './simulationStore';
import { biomechanics } from '../../../packages/physics-engine/src';
import type { LayerId } from '../../../packages/anatomy-engine/types/anatomy';
import type { Vec3 } from '../types';

export interface PhysicsSlice {
  physicsEnabled: boolean;
  capsuleDeformationIntensity: number;

  togglePhysics: () => void;
  setPhysicsEnabled: (enabled: boolean) => void;
  applyTissueDeformation: (layerId: LayerId, point: Vec3, force: Vec3, intensity?: number) => void;
  startTissueTear: (layerId: LayerId, point: Vec3) => void;
  resetPhysics: () => void;
}

export const createPhysicsSlice: StateCreator<SimulationState, [], [], PhysicsSlice> = (set) => ({
  physicsEnabled: true,
  capsuleDeformationIntensity: 0,

  togglePhysics: () => {
    const enabled = !biomechanics.getConfig().enabled;
    biomechanics.setEnabled(enabled);
    set({ physicsEnabled: enabled });
  },

  setPhysicsEnabled: (enabled) => {
    biomechanics.setEnabled(enabled);
    set({ physicsEnabled: enabled });
  },

  applyTissueDeformation: (layerId, point, force, intensity = 1.0) => {
    biomechanics.applyDeformation(layerId, point, force, intensity);
    set({ capsuleDeformationIntensity: biomechanics.getDeformation('lens-capsule')?.intensity ?? 0 });
  },

  startTissueTear: (layerId, point) => {
    biomechanics.startTear(layerId, point);
  },

  resetPhysics: () => {
    biomechanics.reset();
    set({ capsuleDeformationIntensity: 0 });
  },
});
