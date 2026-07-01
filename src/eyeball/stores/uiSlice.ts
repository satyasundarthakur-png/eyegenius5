import type { StateCreator } from "zustand";
import type { SimulationState } from "./simulationStore";

export interface UISlice {
  /** Whether the HUD panel sidebars + 3-D coordinate labels are visible.
   *  False = clean surgical view (default). Toggled by the ☰ Help button. */
  showHUD: boolean;
  setShowHUD: (v: boolean) => void;
  toggleHUD: () => void;
}

export const createUISlice: StateCreator<SimulationState, [], [], UISlice> = (set, get) => ({
  showHUD: false,
  setShowHUD: (v) => {
    set({ showHUD: v });
  },
  toggleHUD: () => {
    set({ showHUD: !get().showHUD });
  },
});
