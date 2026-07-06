import type { StateCreator } from "zustand";
import type { SimulationState } from "./simulationStore";

export interface UISlice {
  /** Whether the HUD panel sidebars + 3-D coordinate labels are visible.
   *  False = clean surgical view (default). Toggled by the ☰ Help button. */
  showHUD: boolean;
  setShowHUD: (v: boolean) => void;
  toggleHUD: () => void;

  /** Visualization toggles — controlled from the Settings panel and read by Scene.tsx. */
  showSafetyCone: boolean;
  setShowSafetyCone: (v: boolean) => void;
  showNormalIndicator: boolean;
  setShowNormalIndicator: (v: boolean) => void;
}

export const createUISlice: StateCreator<SimulationState, [], [], UISlice> = (set, get) => ({
  showHUD: false,
  setShowHUD: (v) => {
    set({ showHUD: v });
  },
  toggleHUD: () => {
    set({ showHUD: !get().showHUD });
  },

  showSafetyCone: true,
  setShowSafetyCone: (v) => {
    set({ showSafetyCone: v });
  },
  showNormalIndicator: true,
  setShowNormalIndicator: (v) => {
    set({ showNormalIndicator: v });
  },
});
