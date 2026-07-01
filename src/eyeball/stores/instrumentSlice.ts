import type { StateCreator } from "zustand";
import type { SimulationState } from "./simulationStore";
import {
  Instrument,
  Keratome,
  CapsulorhexisForceps,
  HydrodissectionCannula,
  PhacoTip,
  IrrigationAspiration,
  IOLInjector,
  Vitrector,
  Endolaser,
  MicroForceps,
} from "../../../packages/instrument-engine/src";
import type { InstrumentType } from "../../../packages/instrument-engine/src/types/instrument";

export interface InstrumentSlice {
  currentInstrument: Instrument | null;
  availableInstruments: Instrument[];

  setCurrentInstrument: (type: InstrumentType) => void;
  switchToInstrument: (instrument: Instrument) => void;
  updateCurrentInstrumentPose: (alpha: number, beta: number, depth: number) => void;
  setInstrumentRCM: (rcmPoint: [number, number, number], normal: [number, number, number]) => void;
  clearInstrumentRCM: () => void;
}

const createDefaultInstruments = (): Instrument[] => [
  new Keratome(),
  new CapsulorhexisForceps(),
  new HydrodissectionCannula(),
  new PhacoTip(),
  new IrrigationAspiration(),
  new IOLInjector(),
  new Vitrector(),
  new Endolaser(),
  new MicroForceps(),
];

export const createInstrumentSlice: StateCreator<SimulationState, [], [], InstrumentSlice> = (
  set,
  get,
) => {
  const defaultInstruments = createDefaultInstruments();

  return {
    currentInstrument: defaultInstruments[0], // Start with Keratome (backward compatible with old needle behavior)
    availableInstruments: defaultInstruments,

    setCurrentInstrument: (type) => {
      const instruments = get().availableInstruments;
      const found = instruments.find((i) => i.getType() === type);
      if (found) {
        // Deactivate previous instrument
        const previous = get().currentInstrument;
        if (previous) previous.setActive(false);

        found.setActive(true);

        // ── Critical: transfer the placed RCM to the new instrument ──────
        // Without this, computePose() returns null on every instrument switch,
        // the 3D needle freezes, and fluidics never sees instrumentActive=true.
        const { rcmPoints, currentRCMIndex } = get();
        const currentRCM = rcmPoints[currentRCMIndex];
        if (currentRCM) {
          found.setRCM(currentRCM.point, currentRCM.normal);
        }

        set({ currentInstrument: found });
      }
    },

    switchToInstrument: (instrument) => {
      const previous = get().currentInstrument;
      if (previous) {
        previous.setActive(false);
      }
      instrument.setActive(true);
      set({ currentInstrument: instrument });
    },

    updateCurrentInstrumentPose: (alpha, beta, depth) => {
      const inst = get().currentInstrument;
      if (!inst) return;

      const pose = inst.computePose(alpha, beta, depth);
      if (pose) {
        inst.updatePose(pose);
        set({ currentInstrument: inst }); // trigger reactivity
      }
    },

    setInstrumentRCM: (rcmPoint, normal) => {
      const inst = get().currentInstrument;
      if (inst) {
        inst.setRCM(rcmPoint, normal);
        set({ currentInstrument: inst });
      }
    },

    clearInstrumentRCM: () => {
      const inst = get().currentInstrument;
      if (inst) {
        inst.clearRCM();
        set({ currentInstrument: inst });
      }
    },
  };
};
